/**
 * Product Hashing & Deduplication
 * Creates canonical keys for identifying duplicate products
 */

import type { Product, ClassifiedProduct } from './types'

/**
 * Normalize text for hashing
 */
function normalizeForHash(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract size/color variants from title
 * e.g., "Shirt Red XL" -> "Shirt"
 */
function removeVariants(title: string): string {
  const normalized = normalizeForHash(title)
  
  // Common size patterns
  const sizePattern = /\b(xs|s|m|l|xl|xxl|xxxl|\d+\s?(cm|mm|ml|cl|l|kg|g))\b/gi
  
  // Common color words (extend as needed)
  const colorPattern = /\b(rood|blauw|groen|geel|zwart|wit|grijs|paars|roze|oranje|bruin|beige|red|blue|green|yellow|black|white|grey|gray|purple|pink|orange|brown)\b/gi
  
  return normalized
    .replace(sizePattern, '')
    .replace(colorPattern, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Create canonical key for deduplication
 * Format: normalized_brand|normalized_title_without_variants
 */
export function canonicalKey(product: Product): string {
  const brand = normalizeForHash(product.brand || 'unknown')
  const title = removeVariants(product.title)
  
  return `${brand}|${title}`
}

/**
 * Create hash from multiple identifiers
 * Useful for multi-source deduplication (GTIN, MPN, etc.)
 */
export function identifierHash(product: Product): string {
  const identifiers = [
    product.gtin,
    product.mpn,
    product.sku
  ].filter(Boolean)
  
  if (identifiers.length > 0) {
    return identifiers.join('|').toLowerCase()
  }
  
  // Fallback to canonical key
  return canonicalKey(product)
}

/**
 * Check if two products are likely duplicates
 */
export function areDuplicates(a: Product, b: Product): boolean {
  // Exact identifier match (high confidence)
  if (a.gtin && b.gtin && a.gtin === b.gtin) return true
  if (a.mpn && b.mpn && a.mpn === b.mpn) return true
  
  // Same source and SKU
  if (a.source === b.source && a.sku === b.sku) return true
  
  // Canonical key match (title + brand similarity)
  if (canonicalKey(a) === canonicalKey(b)) return true
  
  return false
}

/**
 * Assign canonical keys to products
 */
export function assignCanonicalKeys(products: ClassifiedProduct[]): ClassifiedProduct[] {
  return products.map(p => ({
    ...p,
    canonicalKey: canonicalKey(p)
  }))
}
