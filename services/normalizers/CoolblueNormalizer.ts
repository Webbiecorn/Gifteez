/**
 * Coolblue Feed Normalizer
 *
 * Normalizes Coolblue affiliate feed items to unified product structure
 */

import { logger } from '../../lib/logger'
import { BaseNormalizer } from './BaseNormalizer'
import type {
  RawFeedItem,
  NormalizationResult,
  NormalizedProduct,
} from '../../types/normalizedProduct'

export class CoolblueNormalizer extends BaseNormalizer {
  constructor() {
    super('coolblue')
  }

  /**
   * Normalize Coolblue feed item
   *
   * Expected Coolblue feed structure:
   * {
   *   product_id: string,
   *   product_name: string,
   *   description: string,
   *   price: string | number,
   *   old_price?: string | number,
   *   image_url: string,
   *   product_url: string,
   *   deeplink_url: string,
   *   brand_name?: string,
   *   category: string,
   *   in_stock: boolean | string,
   *   delivery_time?: string
   * }
   */
  normalize(rawItem: RawFeedItem): NormalizationResult {
    try {
      // Extract and validate required fields
      const merchantProductId = String(rawItem.product_id || rawItem.id)
      if (!merchantProductId) {
        return this.createResult(
          false,
          undefined,
          ['Missing product_id'],
          undefined,
          true,
          'No product ID'
        )
      }

      const name = String(rawItem.product_name || rawItem.name || '').trim()
      if (!name) {
        return this.createResult(
          false,
          undefined,
          ['Missing product_name'],
          undefined,
          true,
          'No product name'
        )
      }

      // Parse price
      let currentPrice: number
      let originalPrice: number | undefined

      try {
        currentPrice = this.parsePrice(rawItem.price)

        if (rawItem.old_price) {
          originalPrice = this.parsePrice(rawItem.old_price)
        }
      } catch (error) {
        return this.createResult(false, undefined, [`Invalid price: ${error}`])
      }

      // Generate unique ID
      const merchantId = 'coolblue'
      const productId = this.generateProductId(merchantId, merchantProductId)

      // Sanitize description
      const descriptionRaw = String(rawItem.description || rawItem.short_description || '')
      const { plain: description, html: descriptionHtml } = this.sanitizeDescription(
        descriptionRaw,
        true
      )

      // Parse availability
      let availability: NormalizedProduct['availability'] = 'unknown'
      if (rawItem.in_stock === true || rawItem.in_stock === 'true' || rawItem.in_stock === '1') {
        availability = 'in_stock'
      } else if (
        rawItem.in_stock === false ||
        rawItem.in_stock === 'false' ||
        rawItem.in_stock === '0'
      ) {
        availability = 'out_of_stock'
      }

      // Extract categories
      const categories = this.extractCategories(rawItem.category || rawItem.categories || '')

      // Pre-validate URLs and images
      const productUrl = String(rawItem.product_url || rawItem.url || '')
      const affiliateUrl = String(
        rawItem.deeplink_url ||
          rawItem.deeplink ||
          rawItem.affiliate_url ||
          rawItem.product_url ||
          ''
      )
      const primaryImage = String(rawItem.image_url || rawItem.image || '')

      // Build normalized product
      const product: NormalizedProduct = {
        id: productId,
        merchantId: merchantId,
        merchantProductId: merchantProductId,

        name: name,
        description: description,
        descriptionHtml: descriptionHtml,
        brand: rawItem.brand_name || rawItem.brand || undefined,

        price: {
          current: currentPrice,
          original: originalPrice,
          currency: 'EUR',
          formatted: this.formatPrice(currentPrice, 'EUR'),
        },

        availability: availability,
        stock: {
          lastUpdated: Date.now(),
        },

        images: {
          primary: primaryImage,
          additional: rawItem.additional_images
            ? Array.isArray(rawItem.additional_images)
              ? rawItem.additional_images
              : [rawItem.additional_images]
            : undefined,
        },

        categories: categories,
        tags: this.extractTags(name, description, categories),

        url: productUrl,
        affiliateUrl: affiliateUrl,

        retailer: {
          name: 'Coolblue',
          id: 'coolblue',
          logo: '/images/retailers/coolblue-logo.png',
          rating: 4.8,
        },

        metadata: {
          sourceType: 'coolblue',
          sourceId: rawItem.feed_id || undefined,
          lastUpdated: Date.now(),
          lastPriceCheck: Date.now(),
          feedVersion: rawItem.feed_version || undefined,
        },

        computed: {
          discountPercentage: originalPrice
            ? this.calculateDiscount(currentPrice, originalPrice)
            : undefined,
          isOnSale: Boolean(originalPrice && originalPrice > currentPrice),
          popularityScore: this.calculatePopularityScore(rawItem),
        },

        validated: {
          hasValidPrice: currentPrice > 0,
          hasValidImage: this.isValidImageUrl(primaryImage),
          hasValidUrl: this.isValidUrl(productUrl),
          lastValidated: Date.now(),
        },
      }

      // Validate product
      const validation = this.validateProduct(product)

      if (!validation.isValid) {
        return this.createResult(false, undefined, validation.errors, validation.warnings)
      }

      // Log result
      this.logResult({ success: true, product, warnings: validation.warnings }, rawItem)

      return this.createResult(true, product, undefined, validation.warnings)
    } catch (error) {
      logger.error('Coolblue normalization error', { error, rawItem })
      return this.createResult(false, undefined, [String(error)])
    }
  }

  /**
   * Extract searchable tags from product data
   */
  private extractTags(name: string, description: string, categories: string[]): string[] {
    const tags = new Set<string>()

    // Add categories as tags
    categories.forEach((cat) => tags.add(cat.toLowerCase()))

    // Extract keywords from name and description
    const text = `${name} ${description}`.toLowerCase()
    const keywords = text.match(/\b\w{4,}\b/g) || []

    // Common gift-related keywords
    const giftKeywords = ['cadeau', 'gift', 'present', 'kado', 'relatiegeschenk']
    keywords.forEach((word) => {
      if (giftKeywords.some((kw) => word.includes(kw))) {
        tags.add(word)
      }
    })

    return Array.from(tags).slice(0, 20) // Limit to 20 tags
  }

  /**
   * Calculate popularity score based on feed data
   */
  private calculatePopularityScore(rawItem: RawFeedItem): number {
    let score = 0

    // Has reviews
    if (rawItem.reviews_count && Number(rawItem.reviews_count) > 0) {
      score += Math.min(Number(rawItem.reviews_count) / 10, 30)
    }

    // Has rating
    if (rawItem.rating && Number(rawItem.rating) > 0) {
      score += Number(rawItem.rating) * 10
    }

    // On sale
    if (rawItem.old_price && Number(rawItem.old_price) > Number(rawItem.price)) {
      score += 20
    }

    // In stock
    if (rawItem.in_stock) {
      score += 10
    }

    return Math.min(score, 100) // Max score of 100
  }
}
