/**
 * Product Classifier Types
 * Defines the core data structures for product normalization, classification, and faceting
 */

// ==================== Raw Input Types ====================

export type RawFeedRow = Record<string, any>

export type FeedSource = 'awin' | 'coolblue' | 'bol' | 'amazon' | 'slygad' | 'partypro' | 'manual'

// ==================== Normalized Product ====================

/**
 * Normalized product model - all feeds convert to this shape
 */
export interface Product {
  // Identity
  id: string // Format: {source}:{merchantId}:{productId} e.g. "awin:12345:ABC123"
  source: FeedSource
  merchant?: string // Actual merchant name (e.g., "Coolblue", "Shop Like You Give A Damn")

  // Core data
  title: string
  description?: string
  brand?: string

  // Pricing
  price: number
  currency: string
  originalPrice?: number // For discount calculation

  // Media
  images: string[]
  url: string

  // Taxonomy (raw from feed)
  categoryPath?: string // e.g. "Apparel & Accessories > Belts"
  productType?: string // Merchant's custom category
  googleProductCategory?: string // GPC code or path

  // Identifiers
  gtin?: string // EAN/UPC
  mpn?: string // Manufacturer Part Number
  sku?: string

  // Metadata
  inStock?: boolean
  condition?: 'new' | 'refurbished' | 'used'
  shippingCost?: number
  deliveryDays?: number

  // Raw data (for debugging/overrides)
  _raw?: RawFeedRow
}

// ==================== Classification Output ====================

/**
 * Audience classification
 */
export type Audience = 'men' | 'women' | 'unisex' | 'kids' | 'baby' | 'teen'

/**
 * Product category (stable taxonomy)
 */
export type Category =
  | 'riemen'
  | 'horloges'
  | 'portemonnees'
  | 'sieraden'
  | 'geuren'
  | 'gadgets'
  | 'beauty'
  | 'wonen'
  | 'koken'
  | 'sport'
  | 'mode'
  | 'elektronica'
  | 'boeken'
  | 'speelgoed'
  | 'wellness'
  | 'outdoor'
  | 'kunst'
  | 'duurzaam'
  | 'overig'

/**
 * Price brackets
 */
export type PriceBucket = 'under-25' | '25-50' | '50-100' | '100-250' | 'over-250'

/**
 * Occasions/events
 */
export type Occasion =
  | 'verjaardag'
  | 'kerst'
  | 'sinterklaas'
  | 'vaderdag'
  | 'moederdag'
  | 'valentijn'
  | 'housewarming'
  | 'babyshower'
  | 'afstuderen'
  | 'pensioen'
  | 'algemeen'

/**
 * Interest/lifestyle tags
 */
export type Interest =
  | 'gamer'
  | 'duurzaam'
  | 'tech'
  | 'fitness'
  | 'reizen'
  | 'koken'
  | 'tuinieren'
  | 'lezen'
  | 'muziek'
  | 'kunst'
  | 'mode'
  | 'beauty'

/**
 * Complete classification result with confidence
 */
export interface Facets {
  // Primary dimensions
  audience: Audience[]
  category: Category
  priceBucket: PriceBucket

  // Optional dimensions
  occasions?: Occasion[]
  interests?: Interest[]
  subcategory?: string // More specific than category

  // Quality metrics
  confidence: number // 0-1, how certain are we?
  reasons: string[] // Why did we classify this way?

  // Flags
  needsReview: boolean // Low confidence or ambiguous
  isGiftable: boolean // Suitable as a gift?
}

/**
 * Product + Classification = Classified Product
 */
export interface ClassifiedProduct extends Product {
  facets: Facets
  searchText: string // Normalized for search: title + brand + keywords
  canonicalKey: string // For deduplication
}

// ==================== Configuration ====================

/**
 * Keyword sets for classification
 */
export interface KeywordSet {
  audience: Record<Audience, string[]>
  categories: Record<Category, string[]>
  occasions: Record<Occasion, string[]>
  interests: Record<Interest, string[]>

  // Special keywords
  exclude: string[] // Products containing these are excluded
  forceGiftable: string[] // Always mark as giftable
  notGiftable: string[] // Never mark as giftable
}

/**
 * Google Product Category to our Category mapping
 */
export type GPCMapping = Record<string, Category>

/**
 * Brand/SKU specific overrides
 */
export interface Overrides {
  brands: Record<string, Partial<Facets> & { reason?: string }>
  skus: Record<string, Partial<Facets> & { reason?: string }>

  exclude: {
    sku: string[] // Specific products to exclude
    contains: string[] // Exclude if title/description contains
    brands: string[] // Exclude entire brands
  }

  forceInclude: string[] // Always include these SKUs regardless of rules
}

/**
 * Classifier configuration
 */
export interface ClassifierConfig {
  keywords: KeywordSet
  gpcMapping: GPCMapping
  overrides: Overrides

  // Thresholds
  confidenceThreshold: number // Below this = needs review
  minPrice: number // Exclude products below this
  maxPrice: number // Exclude products above this

  // Weights for prioritization
  titleWeight: number // How much to trust title vs description
  categoryWeight: number // How much to trust feed category
}

// ==================== Diversification ====================

/**
 * Options for deduplication and diversification
 */
export interface DiversifyOptions {
  // Caps
  maxTotal: number // Total products to return
  maxPerBrand: number // Max products from same brand
  maxPerCategory: number // Max products in same category
  maxPerPriceBucket: number // Spread across price ranges

  // Minimum requirements
  minDifferentBrands: number // Aim for this many different brands
  minDifferentCategories: number // Aim for this many categories

  // Scoring
  diversityWeight: number // 0-1, how much to prioritize variety
  popularityWeight: number // 0-1, how much to prioritize clicks/sales
  recencyWeight: number // 0-1, how much to prioritize new products
}

// ==================== Build Output ====================

/**
 * Output format for programmatic landing pages
 */
export interface ProgrammaticIndex {
  routeKey: string // e.g. "cadeaugidsen/vrouwen/sieraden/25-50"
  metadata: {
    title: string
    description: string
    audience?: Audience
    category?: Category
    priceBucket?: PriceBucket
    occasion?: Occasion
    totalProducts: number
    generatedAt: string
  }

  // Editorial picks (manual, always on top)
  featured: ClassifiedProduct[]

  // Automated diverse selection
  products: ClassifiedProduct[]

  // Stats for debugging
  stats: {
    uniqueBrands: number
    uniqueCategories: number
    averagePrice: number
    priceRange: [number, number]
    confidenceDistribution: Record<string, number>
  }
}

// ==================== Review Queue ====================

/**
 * Products flagged for manual review
 */
export interface ReviewQueueItem {
  product: Product
  proposedFacets: Facets
  reason: 'low-confidence' | 'ambiguous-audience' | 'unknown-category' | 'price-outlier'
  reviewedAt?: string
  reviewedBy?: string
  manualFacets?: Partial<Facets>
}
