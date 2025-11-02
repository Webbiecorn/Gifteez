/**
 * AWIN Feed Normalizer
 *
 * Normalizes AWIN affiliate network feed items to unified product structure
 * Handles multiple merchants through AWIN (various advertisers)
 */

import { logger } from '../../lib/logger'
import { BaseNormalizer } from './BaseNormalizer'
import type {
  RawFeedItem,
  NormalizationResult,
  NormalizedProduct,
} from '../../types/normalizedProduct'

export class AwinNormalizer extends BaseNormalizer {
  constructor() {
    super('awin')
  }

  /**
   * Normalize AWIN feed item
   *
   * Expected AWIN feed structure:
   * {
   *   aw_product_id: string,
   *   product_name: string,
   *   description: string,
   *   search_price: string | number,
   *   rrp_price?: string | number,
   *   aw_image_url: string,
   *   merchant_product_id: string,
   *   merchant_name: string,
   *   merchant_id: string,
   *   aw_deep_link: string,
   *   merchant_deep_link: string,
   *   brand_name?: string,
   *   category_name: string,
   *   in_stock: string | boolean,
   *   stock_quantity?: number
   * }
   */
  normalize(rawItem: RawFeedItem): NormalizationResult {
    try {
      // Extract required fields
      const awProductId = String(rawItem.aw_product_id || rawItem.product_id)
      const merchantProductId = String(rawItem.merchant_product_id || awProductId)
      const merchantId = String(rawItem.merchant_id || rawItem.advertiser_id)
      const merchantName = String(rawItem.merchant_name || rawItem.advertiser_name || 'Unknown')

      if (!awProductId) {
        return this.createResult(false, undefined, ['Missing aw_product_id'], undefined, true)
      }

      const name = String(rawItem.product_name || rawItem.name || '').trim()
      if (!name) {
        return this.createResult(false, undefined, ['Missing product_name'], undefined, true)
      }

      // Parse price
      let currentPrice: number
      let originalPrice: number | undefined

      try {
        currentPrice = this.parsePrice(rawItem.search_price || rawItem.price)

        if (rawItem.rrp_price || rawItem.original_price) {
          originalPrice = this.parsePrice(rawItem.rrp_price || rawItem.original_price)
        }
      } catch (error) {
        return this.createResult(false, undefined, [`Invalid price: ${error}`])
      }

      // Generate unique ID using AWIN merchant + product ID
      const fullMerchantId = `awin:${merchantId}`
      const productId = this.generateProductId(fullMerchantId, merchantProductId)

      // Sanitize description
      const descriptionRaw = String(rawItem.description || rawItem.product_short_description || '')
      const { plain: description, html: descriptionHtml } = this.sanitizeDescription(
        descriptionRaw,
        true
      )

      // Parse availability
      let availability: NormalizedProduct['availability'] = 'unknown'
      const inStockValue = String(rawItem.in_stock || '').toLowerCase()

      if (inStockValue === 'yes' || inStockValue === 'true' || inStockValue === '1') {
        availability = 'in_stock'
      } else if (inStockValue === 'no' || inStockValue === 'false' || inStockValue === '0') {
        availability = 'out_of_stock'
      }

      // Extract categories
      const categories = this.extractCategories(
        rawItem.category_name || rawItem.categories || rawItem.merchant_category || ''
      )

      // Pre-validate URLs and images
      const productUrl = String(rawItem.merchant_deep_link || rawItem.product_url || '')
      const affiliateUrl = String(rawItem.aw_deep_link || rawItem.deeplink || productUrl)
      const primaryImage = String(
        rawItem.aw_image_url || rawItem.image_url || rawItem.large_image || ''
      )

      // Build normalized product
      const product: NormalizedProduct = {
        id: productId,
        merchantId: fullMerchantId,
        merchantProductId: merchantProductId,

        name: name,
        description: description,
        descriptionHtml: descriptionHtml,
        brand: rawItem.brand_name || rawItem.brand || undefined,

        price: {
          current: currentPrice,
          original: originalPrice,
          currency: rawItem.currency || 'EUR',
          formatted: this.formatPrice(currentPrice, rawItem.currency || 'EUR'),
        },

        availability: availability,
        stock: {
          quantity: rawItem.stock_quantity ? Number(rawItem.stock_quantity) : undefined,
          lastUpdated: Date.now(),
        },

        images: {
          primary: primaryImage,
          additional: this.extractAdditionalImages(rawItem),
        },

        categories: categories,
        tags: this.extractTags(name, description, categories, rawItem.keywords),

        url: productUrl,
        affiliateUrl: affiliateUrl,

        retailer: {
          name: merchantName,
          id: fullMerchantId,
          logo: rawItem.merchant_logo || undefined,
          rating: this.calculateMerchantRating(rawItem),
        },

        metadata: {
          sourceType: 'awin',
          sourceId: awProductId,
          lastUpdated: Date.now(),
          lastPriceCheck: Date.now(),
          feedVersion: rawItem.data_feed_id || undefined,
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
      logger.error('AWIN normalization error', { error, rawItem })
      return this.createResult(false, undefined, [String(error)])
    }
  }

  /**
   * Extract additional images from AWIN feed
   */
  private extractAdditionalImages(rawItem: RawFeedItem): string[] | undefined {
    const images: string[] = []

    // AWIN often has alternate_image, alternate_image_two, etc.
    if (rawItem.alternate_image) images.push(String(rawItem.alternate_image))
    if (rawItem.alternate_image_two) images.push(String(rawItem.alternate_image_two))
    if (rawItem.alternate_image_three) images.push(String(rawItem.alternate_image_three))
    if (rawItem.alternate_image_four) images.push(String(rawItem.alternate_image_four))

    // Or array format
    if (rawItem.additional_images && Array.isArray(rawItem.additional_images)) {
      images.push(...rawItem.additional_images.map(String))
    }

    return images.length > 0 ? images : undefined
  }

  /**
   * Extract searchable tags
   */
  private extractTags(
    name: string,
    description: string,
    categories: string[],
    keywords?: string
  ): string[] {
    const tags = new Set<string>()

    // Add categories
    categories.forEach((cat) => tags.add(cat.toLowerCase()))

    // Add keywords if provided
    if (keywords) {
      const keywordList = keywords.split(/[,;|]/).map((k) => k.trim().toLowerCase())
      keywordList.forEach((kw) => kw && tags.add(kw))
    }

    // Extract from name/description
    const text = `${name} ${description}`.toLowerCase()
  const words: string[] = text.match(/\b\w{4,}\b/g) ?? []

    const giftKeywords = ['cadeau', 'gift', 'present', 'kado', 'relatiegeschenk']
    words.forEach((word) => {
      if (giftKeywords.some((kw) => word.includes(kw))) {
        tags.add(word)
      }
    })

    return Array.from(tags).slice(0, 20)
  }

  /**
   * Calculate merchant rating from commission/data quality
   */
  private calculateMerchantRating(rawItem: RawFeedItem): number {
    let rating = 3.5 // Default rating

    // Higher commission usually means better merchant
    if (rawItem.commission_amount && Number(rawItem.commission_amount) > 5) {
      rating += 0.5
    }

    // Has good image quality
    if (rawItem.aw_image_url && rawItem.aw_image_url.includes('large')) {
      rating += 0.3
    }

    // Has detailed description
    if (rawItem.description && rawItem.description.length > 200) {
      rating += 0.2
    }

    return Math.min(rating, 5.0)
  }

  /**
   * Calculate popularity score
   */
  private calculatePopularityScore(rawItem: RawFeedItem): number {
    let score = 50 // Base score

    // Has promotional text (likely popular)
    if (rawItem.promotional_text) {
      score += 15
    }

    // On sale
    if (rawItem.rrp_price && Number(rawItem.rrp_price) > Number(rawItem.search_price)) {
      score += 20
    }

    // In stock
    if (String(rawItem.in_stock).toLowerCase() === 'yes') {
      score += 10
    }

    // Has brand
    if (rawItem.brand_name) {
      score += 5
    }

    return Math.min(score, 100)
  }
}
