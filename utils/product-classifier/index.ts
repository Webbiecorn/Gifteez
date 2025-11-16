/**
 * Product Classifier - Main Export
 *
 * Use this to import all classifier functionality in one go:
 *
 * import {
 *   normalize,
 *   classify,
 *   dedup,
 *   diversify
 * } from './utils/product-classifier'
 */

// Types
export type {
  Product,
  ClassifiedProduct,
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
  DiversifyOptions,
  ProgrammaticIndex,
  RawFeedRow,
  FeedSource,
} from './types'

// Normalization
export {
  normalize,
  normalizeBatch,
  normalizeAWIN,
  normalizeCoolblue,
  normalizeBol,
  normalizeAmazon,
  normalizeManual,
} from './normalize'

// Classification
export { classify, classifyBatch, createDefaultConfig } from './classifier'

// Hashing & Deduplication
export { canonicalKey, identifierHash, areDuplicates, assignCanonicalKeys } from './hash'

// Diversification
export {
  dedup,
  dedupMultiSource,
  diversify,
  diversifyMMR,
  getDiversityStats,
  DEFAULT_DIVERSIFY_OPTIONS,
} from './diversify'
