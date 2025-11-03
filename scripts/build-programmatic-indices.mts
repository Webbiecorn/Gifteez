#!/usr/bin/env node
/**
 * Build Programmatic Product Indices
 * 
 * This script:
 * 1. Loads product feeds (AWIN, Coolblue, Bol, etc.)
 * 2. Normalizes products to unified format
 * 3. Classifies products (audience, category, price bucket)
 * 4. Deduplicates and diversifies
 * 5. Generates JSON files for each programmatic landing page
 * 
 * Usage:
 *   node scripts/build-programmatic-indices.mts
 *   npm run build:indices
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { parse as parseCSV } from 'csv-parse/sync'
import * as yaml from 'yaml'

// Import our classifier modules (adjust paths as needed)
import type {
  Product,
  ClassifiedProduct,
  ClassifierConfig,
  ProgrammaticIndex,
  KeywordSet,
  GPCMapping,
  Overrides
} from '../utils/product-classifier/types.ts'
import { normalize, normalizeBatch } from '../utils/product-classifier/normalize.ts'
import { classify, classifyBatch, createDefaultConfig } from '../utils/product-classifier/classifier.ts'
import { assignCanonicalKeys } from '../utils/product-classifier/hash.ts'
import { dedupMultiSource, diversifyMMR, getDiversityStats } from '../utils/product-classifier/diversify.ts'

// Import your programmatic configs
import { PROGRAMMATIC_INDEX } from '../data/programmatic/index.js'
import type { ProgrammaticConfig } from '../data/programmatic/index.js'

// ==================== Configuration ====================

const FEEDS_DIR = resolve('./data/feeds')
const OUTPUT_DIR = resolve('./public/programmatic')
const TAXONOMY_DIR = resolve('./data/taxonomy')

// Feed file paths (adjust to your setup)
const FEED_PATHS = {
  coolblue: resolve(FEEDS_DIR, process.env.TEST_MODE === 'true' ? 'coolblue-test-500.csv' : 'coolblue-feed.csv'),
  // awin: resolve(FEEDS_DIR, 'awin-feed.csv'), // Add when available
  // bol: resolve(FEEDS_DIR, 'bol-feed.csv'),
}

// ==================== APPROVED MERCHANTS WHITELIST ====================
// Only show products from merchants you're approved for!
// IMPORTANT: Add merchants ONLY after getting approval from affiliate networks
const APPROVED_MERCHANTS = [
  'Coolblue',
  'Coolblue NL',
  'Shop Like You Give A Damn',
  'PartyPro',
  'PartyPro.nl',
  // Add more merchants ONLY after approval!
  // Examples when approved:
  // 'MediaMarkt',
  // 'Bol.com',
]

/**
 * Check if a product is from an approved merchant
 */
function isApprovedMerchant(product: Product | ClassifiedProduct): boolean {
  // Get merchant name from raw data (not brand!)
  const merchantName = (product as any)._raw?.merchant_name || ''
  
  // If no merchant info, allow (for direct Amazon/custom feeds without merchant field)
  if (!merchantName) return true
  
  // Check against whitelist (case-insensitive)
  return APPROVED_MERCHANTS.some(approved => 
    merchantName.toLowerCase().includes(approved.toLowerCase()) ||
    approved.toLowerCase().includes(merchantName.toLowerCase())
  )
}

// ==================== Load Taxonomy ====================

function loadTaxonomy(): {
  keywords: KeywordSet
  gpcMapping: GPCMapping
  overrides: Overrides
} {
  console.log('📚 Loading taxonomy...')
  
  const keywordsYaml = readFileSync(resolve(TAXONOMY_DIR, 'keywords.yaml'), 'utf-8')
  const keywords = yaml.parse(keywordsYaml) as KeywordSet
  
  const gpcMapping = JSON.parse(
    readFileSync(resolve(TAXONOMY_DIR, 'gpc-mapping.json'), 'utf-8')
  ) as GPCMapping
  
  const overrides = JSON.parse(
    readFileSync(resolve(TAXONOMY_DIR, 'overrides.json'), 'utf-8')
  ) as Overrides
  
  console.log('  ✓ Keywords loaded')
  console.log('  ✓ GPC mapping loaded')
  console.log('  ✓ Overrides loaded')
  
  return { keywords, gpcMapping, overrides }
}

// ==================== Load Feeds ====================

function loadCSVFeed(filePath: string): Record<string, any>[] {
  if (!existsSync(filePath)) {
    console.warn(`⚠️  Feed not found: ${filePath}`)
    return []
  }
  
  const content = readFileSync(filePath, 'utf-8')
  const records = parseCSV(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  })
  
  return records
}

function loadAllFeeds(): { source: string; products: Product[] }[] {
  console.log('\n📦 Loading product feeds...')
  const feeds: { source: string; products: Product[] }[] = []
  
  // Load Coolblue
  if (existsSync(FEED_PATHS.coolblue)) {
    console.log('  Loading Coolblue feed...')
    const rows = loadCSVFeed(FEED_PATHS.coolblue)
    const products = normalizeBatch(rows, 'coolblue')
    console.log(`  ✓ Coolblue: ${products.length} products`)
    feeds.push({ source: 'coolblue', products })
  }
  
  // Add AWIN, Bol, etc. here when available
  // if (existsSync(FEED_PATHS.awin)) { ... }
  
  const totalProducts = feeds.reduce((sum, f) => sum + f.products.length, 0)
  console.log(`\n  Total: ${totalProducts} products from ${feeds.length} source(s)`)
  
  return feeds
}

// ==================== Classification Pipeline ====================

function classifyAllProducts(
  feeds: { source: string; products: Product[] }[],
  config: ClassifierConfig
): ClassifiedProduct[] {
  console.log('\n🔍 Classifying products...')
  
  const allClassified: ClassifiedProduct[] = []
  
  for (const feed of feeds) {
    console.log(`  Classifying ${feed.source}...`)
    const classified = classifyBatch(feed.products, config)
    console.log(`    ${classified.length}/${feed.products.length} passed classification`)
    allClassified.push(...classified)
  }
  
  console.log(`\n  Total classified: ${allClassified.length}`)
  return allClassified
}

// ==================== Filter for Programmatic Page ====================

/**
 * Filter products for a specific programmatic landing page
 */
function filterForPage(
  products: ClassifiedProduct[],
  config: ProgrammaticConfig
): ClassifiedProduct[] {
  let filtered = [...products]
  
  // Filter by audience
  if (config.audience && config.audience.length > 0) {
    filtered = filtered.filter(p =>
      p.facets.audience.some(a => config.audience!.includes(a as any))
    )
  }
  
  // Filter by occasion
  if (config.occasion) {
    filtered = filtered.filter(p =>
      p.facets.occasions?.includes(config.occasion as any)
    )
  }
  
  // Filter by price
  if (config.budgetMax) {
    filtered = filtered.filter(p => p.price <= config.budgetMax!)
  }
  
  if (config.filters?.maxPrice) {
    filtered = filtered.filter(p => p.price <= config.filters!.maxPrice!)
  }
  
  // Filter by keywords (if specified)
  if (config.filters?.keywords && config.filters.keywords.length > 0) {
    filtered = filtered.filter(p => {
      const searchText = p.searchText.toLowerCase()
      return config.filters!.keywords!.some(kw => 
        searchText.includes(kw.toLowerCase())
      )
    })
  }
  
  // Exclude by keywords
  if (config.filters?.excludeKeywords && config.filters.excludeKeywords.length > 0) {
    filtered = filtered.filter(p => {
      const searchText = p.searchText.toLowerCase()
      return !config.filters!.excludeKeywords!.some(kw =>
        searchText.includes(kw.toLowerCase())
      )
    })
  }
  
  // Filter giftable only
  filtered = filtered.filter(p => p.facets.isGiftable)
  
  // ⚠️  CRITICAL: Only show products from approved merchants!
  filtered = filtered.filter(p => isApprovedMerchant(p))
  
  // Sort by confidence
  filtered.sort((a, b) => b.facets.confidence - a.facets.confidence)
  
  return filtered
}

// ==================== Build Index for Page ====================

function buildIndexForPage(
  slug: string,
  config: ProgrammaticConfig,
  allProducts: ClassifiedProduct[]
): ProgrammaticIndex | null {
  console.log(`\n  Building index for: ${slug}`)
  
  // Filter products
  let filtered = filterForPage(allProducts, config)
  console.log(`    Filtered: ${filtered.length} products`)
  
  if (filtered.length === 0) {
    console.warn(`    ⚠️  No products found for ${slug}`)
    return null
  }
  
  // Assign canonical keys
  filtered = assignCanonicalKeys(filtered)
  
  // Deduplicate
  filtered = dedupMultiSource(filtered)
  console.log(`    After dedup: ${filtered.length} products`)
  
  // Diversify
  const maxResults = config.filters?.maxResults || 24
  const diversified = diversifyMMR(filtered, {
    maxTotal: maxResults,
    maxPerBrand: 2,
    maxPerCategory: 8
  })
  console.log(`    After diversify: ${diversified.length} products`)
  
  // Get stats
  const stats = getDiversityStats(diversified)
  
  // Calculate price range
  const prices = diversified.map(p => p.price)
  const priceRange: [number, number] = [
    Math.min(...prices),
    Math.max(...prices)
  ]
  
  // Confidence distribution
  const confidenceDistribution: Record<string, number> = {
    'high (>0.8)': diversified.filter(p => p.facets.confidence > 0.8).length,
    'medium (0.5-0.8)': diversified.filter(p => p.facets.confidence >= 0.5 && p.facets.confidence <= 0.8).length,
    'low (<0.5)': diversified.filter(p => p.facets.confidence < 0.5).length
  }
  
  return {
    routeKey: `cadeaus/${slug}`,
    metadata: {
      title: config.title,
      description: config.intro,
      audience: config.audience?.[0] as any,
      occasion: config.occasion as any,
      totalProducts: diversified.length,
      generatedAt: new Date().toISOString()
    },
    featured: [], // TODO: Add editorial picks from config.editorPicks
    products: diversified,
    stats: {
      uniqueBrands: stats.uniqueBrands,
      uniqueCategories: stats.uniqueCategories,
      averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      priceRange,
      confidenceDistribution
    }
  }
}

// ==================== Main Build Process ====================

async function main() {
  console.log('🚀 Building Programmatic Product Indices\n')
  console.log('='.repeat(60))
  console.log('DEBUG: Starting build process...')
  console.log('DEBUG: Current directory:', process.cwd())
  console.log('DEBUG: TEST_MODE:', process.env.TEST_MODE)
  
  try {
    // Load taxonomy
    const { keywords, gpcMapping, overrides } = loadTaxonomy()
    const config = createDefaultConfig(keywords, gpcMapping, overrides)
    
    // Load feeds
    const feeds = loadAllFeeds()
    if (feeds.length === 0) {
      console.error('❌ No feeds found. Please add feed files to:', FEEDS_DIR)
      process.exit(1)
    }
    
    // Classify all products
    const allClassified = classifyAllProducts(feeds, config)
    if (allClassified.length === 0) {
      console.error('❌ No products passed classification')
      process.exit(1)
    }
    
    // Create output directory
    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true })
    }
    
    // Build index for each programmatic page
    console.log('\n📄 Building page indices...')
    console.log('='.repeat(60))
    
    const pages = Object.entries(PROGRAMMATIC_INDEX)
    let successCount = 0
    let failCount = 0
    
    for (const [slug, pageConfig] of pages) {
      try {
        const index = buildIndexForPage(slug, pageConfig, allClassified)
        
        if (index) {
          const outputPath = resolve(OUTPUT_DIR, `${slug}.json`)
          
          // Create subdirectories if needed
          const dir = dirname(outputPath)
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true })
          }
          
          writeFileSync(outputPath, JSON.stringify(index, null, 2))
          console.log(`    ✓ Written: ${outputPath}`)
          successCount++
        } else {
          failCount++
        }
      } catch (error) {
        console.error(`    ❌ Failed to build ${slug}:`, error)
        failCount++
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('✨ Build Complete!\n')
    console.log(`  Success: ${successCount} pages`)
    console.log(`  Failed:  ${failCount} pages`)
    console.log(`  Output:  ${OUTPUT_DIR}`)
    console.log('\n' + '='.repeat(60))
    
    if (failCount > 0) {
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n❌ Build failed:', error)
    process.exit(1)
  }
}

// Run if called directly
// Always run when this file is executed
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

export { main }
