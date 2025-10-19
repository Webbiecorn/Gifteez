/**
 * Base Product Normalizer
 *
 * Abstract base class for feed normalizers. Each feed source (AWIN, Coolblue, etc.)
 * extends this class and implements the normalize() method.
 */

import { logger } from '../../lib/logger'
import type {
  NormalizedProduct,
  RawFeedItem,
  NormalizationResult,
} from '../../types/normalizedProduct'

export abstract class BaseNormalizer {
  protected feedSource: string

  constructor(feedSource: string) {
    this.feedSource = feedSource
  }

  /**
   * Normalize raw feed item to unified product structure
   * Must be implemented by each feed-specific normalizer
   */
  abstract normalize(rawItem: RawFeedItem): NormalizationResult

  /**
   * Generate unique product ID from merchant info
   */
  protected generateProductId(merchantId: string, merchantProductId: string): string {
    const hashInput = `${merchantId}:${merchantProductId}`

    // Simple hash function (use crypto.subtle.digest in production for better hashing)
    let hash = 0
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }

    return `prod_${Math.abs(hash).toString(36)}`
  }

  /**
   * Sanitize HTML description
   * Strips all HTML by default, or whitelists safe tags
   */
  protected sanitizeDescription(
    html: string,
    allowHtml: boolean = false
  ): {
    plain: string
    html?: string
  } {
    if (!html) {
      return { plain: '' }
    }

    // Strip HTML for plain text version
    const plain = html
      .replace(/<[^>]*>/g, ' ') // Remove all tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    if (!allowHtml) {
      return { plain }
    }

    // Whitelist safe HTML tags for rich text version
    // Simple sanitizer - remove script tags and dangerous attributes
    const safeHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/<iframe/gi, '<removed')
      .replace(/<object/gi, '<removed')
      .replace(/<embed/gi, '<removed')

    return { plain, html: safeHtml }
  }

  /**
   * Parse price to cents (avoid float precision issues)
   */
  protected parsePrice(priceString: string | number): number {
    if (typeof priceString === 'number') {
      return Math.round(priceString * 100)
    }

    // Remove currency symbols and parse
    const cleaned = priceString.replace(/[€$£,\s]/g, '').replace(',', '.')

    const price = parseFloat(cleaned)

    if (isNaN(price) || price < 0) {
      throw new Error(`Invalid price: ${priceString}`)
    }

    return Math.round(price * 100)
  }

  /**
   * Format price for display
   */
  protected formatPrice(cents: number, currency: string = 'EUR'): string {
    const euros = cents / 100

    if (currency === 'EUR') {
      return `€ ${euros.toFixed(2).replace('.', ',')}`
    }

    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency,
    }).format(euros)
  }

  /**
   * Validate product URL
   */
  protected isValidUrl(url: string): boolean {
    if (!url) return false

    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  /**
   * Validate image URL
   */
  protected isValidImageUrl(url: string): boolean {
    if (!this.isValidUrl(url)) return false

    // Check for common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const lowerUrl = url.toLowerCase()

    return imageExtensions.some((ext) => lowerUrl.includes(ext))
  }

  /**
   * Extract categories from raw data
   */
  protected extractCategories(rawCategories: string | string[]): string[] {
    if (!rawCategories) return []

    if (Array.isArray(rawCategories)) {
      return rawCategories.filter(Boolean)
    }

    // Split by common delimiters
    return rawCategories
      .split(/[,;|>]/)
      .map((cat) => cat.trim())
      .filter(Boolean)
  }

  /**
   * Calculate discount percentage
   */
  protected calculateDiscount(currentPrice: number, originalPrice: number): number {
    if (!originalPrice || originalPrice <= currentPrice) return 0

    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
  }

  /**
   * Validate normalized product
   */
  protected validateProduct(product: NormalizedProduct): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!product.id) errors.push('Missing product ID')
    if (!product.name) errors.push('Missing product name')
    if (!product.price.current || product.price.current <= 0) {
      errors.push('Invalid price')
    }
    if (!product.url || !this.isValidUrl(product.url)) {
      errors.push('Invalid product URL')
    }
    if (!product.affiliateUrl || !this.isValidUrl(product.affiliateUrl)) {
      errors.push('Invalid affiliate URL')
    }

    // Warnings
    if (!product.images.primary) {
      warnings.push('Missing primary image')
    } else if (!this.isValidImageUrl(product.images.primary)) {
      warnings.push('Invalid primary image URL')
    }

    if (!product.description || product.description.length < 10) {
      warnings.push('Description too short or missing')
    }

    if (!product.brand) {
      warnings.push('Missing brand information')
    }

    if (product.categories.length === 0) {
      warnings.push('No categories assigned')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Log normalization result
   */
  protected logResult(result: NormalizationResult, rawItem: RawFeedItem): void {
    if (result.success) {
      logger.debug(`Normalized product: ${result.product?.name}`, {
        productId: result.product?.id,
        source: this.feedSource,
        warnings: result.warnings,
      })
    } else {
      logger.warn(`Failed to normalize product from ${this.feedSource}`, {
        errors: result.errors,
        rawItem: rawItem,
      })
    }
  }

  /**
   * Create normalization result
   */
  protected createResult(
    success: boolean,
    product?: NormalizedProduct,
    errors?: string[],
    warnings?: string[],
    skipped?: boolean,
    reason?: string
  ): NormalizationResult {
    return {
      success,
      product,
      errors,
      warnings,
      skipped,
      reason,
    }
  }
}
