/**
 * Feed Processor Service
 *
 * Orchestrates feed normalization, deduplication, and validation
 * Processes product feeds from multiple sources and normalizes them
 */

import { cache } from '../lib/cache'
import { logger } from '../lib/logger'
import { AwinNormalizer } from './normalizers/AwinNormalizer'
import { CoolblueNormalizer } from './normalizers/CoolblueNormalizer'
import { SlygadNormalizer } from './normalizers/SlygadNormalizer'
import type { NormalizedProduct, RawFeedItem, FeedMetadata } from '../types/normalizedProduct'

export interface ProcessedFeed {
  products: NormalizedProduct[]
  metadata: FeedMetadata
  duplicates: string[]
  errors: Array<{ item: any; error: string }>
}

class FeedProcessorService {
  private normalizers = {
    coolblue: new CoolblueNormalizer(),
    awin: new AwinNormalizer(),
    slygad: new SlygadNormalizer(),
  }

  private deduplicationCache = new Map<string, boolean>()

  /**
   * Process a feed from a specific source
   */
  async processFeed(
    feedId: string,
    feedName: string,
    feedType: 'coolblue' | 'awin' | 'slygad',
    rawItems: RawFeedItem[]
  ): Promise<ProcessedFeed> {
    const startTime = Date.now()

    logger.info(`Processing feed: ${feedName}`, {
      feedId,
      feedType,
      totalItems: rawItems.length,
    })

    const products: NormalizedProduct[] = []
    const duplicates: string[] = []
    const errors: Array<{ item: any; error: string }> = []

    // Get appropriate normalizer
    const normalizer = this.normalizers[feedType]

    if (!normalizer) {
      throw new Error(`Unknown feed type: ${feedType}`)
    }

    // Clear deduplication cache for fresh processing
    this.deduplicationCache.clear()

    // Process each item
    for (const rawItem of rawItems) {
      try {
        // Normalize item
        const result = normalizer.normalize(rawItem)

        if (!result.success) {
          if (result.skipped) {
            // Skipped items (missing required fields) - not logged as errors
            continue
          }

          errors.push({
            item: rawItem,
            error: result.errors?.join(', ') || 'Unknown error',
          })
          continue
        }

        if (!result.product) {
          continue
        }

        // Check for duplicates
        const isDuplicate = this.checkDuplicate(result.product)

        if (isDuplicate) {
          duplicates.push(result.product.id)
          logger.debug('Duplicate product skipped', {
            productId: result.product.id,
            productName: result.product.name,
          })
          continue
        }

        // Add to products
        products.push(result.product)

        // Cache the product
        await this.cacheProduct(result.product)
      } catch (error) {
        logger.error('Error processing feed item', { error, rawItem })
        errors.push({
          item: rawItem,
          error: String(error),
        })
      }
    }

    const processingTime = Date.now() - startTime

    // Create metadata
    const metadata: FeedMetadata = {
      feedId,
      feedName,
      lastFetched: Date.now(),
      totalItems: rawItems.length,
      processedItems: products.length,
      failedItems: errors.length,
      duplicateItems: duplicates.length,
      processingTimeMs: processingTime,
    }

    // Log summary
    logger.info(`Feed processing complete: ${feedName}`, {
      ...metadata,
      successRate: ((products.length / rawItems.length) * 100).toFixed(1) + '%',
    })

    // Cache metadata
    await cache.set(`feed:metadata:${feedId}`, metadata, {
      ttl: 3600000, // 1 hour
      namespace: 'feeds',
    })

    return {
      products,
      metadata,
      duplicates,
      errors,
    }
  }

  /**
   * Check if product is duplicate based on merchant_id + merchant_product_id
   */
  private checkDuplicate(product: NormalizedProduct): boolean {
    // Create hash key
    const hashKey = `${product.merchantId}:${product.merchantProductId}`

    // Check if already processed
    if (this.deduplicationCache.has(hashKey)) {
      return true
    }

    // Mark as processed
    this.deduplicationCache.set(hashKey, true)
    return false
  }

  /**
   * Cache normalized product
   */
  private async cacheProduct(product: NormalizedProduct): Promise<void> {
    try {
      // Cache with product ID as key
      await cache.set(`product:${product.id}`, product, {
        ttl: 86400000, // 24 hours
        namespace: 'products',
        backend: 'indexedDB', // Use IndexedDB for large product objects
      })

      // Also cache by merchant ID for lookups
      await cache.set(
        `product:merchant:${product.merchantId}:${product.merchantProductId}`,
        product.id,
        {
          ttl: 86400000,
          namespace: 'products',
          backend: 'localStorage',
        }
      )
    } catch (error) {
      logger.error('Failed to cache product', { error, productId: product.id })
    }
  }

  /**
   * Get product from cache
   */
  async getProduct(productId: string): Promise<NormalizedProduct | null> {
    try {
      return await cache.get<NormalizedProduct>(`product:${productId}`, {
        namespace: 'products',
        backend: 'indexedDB',
      })
    } catch (error) {
      logger.error('Failed to get cached product', { error, productId })
      return null
    }
  }

  /**
   * Get product by merchant info
   */
  async getProductByMerchant(
    merchantId: string,
    merchantProductId: string
  ): Promise<NormalizedProduct | null> {
    try {
      // Get product ID from cache
      const productId = await cache.get<string>(
        `product:merchant:${merchantId}:${merchantProductId}`,
        {
          namespace: 'products',
          backend: 'localStorage',
        }
      )

      if (!productId) {
        return null
      }

      // Get full product
      return await this.getProduct(productId)
    } catch (error) {
      logger.error('Failed to get product by merchant', {
        error,
        merchantId,
        merchantProductId,
      })
      return null
    }
  }

  /**
   * Refresh product prices (for scheduled updates)
   */
  async refreshProductPrices(productIds: string[]): Promise<{
    updated: number
    failed: number
    priceChanges: Array<{ productId: string; oldPrice: number; newPrice: number }>
  }> {
    logger.info('Starting price refresh', { productCount: productIds.length })

    const results = {
      updated: 0,
      failed: 0,
      priceChanges: [] as Array<{ productId: string; oldPrice: number; newPrice: number }>,
    }

    for (const productId of productIds) {
      try {
        const product = await this.getProduct(productId)

        if (!product) {
          results.failed++
          continue
        }

        // TODO: Fetch fresh price from merchant API
        // For now, just update the lastPriceCheck timestamp
        product.metadata.lastPriceCheck = Date.now()

        await this.cacheProduct(product)
        results.updated++
      } catch (error) {
        logger.error('Failed to refresh product price', { error, productId })
        results.failed++
      }
    }

    logger.info('Price refresh complete', results)
    return results
  }

  /**
   * Clear product cache (for testing/debugging)
   */
  async clearCache(): Promise<void> {
    logger.warn('Clearing all product cache')
    this.deduplicationCache.clear()
    // Note: Actual cache clearing would need to iterate through IndexedDB/localStorage
  }

  /**
   * Get feed processing statistics
   */
  async getFeedStats(feedId: string): Promise<FeedMetadata | null> {
    try {
      return await cache.get<FeedMetadata>(`feed:metadata:${feedId}`, {
        namespace: 'feeds',
      })
    } catch (error) {
      logger.error('Failed to get feed stats', { error, feedId })
      return null
    }
  }
}

// Export singleton
export const feedProcessorService = new FeedProcessorService()

// Export class for testing
export { FeedProcessorService }
