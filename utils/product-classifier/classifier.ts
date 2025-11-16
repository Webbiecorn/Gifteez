/**
 * Product Classifier
 * Rule-based classification using keyword matching and heuristics
 */

import type {
  Product,
  Facets,
  Audience,
  Category,
  PriceBucket,
  Occasion,
  Interest,
  ClassifierConfig,
  KeywordSet,
  GPCMapping,
  Overrides,
  ClassifiedProduct,
} from './types'

// ==================== Text Processing ====================

/**
 * Normalize text for matching: lowercase, remove diacritics, extra spaces
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Create searchable text from product
 * Priority: title > brand > productType > categoryPath > description
 */
function createSearchText(product: Product): string {
  const parts = [
    product.title,
    product.brand,
    product.productType,
    product.categoryPath,
    product.description?.slice(0, 200), // Limit description length
  ].filter(Boolean)

  return normalizeText(parts.join(' '))
}

/**
 * Check if text contains any keyword from list
 */
function containsAny(text: string, keywords: string[]): boolean {
  const normalized = normalizeText(text)
  return keywords.some((kw) => normalized.includes(normalizeText(kw)))
}

/**
 * Count keyword matches (for confidence scoring)
 */
function countMatches(text: string, keywords: string[]): number {
  const normalized = normalizeText(text)
  return keywords.filter((kw) => normalized.includes(normalizeText(kw))).length
}

// ==================== Classification Rules ====================

/**
 * Classify audience with priority: Fashion:suitable_for > title > productType > full text
 */
function classifyAudience(
  product: Product,
  keywords: KeywordSet['audience']
): { audiences: Audience[]; confidence: number; reasons: string[] } {
  const title = product.title || ''
  const productType = product.productType || ''
  const fullText = createSearchText(product)

  const audiences: Audience[] = []
  const reasons: string[] = []
  let confidence = 0

  // HIGHEST PRIORITY: Fashion:suitable_for field from AWIN feed
  const rawData = product._raw as any
  if (rawData && rawData['Fashion:suitable_for']) {
    const suitableFor = String(rawData['Fashion:suitable_for']).toLowerCase()
    if (suitableFor.includes('female') || suitableFor.includes('women')) {
      audiences.push('women')
      reasons.push('Fashion:suitable_for indicates women')
      confidence = 0.95
    } else if (suitableFor.includes('male') || suitableFor.includes('men')) {
      audiences.push('men')
      reasons.push('Fashion:suitable_for indicates men')
      confidence = 0.95
    } else if (suitableFor.includes('unisex')) {
      audiences.push('unisex')
      reasons.push('Fashion:suitable_for indicates unisex')
      confidence = 0.9
    } else if (suitableFor.includes('kids') || suitableFor.includes('child')) {
      audiences.push('kids')
      reasons.push('Fashion:suitable_for indicates kids')
      confidence = 0.95
    }

    // If we found audience from Fashion field, return early
    if (audiences.length > 0) {
      return { audiences, confidence, reasons }
    }
  }

  // Check each audience type via keywords
  for (const [audience, kws] of Object.entries(keywords)) {
    // High confidence: title match
    if (containsAny(title, kws)) {
      audiences.push(audience as Audience)
      reasons.push(`Title contains ${audience} keyword`)
      confidence = Math.max(confidence, 0.9)
      continue
    }

    // Medium confidence: productType match
    if (containsAny(productType, kws)) {
      audiences.push(audience as Audience)
      reasons.push(`Product type indicates ${audience}`)
      confidence = Math.max(confidence, 0.7)
      continue
    }

    // Lower confidence: full text match (but needs multiple keywords)
    const matches = countMatches(fullText, kws)
    if (matches >= 2) {
      audiences.push(audience as Audience)
      reasons.push(`Multiple ${audience} keywords in description`)
      confidence = Math.max(confidence, 0.5)
    }
  }

  // Default to unisex if ambiguous or no clear audience
  if (audiences.length === 0) {
    audiences.push('unisex')
    reasons.push('No clear gender indicators, defaulting to unisex')
    confidence = 0.3
  }

  // If multiple audiences detected, keep unisex
  if (audiences.length > 2) {
    return {
      audiences: ['unisex'],
      confidence: 0.5,
      reasons: ['Multiple audiences detected, treating as unisex'],
    }
  }

  return { audiences, confidence, reasons }
}

/**
 * Classify category using keywords and GPC mapping
 */
function classifyCategory(
  product: Product,
  keywords: KeywordSet['categories'],
  gpcMapping: GPCMapping
): { category: Category; confidence: number; reasons: string[] } {
  const fullText = createSearchText(product)

  // Try GPC mapping first (high confidence)
  if (product.googleProductCategory) {
    const gpcLower = product.googleProductCategory.toLowerCase()
    for (const [gpcPath, category] of Object.entries(gpcMapping)) {
      if (gpcLower.includes(gpcPath.toLowerCase())) {
        return {
          category: category as Category,
          confidence: 0.85,
          reasons: [`Mapped from Google Product Category: ${gpcPath}`],
        }
      }
    }
  }

  // Try categoryPath (medium-high confidence)
  if (product.categoryPath) {
    const categoryLower = product.categoryPath.toLowerCase()
    for (const [gpcPath, category] of Object.entries(gpcMapping)) {
      if (categoryLower.includes(gpcPath.toLowerCase())) {
        return {
          category: category as Category,
          confidence: 0.75,
          reasons: [`Mapped from category path: ${product.categoryPath}`],
        }
      }
    }
  }

  // Keyword matching (variable confidence)
  const categoryScores: Record<Category, number> = {} as any

  for (const [category, kws] of Object.entries(keywords)) {
    const matches = countMatches(fullText, kws)
    if (matches > 0) {
      categoryScores[category as Category] = matches
    }
  }

  // Get category with most matches
  const entries = Object.entries(categoryScores)
  if (entries.length > 0) {
    const [bestCategory, matchCount] = entries.sort((a, b) => b[1] - a[1])[0]
    const confidence = Math.min(0.6 + matchCount * 0.1, 0.95)
    return {
      category: bestCategory as Category,
      confidence,
      reasons: [`Matched ${matchCount} keyword(s) for ${bestCategory}`],
    }
  }

  // Default to 'overig'
  return {
    category: 'overig',
    confidence: 0.2,
    reasons: ['No clear category match, defaulting to overig'],
  }
}

/**
 * Determine price bucket
 */
function classifyPriceBucket(price: number): PriceBucket {
  if (price < 25) return 'under-25'
  if (price < 50) return '25-50'
  if (price < 100) return '50-100'
  if (price < 250) return '100-250'
  return 'over-250'
}

/**
 * Classify occasions based on keywords
 */
function classifyOccasions(product: Product, keywords: KeywordSet['occasions']): Occasion[] {
  const fullText = createSearchText(product)
  const occasions: Occasion[] = []

  for (const [occasion, kws] of Object.entries(keywords)) {
    if (containsAny(fullText, kws)) {
      occasions.push(occasion as Occasion)
    }
  }

  // Always include 'algemeen' for products without specific occasion
  if (occasions.length === 0) {
    occasions.push('algemeen')
  }

  return occasions
}

/**
 * Classify interests/lifestyle tags
 */
function classifyInterests(product: Product, keywords: KeywordSet['interests']): Interest[] {
  const fullText = createSearchText(product)
  const interests: Interest[] = []

  for (const [interest, kws] of Object.entries(keywords)) {
    if (containsAny(fullText, kws)) {
      interests.push(interest as Interest)
    }
  }

  return interests
}

/**
 * Determine if product is giftable
 */
function isGiftable(product: Product, keywords: KeywordSet): boolean {
  const fullText = createSearchText(product)

  // Force not giftable
  if (containsAny(fullText, keywords.notGiftable || [])) {
    return false
  }

  // Force giftable
  if (containsAny(fullText, keywords.forceGiftable || [])) {
    return true
  }

  // Exclude consumables, spare parts, etc.
  if (containsAny(fullText, keywords.exclude || [])) {
    return false
  }

  // Default: most products are giftable
  return true
}

/**
 * Apply brand-specific overrides
 */
function applyBrandOverrides(product: Product, facets: Facets, overrides: Overrides): Facets {
  if (!product.brand) return facets

  const brandKey = Object.keys(overrides.brands).find(
    (b) => normalizeText(b) === normalizeText(product.brand!)
  )

  if (brandKey) {
    const override = overrides.brands[brandKey]
    return {
      ...facets,
      ...(override.audience && { audience: override.audience as Audience[] }),
      ...(override.category && { category: override.category as Category }),
      reasons: [...facets.reasons, `Brand override applied: ${override.reason || brandKey}`],
    }
  }

  return facets
}

/**
 * Apply SKU-specific overrides
 */
function applySKUOverrides(product: Product, facets: Facets, overrides: Overrides): Facets {
  const override = overrides.skus[product.id]

  if (override) {
    return {
      ...facets,
      ...(override.audience && { audience: override.audience as Audience[] }),
      ...(override.category && { category: override.category as Category }),
      reasons: [...facets.reasons, `SKU override applied: ${override.reason || product.id}`],
    }
  }

  return facets
}

/**
 * Check if product should be excluded
 */
function shouldExclude(product: Product, overrides: Overrides): boolean {
  const fullText = createSearchText(product)

  // Check SKU exclusion
  if (overrides.exclude.sku.includes(product.id)) {
    return true
  }

  // Check brand exclusion
  if (
    product.brand &&
    overrides.exclude.brands.some((b) => normalizeText(b) === normalizeText(product.brand!))
  ) {
    return true
  }

  // Check text exclusion
  if (overrides.exclude.contains.some((text) => fullText.includes(normalizeText(text)))) {
    return true
  }

  // Check force include (overrides all exclusions)
  if (overrides.forceInclude.includes(product.id)) {
    return false
  }

  return false
}

// ==================== Main Classifier ====================

/**
 * Classify a single product
 */
export function classify(product: Product, config: ClassifierConfig): ClassifiedProduct | null {
  // Check exclusions first
  if (shouldExclude(product, config.overrides)) {
    return null
  }

  // Price filters
  if (product.price < config.minPrice || product.price > config.maxPrice) {
    return null
  }

  // Classify dimensions
  const audienceResult = classifyAudience(product, config.keywords.audience)
  const categoryResult = classifyCategory(product, config.keywords.categories, config.gpcMapping)
  const priceBucket = classifyPriceBucket(product.price)
  const occasions = classifyOccasions(product, config.keywords.occasions)
  const interests = classifyInterests(product, config.keywords.interests)

  // Initial facets
  let facets: Facets = {
    audience: audienceResult.audiences,
    category: categoryResult.category,
    priceBucket,
    occasions,
    interests,
    confidence: (audienceResult.confidence + categoryResult.confidence) / 2,
    reasons: [...audienceResult.reasons, ...categoryResult.reasons],
    needsReview: false,
    isGiftable: isGiftable(product, config.keywords),
  }

  // Apply overrides
  facets = applyBrandOverrides(product, facets, config.overrides)
  facets = applySKUOverrides(product, facets, config.overrides)

  // Flag for review if low confidence
  if (facets.confidence < config.confidenceThreshold) {
    facets.needsReview = true
    facets.reasons.push(`Low confidence (${facets.confidence.toFixed(2)})`)
  }

  return {
    ...product,
    facets,
    searchText: createSearchText(product),
    canonicalKey: '', // Will be set by hash.ts
  }
}

/**
 * Classify multiple products in batch
 */
export function classifyBatch(products: Product[], config: ClassifierConfig): ClassifiedProduct[] {
  const classified: ClassifiedProduct[] = []
  const excluded: number[] = []

  for (let i = 0; i < products.length; i++) {
    const result = classify(products[i], config)
    if (result) {
      classified.push(result)
    } else {
      excluded.push(i)
    }
  }

  if (excluded.length > 0) {
    console.log(`Excluded ${excluded.length}/${products.length} products`)
  }

  return classified
}

/**
 * Create default classifier configuration
 */
export function createDefaultConfig(
  keywords: KeywordSet,
  gpcMapping: GPCMapping,
  overrides: Overrides
): ClassifierConfig {
  return {
    keywords,
    gpcMapping,
    overrides,
    confidenceThreshold: 0.5,
    minPrice: 5,
    maxPrice: 1000,
    titleWeight: 1.0,
    categoryWeight: 0.8,
  }
}
