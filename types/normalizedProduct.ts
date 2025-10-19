/**
 * Normalized Product Type
 *
 * All product feeds (AWIN, Coolblue, ShopLikeYouGiveADamn, etc.) are
 * normalized to this unified structure for consistency across the application.
 */

export interface NormalizedProduct {
  // Unique identifiers
  id: string // Internal Gifteez ID (hash of merchant_id + merchant_product_id)
  merchantId: string // Retailer identifier (e.g., 'coolblue', 'awin:12345')
  merchantProductId: string // Product ID in merchant's system

  // Basic info
  name: string // Product title/name
  description: string // Sanitized plain text description
  descriptionHtml?: string // Optional: whitelisted HTML version
  brand?: string // Brand name

  // Pricing
  price: {
    current: number // Current price in cents (to avoid float issues)
    original?: number // Original price if on sale (in cents)
    currency: string // ISO currency code (e.g., 'EUR')
    formatted: string // Display string (e.g., '€ 99,99')
  }

  // Availability
  availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'discontinued' | 'unknown'
  stock?: {
    quantity?: number // Available quantity (if provided)
    lastUpdated: number // Timestamp of last stock check
  }

  // Images
  images: {
    primary: string // Main product image URL
    additional?: string[] // Additional product images
    thumbnail?: string // Thumbnail version
  }

  // Categorization
  categories: string[] // Gifteez internal categories
  tags: string[] // Keywords/tags for search

  // Links
  url: string // Product page URL (with affiliate tracking)
  affiliateUrl: string // Direct affiliate link

  // Retailer info
  retailer: {
    name: string // Display name (e.g., 'Coolblue')
    id: string // Internal retailer ID
    logo?: string // Retailer logo URL
    rating?: number // Retailer trust rating (1-5)
  }

  // Metadata
  metadata: {
    sourceType: 'awin' | 'coolblue' | 'slygad' | 'amazon' | 'manual'
    sourceId?: string // Original feed ID
    lastUpdated: number // Timestamp of last update
    lastPriceCheck: number // Timestamp of last price verification
    feedVersion?: string // Feed version for debugging
  }

  // Computed fields
  computed?: {
    discountPercentage?: number // Calculated discount %
    isOnSale: boolean // Whether product is on sale
    popularityScore?: number // Internal popularity metric
    priceHistory?: Array<{
      // Price tracking
      price: number
      timestamp: number
    }>
  }

  // Validation
  validated: {
    hasValidPrice: boolean // Price > 0 and reasonable
    hasValidImage: boolean // Image URL is accessible
    hasValidUrl: boolean // Product URL is reachable
    lastValidated: number // Timestamp of last validation
  }
}

/**
 * Raw feed item (before normalization)
 */
export interface RawFeedItem {
  [key: string]: any // Flexible structure for raw feed data
}

/**
 * Feed normalization result
 */
export interface NormalizationResult {
  success: boolean
  product?: NormalizedProduct
  errors?: string[]
  warnings?: string[]
  skipped?: boolean
  reason?: string
}

/**
 * Product hash for deduplication
 */
export interface ProductHash {
  hash: string
  merchantId: string
  merchantProductId: string
}

/**
 * Feed metadata
 */
export interface FeedMetadata {
  feedId: string
  feedName: string
  lastFetched: number
  totalItems: number
  processedItems: number
  failedItems: number
  duplicateItems: number
  processingTimeMs: number
}
