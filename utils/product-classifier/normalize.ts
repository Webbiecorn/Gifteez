/**
 * Product Normalization
 * Converts raw feed data from different sources into a unified Product model
 */

import type { Product, RawFeedRow } from './types'

// ==================== Utilities ====================

/**
 * Clean and normalize text fields
 */
function cleanText(text?: string): string | undefined {
  if (!text) return undefined
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E]/g, '') // Remove non-printable ASCII characters
}

/**
 * Parse price from string or number
 */
function parsePrice(value: any): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.')
    return parseFloat(cleaned) || 0
  }
  return 0
}

/**
 * Extract first valid image URL from various formats
 */
function extractImages(value: any): string[] {
  if (!value) return []

  let urls: string[] = []

  if (typeof value === 'string') {
    // Could be comma-separated or pipe-separated
    urls = value
      .split(/[,|;]/)
      .map((u) => u.trim())
      .filter(Boolean)
  } else if (Array.isArray(value)) {
    urls = value.filter((u) => typeof u === 'string')
  }

  // Filter and fix URLs
  return urls.filter((u) => u.startsWith('http')).map((u) => fixImageUrl(u))
}

/**
 * Fix image URLs that need special parameters
 * Coolblue Bynder URLs need width/height for transform to work
 */
function fixImageUrl(url: string): string {
  // Coolblue Bynder CDN fix - optimized for product cards
  if (url.includes('coolblue.bynder.com/transform') && url.includes('io=transform:fit')) {
    // Add width parameter if missing (400x400 is optimal for product cards)
    if (!url.includes('w=') && !url.includes('width=')) {
      return url.replace('io=transform:fit', 'io=transform:fit,width:400,height:400')
    }
  }

  return url
}

/**
 * Generate stable product ID
 */
function generateId(source: string, merchantId: string, productId: string): string {
  return `${source}:${merchantId}:${productId}`.toLowerCase()
}

// ==================== AWIN Adapter ====================

/**
 * AWIN Enhanced Feed Format
 * Common fields: product_id, aw_deep_link, merchant_product_id, aw_product_id,
 * merchant_image_url, description, product_name, merchant_category, search_price,
 * merchant_name, brand_name, product_GTIN, custom_1-5, etc.
 */
export function normalizeAWIN(row: RawFeedRow, advertiserId: string): Product {
  const productId = row.product_id || row.aw_product_id || row.merchant_product_id || 'unknown'

  // Extract merchant name (e.g., "Coolblue NL", "Shop Like You Give A Damn")
  const merchantName = cleanText(row.merchant_name)

  return {
    id: generateId('awin', advertiserId, productId),
    source: 'awin',
    merchant: merchantName, // Store actual merchant name for display

    title: cleanText(row.product_name || row.description) || 'Untitled',
    description: cleanText(row.description || row.product_short_description),
    brand: cleanText(row.brand_name),

    price: parsePrice(row.search_price || row.price || row.rrp_price),
    currency: row.currency || 'EUR',
    originalPrice: parsePrice(row.rrp_price),

    images: extractImages(row.merchant_image_url || row.aw_image_url || row.large_image),
    url: row.aw_deep_link || row.merchant_deep_link || '',

    categoryPath: cleanText(row.merchant_category),
    productType: cleanText(row.product_type || row.custom_1),
    googleProductCategory: cleanText(row.category_name || row.google_product_category),

    gtin: cleanText(row.product_GTIN || row.ean),
    mpn: cleanText(row.merchant_product_id),
    sku: cleanText(row.sku || productId),

    inStock: row.in_stock !== '0' && row.stock_status !== 'out of stock',
    condition: row.condition?.toLowerCase() === 'new' ? 'new' : undefined,
    deliveryDays: parseInt(row.delivery_time) || undefined,

    _raw: row,
  }
}

// ==================== Coolblue Adapter ====================

/**
 * Coolblue CSV Feed Format (via AWIN)
 * This is actually AWIN format with Coolblue as merchant
 * Common fields: product_name, search_price, merchant_image_url, aw_deep_link,
 * brand_name, merchant_category, ean, delivery_time
 */
export function normalizeCoolblue(row: RawFeedRow): Product {
  // For AWIN-sourced Coolblue data
  const productId = row.aw_product_id || row.merchant_product_id || row.product_id || 'unknown'
  const merchantId = row.merchant_id || 'coolblue'

  // Extract actual merchant name from AWIN feed
  const merchantName = cleanText(row.merchant_name)

  // AWIN format with merchant_product_category_path
  const categoryParts = [
    row.merchant_category,
    row.merchant_product_category_path,
    row.product_type,
  ]
    .filter(Boolean)
    .map((c) => cleanText(c))
  const categoryPath = categoryParts.join(' > ')

  return {
    id: generateId('coolblue', merchantId, productId),
    source: 'coolblue',
    merchant: merchantName, // Store actual merchant (Coolblue, SLYAGD, etc.)

    title: cleanText(row.product_name || row.title) || 'Untitled',
    description: cleanText(row.description || row.product_short_description),
    brand: cleanText(row.brand_name || row.brand || row.manufacturer),

    price: parsePrice(row.search_price || row.price || row.store_price),
    currency: row.currency || 'EUR',
    originalPrice: parsePrice(row.rrp_price || row.product_price_old),

    images: extractImages(row.merchant_image_url || row.aw_image_url || row.large_image),
    url: row.aw_deep_link || row.merchant_deep_link || row.product_link || '',

    categoryPath: categoryPath || undefined,
    productType: cleanText(row.product_type || row['Fashion:category']),
    googleProductCategory: cleanText(row.category_name || row.google_product_category),

    gtin: cleanText(row.ean || row.product_GTIN || row.gtin),
    mpn: cleanText(row.mpn || row.merchant_product_id),
    sku: cleanText(row.sku || productId),

    inStock: row.in_stock === '1' || row.stock_status !== 'out of stock',
    condition: 'new',
    shippingCost: parsePrice(row.delivery_cost || row.shipping_cost),
    deliveryDays: parseInt(row.delivery_time) || 1,

    _raw: row,
  }
}

// ==================== Bol.com Adapter ====================

/**
 * Bol.com Product Feed Format
 * Common fields: id, title, description, price, brand, category, image_url,
 * product_url, ean, delivery_code
 */
export function normalizeBol(row: RawFeedRow): Product {
  const productId = row.id || row.product_id || row.ean || 'unknown'

  return {
    id: generateId('bol', 'bol', productId),
    source: 'bol',

    title: cleanText(row.title || row.product_name) || 'Untitled',
    description: cleanText(row.description || row.short_description),
    brand: cleanText(row.brand || row.publisher || row.author),

    price: parsePrice(row.price || row.offer_price),
    currency: 'EUR',
    originalPrice: parsePrice(row.list_price),

    images: extractImages(row.image_url || row.image || row.media_url),
    url: row.product_url || row.url || '',

    categoryPath: cleanText(row.category_path || row.category),
    productType: cleanText(row.product_type || row.sub_category),
    googleProductCategory: cleanText(row.google_product_category),

    gtin: cleanText(row.ean || row.gtin),
    mpn: cleanText(row.mpn),
    sku: cleanText(row.sku || productId),

    inStock: row.in_stock !== 'false' && row.availability !== 'out of stock',
    condition: row.condition?.toLowerCase() === 'new' ? 'new' : undefined,
    deliveryDays: row.delivery_code === '1' ? 1 : 2, // Bol delivery codes

    _raw: row,
  }
}

// ==================== Amazon Adapter ====================

/**
 * Amazon Product Advertising API / CSV Feed
 * Common fields: ASIN, Title, Brand, Price, ImageURL, DetailPageURL,
 * ProductGroup, Binding, Category
 */
export function normalizeAmazon(row: RawFeedRow): Product {
  const asin = row.ASIN || row.asin || row.product_id || 'unknown'

  return {
    id: generateId('amazon', 'amazon', asin),
    source: 'amazon',

    title: cleanText(row.Title || row.title || row.product_name) || 'Untitled',
    description: cleanText(row.Description || row.description || row.Feature),
    brand: cleanText(row.Brand || row.brand || row.Manufacturer),

    price: parsePrice(row.Price || row.price || row.ListPrice),
    currency: 'EUR',
    originalPrice: parsePrice(row.ListPrice || row.rrp),

    images: extractImages(row.ImageURL || row.image_url || row.LargeImage || row.MediumImage),
    url: row.DetailPageURL || row.url || row.link || '',

    categoryPath: cleanText(row.ProductGroup || row.Category || row.Binding),
    productType: cleanText(row.ProductTypeName || row.Binding),
    googleProductCategory: cleanText(row.google_product_category),

    gtin: cleanText(row.EAN || row.UPC || row.ean),
    mpn: cleanText(row.PartNumber || row.mpn),
    sku: cleanText(row.SKU || asin),

    inStock: row.Availability !== 'out of stock',
    condition: 'new',

    _raw: row,
  }
}

// ==================== Manual/Editorial Adapter ====================

/**
 * For manually curated products or editorial picks
 */
export function normalizeManual(row: RawFeedRow): Product {
  return {
    id: row.id || `manual:${Date.now()}`,
    source: 'manual',

    title: cleanText(row.title) || 'Untitled',
    description: cleanText(row.description),
    brand: cleanText(row.brand),

    price: parsePrice(row.price),
    currency: row.currency || 'EUR',
    originalPrice: parsePrice(row.originalPrice),

    images: extractImages(row.images),
    url: row.url || '',

    categoryPath: cleanText(row.category),
    productType: cleanText(row.productType),

    gtin: cleanText(row.gtin),
    mpn: cleanText(row.mpn),
    sku: cleanText(row.sku),

    inStock: row.inStock !== false,
    condition: row.condition || 'new',

    _raw: row,
  }
}

// ==================== Router Function ====================

/**
 * Route to correct normalizer based on source
 */
export function normalize(
  row: RawFeedRow,
  source: string,
  metadata?: { advertiserId?: string }
): Product | null {
  try {
    switch (source.toLowerCase()) {
      case 'awin':
        return normalizeAWIN(row, metadata?.advertiserId || 'unknown')
      case 'coolblue':
        return normalizeCoolblue(row)
      case 'bol':
        return normalizeBol(row)
      case 'amazon':
        return normalizeAmazon(row)
      case 'manual':
        return normalizeManual(row)
      default:
        console.warn(`Unknown source: ${source}, attempting generic normalization`)
        return normalizeManual(row)
    }
  } catch (error) {
    console.error(`Failed to normalize product from ${source}:`, error)
    return null
  }
}

// ==================== Batch Processing ====================

/**
 * Normalize multiple rows with error handling
 */
export function normalizeBatch(
  rows: RawFeedRow[],
  source: string,
  metadata?: { advertiserId?: string }
): Product[] {
  const products: Product[] = []
  const errors: Array<{ row: RawFeedRow; error: any }> = []

  for (const row of rows) {
    try {
      const product = normalize(row, source, metadata)
      if (product) {
        products.push(product)
      }
    } catch (error) {
      errors.push({ row, error })
    }
  }

  if (errors.length > 0) {
    console.warn(`Failed to normalize ${errors.length}/${rows.length} products`)
  }

  return products
}
