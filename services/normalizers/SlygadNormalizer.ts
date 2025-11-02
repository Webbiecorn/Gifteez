/**
 * Shop Like You Give A Damn Feed Normalizer
 *
 * Normalizes SLYGAD affiliate feed items to unified product structure
 * Focus on sustainable/ethical products
 */

import { logger } from '../../lib/logger'
import { BaseNormalizer } from './BaseNormalizer'
import type {
  RawFeedItem,
  NormalizationResult,
  NormalizedProduct,
} from '../../types/normalizedProduct'

export class SlygadNormalizer extends BaseNormalizer {
  constructor() {
    super('slygad')
  }

  /**
   * Normalize SLYGAD feed item
   *
   * Expected SLYGAD feed structure (similar to their API response):
   * {
   *   id: string,
   *   name: string,
   *   description: string,
   *   price: number,
   *   image: string,
   *   url: string,
   *   affiliate_url: string,
   *   brand: string,
   *   category: string,
   *   impact_score?: number,
   *   certifications?: string[]
   * }
   */
  normalize(rawItem: RawFeedItem): NormalizationResult {
    try {
      // Extract required fields
      const merchantProductId = String(rawItem.id || rawItem.product_id)
      if (!merchantProductId) {
        return this.createResult(false, undefined, ['Missing product id'], undefined, true)
      }

      const name = String(rawItem.name || rawItem.title || '').trim()
      if (!name) {
        return this.createResult(false, undefined, ['Missing product name'], undefined, true)
      }

      // Parse price (SLYGAD typically provides price in euros)
      let currentPrice: number

      try {
        currentPrice = this.parsePrice(rawItem.price)
      } catch (error) {
        return this.createResult(false, undefined, [`Invalid price: ${error}`])
      }

      // Generate unique ID
      const merchantId = 'slygad'
      const productId = this.generateProductId(merchantId, merchantProductId)

      // Sanitize description
      const descriptionRaw = String(rawItem.description || rawItem.short_description || '')
      const { plain: description, html: descriptionHtml } = this.sanitizeDescription(
        descriptionRaw,
        true
      )

      // SLYGAD products are typically always in stock (curated selection)
      const availability: NormalizedProduct['availability'] =
        rawItem.in_stock === false ? 'out_of_stock' : 'in_stock'

      // Extract categories (focus on sustainability categories)
      let categories = this.extractCategories(rawItem.category || rawItem.categories || '')

      // Add sustainability tags
      const sustainabilityTags = this.extractSustainabilityTags(rawItem)
      categories = [...new Set([...categories, ...sustainabilityTags])]

      // Pre-validate URLs and images
      const productUrl = String(rawItem.url || rawItem.product_url || '')
      const affiliateUrl = String(rawItem.affiliate_url || rawItem.deeplink || productUrl)
      const primaryImage = String(rawItem.image || rawItem.image_url || '')

      // Build normalized product
      const product: NormalizedProduct = {
        id: productId,
        merchantId: merchantId,
        merchantProductId: merchantProductId,

        name: name,
        description: description,
        descriptionHtml: descriptionHtml,
        brand: rawItem.brand || rawItem.brand_name || undefined,

        price: {
          current: currentPrice,
          original: undefined, // SLYGAD typically doesn't show sale prices
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
        tags: this.extractTags(name, description, categories, rawItem),

        url: productUrl,
        affiliateUrl: affiliateUrl,

        retailer: {
          name: 'Shop Like You Give A Damn',
          id: 'slygad',
          logo: '/images/retailers/slygad-logo.png',
          rating: 4.9, // High rating for curated sustainable products
        },

        metadata: {
          sourceType: 'slygad',
          sourceId: merchantProductId,
          lastUpdated: Date.now(),
          lastPriceCheck: Date.now(),
          feedVersion: rawItem.feed_version || undefined,
        },

        computed: {
          discountPercentage: undefined,
          isOnSale: false,
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
      logger.error('SLYGAD normalization error', { error, rawItem })
      return this.createResult(false, undefined, [String(error)])
    }
  }

  /**
   * Extract sustainability-related tags and certifications
   */
  private extractSustainabilityTags(rawItem: RawFeedItem): string[] {
    const tags = new Set<string>()

    // Add certifications as tags
    if (rawItem.certifications) {
      const certs = Array.isArray(rawItem.certifications)
        ? rawItem.certifications
        : String(rawItem.certifications).split(',')

      certs.forEach((cert: string) => {
        const cleaned = cert.trim().toLowerCase()
        if (cleaned) tags.add(cleaned)
      })
    }

    // Common sustainability keywords
    const sustainabilityKeywords = [
      'duurzaam',
      'sustainable',
      'eco',
      'biologisch',
      'organic',
      'fair trade',
      'eerlijk',
      'vegan',
      'recycled',
      'gerecycled',
      'klimaatneutraal',
      'carbon neutral',
      'plastic vrij',
      'plastic-free',
    ]

    const text = `${rawItem.name} ${rawItem.description} ${rawItem.tags || ''}`.toLowerCase()

    sustainabilityKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        tags.add(keyword)
      }
    })

    // Impact category
    if (rawItem.impact_category) {
      tags.add(String(rawItem.impact_category).toLowerCase())
    }

    return Array.from(tags)
  }

  /**
   * Extract searchable tags
   */
  private extractTags(
    name: string,
    description: string,
    categories: string[],
    rawItem: RawFeedItem
  ): string[] {
    const tags = new Set<string>()

    // Add categories
    categories.forEach((cat) => tags.add(cat.toLowerCase()))

    // Add sustainability tags
    const sustainabilityTags = this.extractSustainabilityTags(rawItem)
    sustainabilityTags.forEach((tag) => tags.add(tag))

    // Extract from name/description
    const text = `${name} ${description}`.toLowerCase()
  const words: string[] = text.match(/\b\w{4,}\b/g) ?? []

    // Gift-related and sustainability keywords
    const relevantKeywords = [
      'cadeau',
      'gift',
      'present',
      'kado',
      'duurzaam',
      'eco',
      'groen',
      'biologisch',
      'eerlijk',
    ]

    words.forEach((word) => {
      if (relevantKeywords.some((kw) => word.includes(kw))) {
        tags.add(word)
      }
    })

    return Array.from(tags).slice(0, 25) // More tags for sustainability focus
  }

  /**
   * Calculate popularity score (emphasize impact/sustainability)
   */
  private calculatePopularityScore(rawItem: RawFeedItem): number {
    let score = 60 // Higher base score for curated products

    // Has high impact score
    if (rawItem.impact_score && Number(rawItem.impact_score) > 80) {
      score += 20
    } else if (rawItem.impact_score && Number(rawItem.impact_score) > 60) {
      score += 10
    }

    // Has certifications
    if (rawItem.certifications) {
      const certCount = Array.isArray(rawItem.certifications)
        ? rawItem.certifications.length
        : String(rawItem.certifications).split(',').length
      score += Math.min(certCount * 5, 15)
    }

    // Has detailed description (shows quality)
    if (rawItem.description && rawItem.description.length > 200) {
      score += 5
    }

    return Math.min(score, 100)
  }
}
