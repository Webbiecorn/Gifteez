/**
 * Product Diversification & Deduplication
 * Ensures variety in product selection and removes duplicates
 */

import type { ClassifiedProduct, DiversifyOptions } from './types'
import { canonicalKey } from './hash'

// ==================== Deduplication ====================

/**
 * Remove duplicate products based on canonical key
 * Keeps the first occurrence (assumes input is already sorted by priority)
 */
export function dedup(products: ClassifiedProduct[]): ClassifiedProduct[] {
  const seen = new Set<string>()
  const unique: ClassifiedProduct[] = []
  
  for (const product of products) {
    const key = product.canonicalKey || canonicalKey(product)
    
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(product)
    }
  }
  
  console.log(`Deduplication: ${products.length} → ${unique.length} products`)
  return unique
}

/**
 * Deduplicate across multiple sources, keeping best quality
 */
export function dedupMultiSource(products: ClassifiedProduct[]): ClassifiedProduct[] {
  const groups = new Map<string, ClassifiedProduct[]>()
  
  // Group by canonical key
  for (const product of products) {
    const key = product.canonicalKey || canonicalKey(product)
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(product)
  }
  
  // Select best from each group
  const best: ClassifiedProduct[] = []
  
  for (const group of groups.values()) {
    if (group.length === 1) {
      best.push(group[0])
      continue
    }
    
    // Sort by quality: confidence > has images > price completeness
    const sorted = group.sort((a, b) => {
      // Higher confidence wins
      if (a.facets.confidence !== b.facets.confidence) {
        return b.facets.confidence - a.facets.confidence
      }
      
      // More images wins
      const aImages = a.images.length
      const bImages = b.images.length
      if (aImages !== bImages) {
        return bImages - aImages
      }
      
      // Has original price (for discount display)
      const aHasDiscount = a.originalPrice && a.originalPrice > a.price
      const bHasDiscount = b.originalPrice && b.originalPrice > b.price
      if (aHasDiscount !== bHasDiscount) {
        return aHasDiscount ? -1 : 1
      }
      
      return 0
    })
    
    best.push(sorted[0])
  }
  
  console.log(`Multi-source dedup: ${products.length} → ${best.length} products (${groups.size} unique)`)
  return best
}

// ==================== Diversification ====================

/**
 * Default diversification options
 */
export const DEFAULT_DIVERSIFY_OPTIONS: DiversifyOptions = {
  maxTotal: 24,
  maxPerBrand: 2,
  maxPerCategory: 6,
  maxPerPriceBucket: 8,
  minDifferentBrands: 8,
  minDifferentCategories: 4,
  diversityWeight: 0.6,
  popularityWeight: 0.3,
  recencyWeight: 0.1
}

/**
 * Calculate diversity score for a product in current selection
 * Higher score = more diverse (different from what's already selected)
 */
function diversityScore(
  product: ClassifiedProduct,
  selected: ClassifiedProduct[],
  brandCounts: Map<string, number>,
  categoryCounts: Map<string, number>
): number {
  const brand = (product.brand || 'unknown').toLowerCase()
  const category = product.facets.category
  
  const brandCount = brandCounts.get(brand) || 0
  const categoryCount = categoryCounts.get(category) || 0
  
  // Penalize overrepresented brands/categories
  const brandPenalty = brandCount * 0.3
  const categoryPenalty = categoryCount * 0.2
  
  // Bonus for underrepresented price buckets
  const priceBucketCounts = new Map<string, number>()
  for (const p of selected) {
    const bucket = p.facets.priceBucket
    priceBucketCounts.set(bucket, (priceBucketCounts.get(bucket) || 0) + 1)
  }
  const priceBucketCount = priceBucketCounts.get(product.facets.priceBucket) || 0
  const priceBonus = priceBucketCount === 0 ? 0.3 : 0
  
  return 1.0 - brandPenalty - categoryPenalty + priceBonus
}

/**
 * Diversify product selection with brand/category caps
 * Uses a greedy algorithm with diversity scoring
 */
export function diversify(
  products: ClassifiedProduct[],
  options: Partial<DiversifyOptions> = {}
): ClassifiedProduct[] {
  const opts = { ...DEFAULT_DIVERSIFY_OPTIONS, ...options }
  
  const selected: ClassifiedProduct[] = []
  const brandCounts = new Map<string, number>()
  const categoryCounts = new Map<string, number>()
  const priceBucketCounts = new Map<string, number>()
  
  // Sort by confidence first (prefer high-confidence products)
  const sorted = [...products].sort((a, b) => {
    // Confidence
    if (a.facets.confidence !== b.facets.confidence) {
      return b.facets.confidence - a.facets.confidence
    }
    // Price (prefer mid-range)
    const aMidRange = a.price >= 25 && a.price <= 100
    const bMidRange = b.price >= 25 && b.price <= 100
    if (aMidRange !== bMidRange) {
      return aMidRange ? -1 : 1
    }
    return 0
  })
  
  for (const product of sorted) {
    // Check if we've reached total limit
    if (selected.length >= opts.maxTotal) break
    
    const brand = (product.brand || 'unknown').toLowerCase()
    const category = product.facets.category
    const priceBucket = product.facets.priceBucket
    
    // Check brand cap
    const brandCount = brandCounts.get(brand) || 0
    if (brandCount >= opts.maxPerBrand) continue
    
    // Check category cap
    const categoryCount = categoryCounts.get(category) || 0
    if (categoryCount >= opts.maxPerCategory) continue
    
    // Check price bucket cap
    const priceBucketCount = priceBucketCounts.get(priceBucket) || 0
    if (priceBucketCount >= opts.maxPerPriceBucket) continue
    
    // Calculate diversity score
    const divScore = diversityScore(product, selected, brandCounts, categoryCounts)
    
    // Accept if diversity score is good OR we need more variety
    const needMoreBrands = brandCounts.size < opts.minDifferentBrands
    const needMoreCategories = categoryCounts.size < opts.minDifferentCategories
    
    if (divScore >= 0.5 || needMoreBrands || needMoreCategories) {
      selected.push(product)
      brandCounts.set(brand, brandCount + 1)
      categoryCounts.set(category, categoryCount + 1)
      priceBucketCounts.set(priceBucket, priceBucketCount + 1)
    }
  }
  
  console.log(`Diversified: ${products.length} → ${selected.length} products`)
  console.log(`  Brands: ${brandCounts.size}, Categories: ${categoryCounts.size}`)
  
  return selected
}

/**
 * Smart diversification with MMR-like approach
 * Balances relevance (confidence) with diversity
 */
export function diversifyMMR(
  products: ClassifiedProduct[],
  options: Partial<DiversifyOptions> = {}
): ClassifiedProduct[] {
  const opts = { ...DEFAULT_DIVERSIFY_OPTIONS, ...options }
  
  const selected: ClassifiedProduct[] = []
  const remaining = [...products]
  const brandCounts = new Map<string, number>()
  const categoryCounts = new Map<string, number>()
  
  while (selected.length < opts.maxTotal && remaining.length > 0) {
    let bestScore = -Infinity
    let bestIndex = -1
    
    for (let i = 0; i < remaining.length; i++) {
      const product = remaining[i]
      const brand = (product.brand || 'unknown').toLowerCase()
      const category = product.facets.category
      
      // Check hard caps
      const brandCount = brandCounts.get(brand) || 0
      if (brandCount >= opts.maxPerBrand) continue
      
      const categoryCount = categoryCounts.get(category) || 0
      if (categoryCount >= opts.maxPerCategory) continue
      
      // MMR score: lambda * relevance + (1 - lambda) * diversity
      const relevance = product.facets.confidence
      const diversity = diversityScore(product, selected, brandCounts, categoryCounts)
      
      const score = 
        opts.popularityWeight * relevance +
        opts.diversityWeight * diversity
      
      if (score > bestScore) {
        bestScore = score
        bestIndex = i
      }
    }
    
    if (bestIndex === -1) break // No valid products left
    
    const selected_product = remaining.splice(bestIndex, 1)[0]
    selected.push(selected_product)
    
    const brand = (selected_product.brand || 'unknown').toLowerCase()
    const category = selected_product.facets.category
    brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1)
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)
  }
  
  console.log(`MMR Diversified: ${products.length} → ${selected.length} products`)
  return selected
}

/**
 * Get diversity statistics for a product set
 */
export function getDiversityStats(products: ClassifiedProduct[]): {
  totalProducts: number
  uniqueBrands: number
  uniqueCategories: number
  brandDistribution: Record<string, number>
  categoryDistribution: Record<string, number>
  priceBucketDistribution: Record<string, number>
  averageConfidence: number
} {
  const brands = new Map<string, number>()
  const categories = new Map<string, number>()
  const priceBuckets = new Map<string, number>()
  let totalConfidence = 0
  
  for (const product of products) {
    const brand = (product.brand || 'unknown').toLowerCase()
    brands.set(brand, (brands.get(brand) || 0) + 1)
    
    const category = product.facets.category
    categories.set(category, (categories.get(category) || 0) + 1)
    
    const bucket = product.facets.priceBucket
    priceBuckets.set(bucket, (priceBuckets.get(bucket) || 0) + 1)
    
    totalConfidence += product.facets.confidence
  }
  
  return {
    totalProducts: products.length,
    uniqueBrands: brands.size,
    uniqueCategories: categories.size,
    brandDistribution: Object.fromEntries(brands),
    categoryDistribution: Object.fromEntries(categories),
    priceBucketDistribution: Object.fromEntries(priceBuckets),
    averageConfidence: products.length > 0 ? totalConfidence / products.length : 0
  }
}
