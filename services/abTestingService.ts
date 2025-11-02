/**
 * A/B Testing Service
 *
 * Lightweight A/B testing framework with consistent user assignment.
 * Supports multi-variant tests (A/B/C/D/...) and conversion tracking.
 *
 * Features:
 * - Deterministic variant assignment (based on user ID hash)
 * - Automatic GTM event tracking
 * - Conversion rate calculation
 * - Statistical significance testing
 * - Admin dashboard integration
 */

import { logger } from '../lib/logger'
import { pushToDataLayer } from './dataLayerService'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ABTestConfig<T = any> {
  name: string
  variants: Record<string, T> // { A: value, B: value, C: value }
  weights?: Record<string, number> // { A: 0.5, B: 0.3, C: 0.2 } (default: equal)
}

export interface ABTestResult {
  testName: string
  variant: string
  assignedAt: number
}

export interface VariantMetrics {
  variant: string
  impressions: number
  conversions: number
  conversionRate: number // percentage
  averageConversionTime?: number // milliseconds
}

export interface ABTestMetrics {
  testName: string
  totalImpressions: number
  totalConversions: number
  overallConversionRate: number
  variants: VariantMetrics[]
  winningVariant?: string // Variant with highest conversion rate
  statisticalSignificance?: boolean // Is result statistically significant?
  startDate: number
  lastUpdated: number
}

export interface ConversionEvent {
  testName: string
  variant: string
  action: string // 'click', 'submit', 'purchase', etc.
  timestamp: number
  timeSinceImpression?: number // milliseconds
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const ASSIGNMENT_KEY = 'gifteez_ab_assignments'
const METRICS_KEY = 'gifteez_ab_metrics'
const USER_ID_KEY = 'gifteez_user_id'

// ============================================================================
// USER IDENTIFICATION
// ============================================================================

/**
 * Get or create persistent user ID
 * Uses localStorage to persist across sessions
 *
 * @returns User ID (random string)
 */
function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY)

  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(USER_ID_KEY, userId)
  }

  return userId
}

/**
 * Hash string to number (for deterministic variant assignment)
 *
 * @param str - String to hash
 * @returns Hash value (0-1)
 */
function hashString(str: string): number {
  let hash = 0

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Normalize to 0-1 range
  return Math.abs(hash) / 2147483647
}

// ============================================================================
// VARIANT ASSIGNMENT
// ============================================================================

/**
 * Get assigned variant for a test
 * Assignment is deterministic (same user always gets same variant)
 *
 * @param testName - Name of A/B test
 * @param variants - Object with variant values
 * @param weights - Optional weights for each variant (default: equal)
 * @returns Variant key (e.g., 'A', 'B', 'C')
 *
 * @example
 * const variant = getVariant('hero_cta_test', {
 *   A: 'Vind het perfecte cadeau',
 *   B: 'Start GiftFinder',
 *   C: 'Ontdek jouw ideale cadeau'
 * });
 */
export function getVariant<T>(
  testName: string,
  variants: Record<string, T>,
  weights?: Record<string, number>
): string {
  // Check if already assigned
  const assignments = getAssignments()

  if (assignments[testName]) {
    return assignments[testName].variant
  }

  // Get user ID and create deterministic hash
  const userId = getUserId()
  const hash = hashString(`${userId}_${testName}`)

  // Get variant keys
  const variantKeys = Object.keys(variants)

  // Calculate weights (default to equal distribution)
  const variantWeights =
    weights || variantKeys.reduce((acc, key) => ({ ...acc, [key]: 1 / variantKeys.length }), {})

  // Normalize weights to sum to 1
  const totalWeight = Object.values(variantWeights).reduce(
    (sum: number, w) => sum + (w as number),
    0
  )
  const normalizedWeights = Object.entries(variantWeights).reduce(
    (acc, [key, weight]) => ({ ...acc, [key]: (weight as number) / (totalWeight as number) }),
    {} as Record<string, number>
  )

  // Assign variant based on hash and weights
  let cumulativeWeight = 0
  let assignedVariant = variantKeys[0] // Fallback to first variant

  for (const [key, weight] of Object.entries(normalizedWeights)) {
    cumulativeWeight += weight

    if (hash <= cumulativeWeight) {
      assignedVariant = key
      break
    }
  }

  // Store assignment
  const assignment: ABTestResult = {
    testName,
    variant: assignedVariant,
    assignedAt: Date.now(),
  }

  assignments[testName] = assignment
  localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(assignments))

  // Track impression in GTM
  trackVariantImpression(testName, assignedVariant)

  logger.info('ABTest variant assigned', {
    testName,
    variant: assignedVariant,
  })

  return assignedVariant
}

/**
 * Get variant value (not just key)
 *
 * @param testName - Name of A/B test
 * @param variants - Object with variant values
 * @param weights - Optional weights
 * @returns Variant value
 *
 * @example
 * const ctaText = getVariantValue('hero_cta_test', {
 *   A: 'Vind het perfecte cadeau',
 *   B: 'Start GiftFinder'
 * });
 * // Returns: 'Vind het perfecte cadeau' or 'Start GiftFinder'
 */
export function getVariantValue<T>(
  testName: string,
  variants: Record<string, T>,
  weights?: Record<string, number>
): T {
  const variantKey = getVariant(testName, variants, weights)
  return variants[variantKey]
}

/**
 * Get all variant assignments for current user
 *
 * @returns Object with all assignments
 */
function getAssignments(): Record<string, ABTestResult> {
  const data = localStorage.getItem(ASSIGNMENT_KEY)
  return data ? JSON.parse(data) : {}
}

/**
 * Force assignment to specific variant (for testing)
 *
 * @param testName - Name of test
 * @param variant - Variant to assign
 */
export function forceVariant(testName: string, variant: string): void {
  const assignments = getAssignments()

  assignments[testName] = {
    testName,
    variant,
    assignedAt: Date.now(),
  }

  localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(assignments))

  logger.warn('ABTest variant forced', {
    testName,
    variant,
  })
}

// ============================================================================
// EVENT TRACKING
// ============================================================================

/**
 * Track variant impression (automatically called by getVariant)
 *
 * @param testName - Name of test
 * @param variant - Variant shown
 */
export function trackVariantImpression(testName: string, variant: string): void {
  // Push to GTM dataLayer
  pushToDataLayer({
    event: 'ab_variant_impression',
    test_name: testName,
    variant_name: variant,
    user_id: getUserId(),
  })

  // Update metrics
  updateMetrics(testName, variant, 'impression')
}

/**
 * Track variant conversion
 *
 * @param testName - Name of test
 * @param variant - Variant that converted
 * @param action - Conversion action (e.g., 'click', 'submit', 'purchase')
 *
 * @example
 * const variant = getVariant('hero_cta_test', variants);
 *
 * <Button onClick={() => {
 *   trackVariantConversion('hero_cta_test', variant, 'click');
 *   navigateTo('giftFinder');
 * }}>
 *   {variants[variant]}
 * </Button>
 */
export function trackVariantConversion(
  testName: string,
  variant: string,
  action: string = 'conversion'
): void {
  const assignments = getAssignments()
  const assignment = assignments[testName]

  // Calculate time since impression
  const timeSinceImpression = assignment ? Date.now() - assignment.assignedAt : undefined

  // Push to GTM dataLayer
  pushToDataLayer({
    event: 'ab_variant_conversion',
    test_name: testName,
    variant_name: variant,
    conversion_action: action,
    time_since_impression: timeSinceImpression,
    user_id: getUserId(),
  })

  // Update metrics
  updateMetrics(testName, variant, 'conversion', timeSinceImpression)

  logger.info('ABTest conversion recorded', {
    testName,
    variant,
    action,
  })
}

// ============================================================================
// METRICS MANAGEMENT
// ============================================================================

/**
 * Update metrics for variant
 *
 * @param testName - Name of test
 * @param variant - Variant
 * @param type - 'impression' or 'conversion'
 * @param timeSinceImpression - Time since impression (for conversions)
 */
function updateMetrics(
  testName: string,
  variant: string,
  type: 'impression' | 'conversion',
  timeSinceImpression?: number
): void {
  const allMetrics = getAllMetrics()

  // Initialize test metrics if doesn't exist
  if (!allMetrics[testName]) {
    allMetrics[testName] = {
      testName,
      totalImpressions: 0,
      totalConversions: 0,
      overallConversionRate: 0,
      variants: [],
      startDate: Date.now(),
      lastUpdated: Date.now(),
    }
  }

  const testMetrics = allMetrics[testName]

  // Find or create variant metrics
  let variantMetrics = testMetrics.variants.find((v) => v.variant === variant)

  if (!variantMetrics) {
    variantMetrics = {
      variant,
      impressions: 0,
      conversions: 0,
      conversionRate: 0,
    }
    testMetrics.variants.push(variantMetrics)
  }

  // Update counts
  if (type === 'impression') {
    variantMetrics.impressions++
    testMetrics.totalImpressions++
  } else if (type === 'conversion') {
    variantMetrics.conversions++
    testMetrics.totalConversions++

    // Update average conversion time
    if (timeSinceImpression) {
      const currentAvg = variantMetrics.averageConversionTime || 0
      const count = variantMetrics.conversions
      variantMetrics.averageConversionTime =
        (currentAvg * (count - 1) + timeSinceImpression) / count
    }
  }

  // Recalculate conversion rates
  variantMetrics.conversionRate =
    variantMetrics.impressions > 0
      ? (variantMetrics.conversions / variantMetrics.impressions) * 100
      : 0

  testMetrics.overallConversionRate =
    testMetrics.totalImpressions > 0
      ? (testMetrics.totalConversions / testMetrics.totalImpressions) * 100
      : 0

  // Determine winning variant
  if (testMetrics.variants.length > 1) {
    const sorted = [...testMetrics.variants].sort((a, b) => b.conversionRate - a.conversionRate)
    testMetrics.winningVariant = sorted[0].variant

    // Simple statistical significance check (>100 impressions per variant, >5% difference)
    const hasEnoughData = testMetrics.variants.every((v) => v.impressions >= 100)
    const significantDifference = sorted[0].conversionRate - sorted[1].conversionRate > 5
    testMetrics.statisticalSignificance = hasEnoughData && significantDifference
  }

  testMetrics.lastUpdated = Date.now()

  // Save metrics
  localStorage.setItem(METRICS_KEY, JSON.stringify(allMetrics))
}

/**
 * Get metrics for specific A/B test
 *
 * @param testName - Name of test
 * @returns Test metrics or null
 */
export function getTestMetrics(testName: string): ABTestMetrics | null {
  const allMetrics = getAllMetrics()
  return allMetrics[testName] || null
}

/**
 * Get all A/B test metrics
 *
 * @returns Object with all test metrics
 */
function getAllMetrics(): Record<string, ABTestMetrics> {
  const data = localStorage.getItem(METRICS_KEY)
  return data ? JSON.parse(data) : {}
}

/**
 * Get all A/B test metrics (public version)
 *
 * @returns Array of test metrics
 */
export function getAllTestMetrics(): ABTestMetrics[] {
  return Object.values(getAllMetrics())
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clear all A/B test data (for testing/privacy)
 */
export function clearAllTests(): void {
  localStorage.removeItem(ASSIGNMENT_KEY)
  localStorage.removeItem(METRICS_KEY)
  logger.info('ABTest storage cleared')
}

/**
 * Clear specific test data
 *
 * @param testName - Name of test to clear
 */
export function clearTest(testName: string): void {
  // Clear assignment
  const assignments = getAssignments()
  delete assignments[testName]
  localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(assignments))

  // Clear metrics
  const allMetrics = getAllMetrics()
  delete allMetrics[testName]
  localStorage.setItem(METRICS_KEY, JSON.stringify(allMetrics))

  logger.info('ABTest test cleared', { testName })
}

/**
 * Export all A/B test results (for analysis)
 *
 * @returns JSON string with all results
 */
export function exportTestResults(): string {
  const allMetrics = getAllTestMetrics()
  return JSON.stringify(allMetrics, null, 2)
}

/**
 * Check if test has statistical significance
 *
 * @param testName - Name of test
 * @returns True if statistically significant
 */
export function isStatisticallySignificant(testName: string): boolean {
  const metrics = getTestMetrics(testName)
  return metrics?.statisticalSignificance || false
}

/**
 * Get winning variant for test
 *
 * @param testName - Name of test
 * @returns Winning variant or null
 */
export function getWinningVariant(testName: string): string | null {
  const metrics = getTestMetrics(testName)
  return metrics?.winningVariant || null
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const ABTesting = {
  // Variant assignment
  getVariant,
  getVariantValue,
  forceVariant,

  // Tracking
  trackImpression: trackVariantImpression,
  trackConversion: trackVariantConversion,

  // Metrics
  getMetrics: getTestMetrics,
  getAllMetrics: getAllTestMetrics,
  getWinner: getWinningVariant,
  isSignificant: isStatisticallySignificant,

  // Utilities
  clear: clearAllTests,
  clearTest,
  export: exportTestResults,
}

export default ABTesting
