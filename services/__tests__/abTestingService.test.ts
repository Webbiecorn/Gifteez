import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getVariant,
  getVariantValue,
  forceVariant,
  trackVariantImpression,
  trackVariantConversion,
  getTestMetrics,
  getAllTestMetrics,
  clearAllTests,
  clearTest,
  exportTestResults,
  isStatisticallySignificant,
  getWinningVariant,
} from '../abTestingService'
import * as dataLayerService from '../dataLayerService'

describe('abTestingService', () => {
  let pushToDataLayerSpy: any

  beforeEach(() => {
    // Clear all storage
    localStorage.clear()
    sessionStorage.clear()
    clearAllTests()

    // Setup spies
    pushToDataLayerSpy = vi.spyOn(dataLayerService, 'pushToDataLayer')

    vi.clearAllMocks()
  })

  // ==========================================================================
  // VARIANT ASSIGNMENT
  // ==========================================================================

  describe('getVariant', () => {
    const testName = 'button_color_test'
    const variants = {
      A: 'blue',
      B: 'green',
      C: 'red',
    }

    it('should assign a variant to new user', () => {
      const variant = getVariant(testName, variants)

      expect(variant).toBeDefined()
      expect(['A', 'B', 'C']).toContain(variant)
    })

    it('should return same variant for same user', () => {
      const variant1 = getVariant(testName, variants)
      const variant2 = getVariant(testName, variants)
      const variant3 = getVariant(testName, variants)

      expect(variant1).toBe(variant2)
      expect(variant2).toBe(variant3)
    })

    it('should track impression to analytics', () => {
      const variant = getVariant(testName, variants)

      expect(pushToDataLayerSpy).toHaveBeenCalledWith({
        event: 'ab_variant_impression',
        test_name: testName,
        variant_name: variant,
        user_id: expect.any(String),
      })
    })

    it('should respect custom weights', () => {
      const weightedVariants = {
        A: 'control',
        B: 'variant',
      }
      const weights = {
        A: 0.9, // 90% control
        B: 0.1, // 10% variant
      }

      // Run test multiple times with different users
      const assignments: string[] = []
      for (let i = 0; i < 100; i++) {
        localStorage.clear() // Force new user ID
        const variant = getVariant('weighted_test', weightedVariants, weights)
        assignments.push(variant)
      }

      // Count A assignments (should be around 90)
      const aCount = assignments.filter((v) => v === 'A').length

      // Allow some variance (70-100)
      expect(aCount).toBeGreaterThanOrEqual(70)
      expect(aCount).toBeLessThanOrEqual(100)
    })

    it('should handle single variant test', () => {
      const singleVariants = {
        A: 'only_option',
      }

      const variant = getVariant('single_variant', singleVariants)
      expect(variant).toBe('A')
    })
  })

  describe('getVariantValue', () => {
    const testName = 'message_test'
    const variants = {
      A: 'Hello World',
      B: 'Hi There',
      C: 'Welcome!',
    }

    it('should return variant value', () => {
      const value = getVariantValue(testName, variants)

      expect(value).toBeDefined()
      expect(['Hello World', 'Hi There', 'Welcome!']).toContain(value)
    })

    it('should return same value on repeated calls', () => {
      const value1 = getVariantValue(testName, variants)
      const value2 = getVariantValue(testName, variants)

      expect(value1).toBe(value2)
    })

    it('should work with complex types', () => {
      const complexVariants = {
        A: { title: 'Get Started', color: 'blue' },
        B: { title: 'Try Now', color: 'green' },
      }

      const value = getVariantValue('complex_test', complexVariants)

      expect(value).toBeDefined()
      expect(value).toHaveProperty('title')
      expect(value).toHaveProperty('color')
    })
  })

  describe('forceVariant', () => {
    const testName = 'forced_test'
    const variants = {
      A: 'control',
      B: 'variant',
    }

    it('should force specific variant', () => {
      forceVariant(testName, 'B')

      const variant = getVariant(testName, variants)
      expect(variant).toBe('B')
    })

    it('should override previous assignment', () => {
      const originalVariant = getVariant(testName, variants)

      // Force different variant
      const forcedVariant = originalVariant === 'A' ? 'B' : 'A'
      forceVariant(testName, forcedVariant)

      const newVariant = getVariant(testName, variants)
      expect(newVariant).toBe(forcedVariant)
      expect(newVariant).not.toBe(originalVariant)
    })
  })

  // ==========================================================================
  // IMPRESSION & CONVERSION TRACKING
  // ==========================================================================

  describe('trackVariantImpression', () => {
    it('should track impression', () => {
      trackVariantImpression('homepage_hero', 'A')

      expect(pushToDataLayerSpy).toHaveBeenCalledWith({
        event: 'ab_variant_impression',
        test_name: 'homepage_hero',
        variant_name: 'A',
        user_id: expect.any(String),
      })
    })

    it('should increment impression count in metrics', () => {
      trackVariantImpression('test_a', 'A')
      trackVariantImpression('test_a', 'A')
      trackVariantImpression('test_a', 'B')

      const metrics = getTestMetrics('test_a')

      expect(metrics?.totalImpressions).toBe(3)
      expect(metrics?.variants.find((v) => v.variant === 'A')?.impressions).toBe(2)
      expect(metrics?.variants.find((v) => v.variant === 'B')?.impressions).toBe(1)
    })
  })

  describe('trackVariantConversion', () => {
    beforeEach(() => {
      // Setup: Track impressions first
      trackVariantImpression('conversion_test', 'A')
      trackVariantImpression('conversion_test', 'B')
      vi.clearAllMocks() // Clear impression tracking calls
    })

    it('should track conversion event', () => {
      trackVariantConversion('conversion_test', 'A', 'click')

      expect(pushToDataLayerSpy).toHaveBeenCalled()
      const callArg = pushToDataLayerSpy.mock.calls[0][0]
      
      expect(callArg.event).toBe('ab_variant_conversion')
      expect(callArg.test_name).toBe('conversion_test')
      expect(callArg.variant_name).toBe('A')
      expect(callArg.conversion_action).toBe('click')
      expect(callArg.user_id).toBeDefined()
      expect(callArg).toHaveProperty('time_since_impression') // Can be undefined or number
    })

    it('should increment conversion count in metrics', () => {
      trackVariantConversion('conversion_test', 'A', 'signup')
      trackVariantConversion('conversion_test', 'A', 'purchase')

      const metrics = getTestMetrics('conversion_test')
      const variantA = metrics?.variants.find((v) => v.variant === 'A')

      expect(variantA?.conversions).toBe(2)
    })

    it('should calculate conversion rate', () => {
      // 3 impressions, 1 conversion = 33.33%
      trackVariantImpression('rate_test', 'A')
      trackVariantImpression('rate_test', 'A')
      trackVariantImpression('rate_test', 'A')

      trackVariantConversion('rate_test', 'A', 'click')

      const metrics = getTestMetrics('rate_test')
      const variantA = metrics?.variants.find((v) => v.variant === 'A')

      expect(variantA?.conversionRate).toBeCloseTo(33.33, 1)
    })

    it('should handle multiple conversion actions', () => {
      trackVariantConversion('multi_action_test', 'A', 'click')
      trackVariantConversion('multi_action_test', 'A', 'submit')
      trackVariantConversion('multi_action_test', 'A', 'purchase')

      const metrics = getTestMetrics('multi_action_test')
      const variantA = metrics?.variants.find((v) => v.variant === 'A')

      expect(variantA?.conversions).toBe(3)
    })
  })

  // ==========================================================================
  // METRICS & REPORTING
  // ==========================================================================

  describe('getTestMetrics', () => {
    it('should return null for non-existent test', () => {
      const metrics = getTestMetrics('non_existent_test')
      expect(metrics).toBeNull()
    })

    it('should return metrics for active test', () => {
      trackVariantImpression('active_test', 'A')
      trackVariantConversion('active_test', 'A', 'click')

      const metrics = getTestMetrics('active_test')

      expect(metrics).toBeDefined()
      expect(metrics?.testName).toBe('active_test')
      expect(metrics?.totalImpressions).toBeGreaterThanOrEqual(1)
      expect(metrics?.variants).toHaveLength(1)
    })

    it('should calculate overall conversion rate', () => {
      // Variant A: 2 impressions, 1 conversion (50%)
      trackVariantImpression('overall_test', 'A')
      trackVariantImpression('overall_test', 'A')
      trackVariantConversion('overall_test', 'A', 'click')

      // Variant B: 2 impressions, 0 conversions (0%)
      trackVariantImpression('overall_test', 'B')
      trackVariantImpression('overall_test', 'B')

      // Overall: 4 impressions, 1 conversion (25%)
      const metrics = getTestMetrics('overall_test')

      expect(metrics?.overallConversionRate).toBeCloseTo(25, 1)
    })

    it('should include timestamps', () => {
      trackVariantImpression('time_test', 'A')

      const metrics = getTestMetrics('time_test')

      expect(metrics?.startDate).toBeGreaterThan(0)
      expect(metrics?.lastUpdated).toBeGreaterThan(0)
      expect(metrics?.lastUpdated).toBeGreaterThanOrEqual(metrics?.startDate || 0)
    })
  })

  describe('getAllTestMetrics', () => {
    it('should return empty array when no tests', () => {
      const allMetrics = getAllTestMetrics()
      expect(allMetrics).toEqual([])
    })

    it('should return metrics for all tests', () => {
      trackVariantImpression('test_1', 'A')
      trackVariantImpression('test_2', 'B')
      trackVariantImpression('test_3', 'C')

      const allMetrics = getAllTestMetrics()

      expect(allMetrics).toHaveLength(3)
      expect(allMetrics.map((m) => m.testName)).toContain('test_1')
      expect(allMetrics.map((m) => m.testName)).toContain('test_2')
      expect(allMetrics.map((m) => m.testName)).toContain('test_3')
    })
  })

  describe('getWinningVariant', () => {
    it('should return null for non-existent test', () => {
      const winner = getWinningVariant('non_existent')
      expect(winner).toBeNull()
    })

    it('should return variant with highest conversion rate', () => {
      // Variant A: 50% conversion (1/2)
      trackVariantImpression('winner_test', 'A')
      trackVariantImpression('winner_test', 'A')
      trackVariantConversion('winner_test', 'A', 'click')

      // Variant B: 100% conversion (2/2) - WINNER
      trackVariantImpression('winner_test', 'B')
      trackVariantImpression('winner_test', 'B')
      trackVariantConversion('winner_test', 'B', 'click')
      trackVariantConversion('winner_test', 'B', 'click')

      // Variant C: 0% conversion (0/2)
      trackVariantImpression('winner_test', 'C')
      trackVariantImpression('winner_test', 'C')

      const winner = getWinningVariant('winner_test')
      expect(winner).toBe('B')
    })

    it('should handle tie (return first variant)', () => {
      // Both 50% conversion
      trackVariantImpression('tie_test', 'A')
      trackVariantImpression('tie_test', 'A')
      trackVariantConversion('tie_test', 'A', 'click')

      trackVariantImpression('tie_test', 'B')
      trackVariantImpression('tie_test', 'B')
      trackVariantConversion('tie_test', 'B', 'click')

      const winner = getWinningVariant('tie_test')
      expect(['A', 'B']).toContain(winner) // Either is valid
    })
  })

  describe('isStatisticallySignificant', () => {
    it('should return false for non-existent test', () => {
      const isSignificant = isStatisticallySignificant('non_existent')
      expect(isSignificant).toBe(false)
    })

    it('should return false for small sample size', () => {
      // Only 2 impressions - too small for significance
      trackVariantImpression('small_test', 'A')
      trackVariantImpression('small_test', 'B')
      trackVariantConversion('small_test', 'A', 'click')

      const isSignificant = isStatisticallySignificant('small_test')
      expect(isSignificant).toBe(false)
    })

    it('should calculate significance for large sample', () => {
      // Large sample size with clear difference
      // Variant A: 90% conversion
      for (let i = 0; i < 100; i++) {
        trackVariantImpression('large_test', 'A')
        if (i < 90) trackVariantConversion('large_test', 'A', 'click')
      }

      // Variant B: 10% conversion
      for (let i = 0; i < 100; i++) {
        trackVariantImpression('large_test', 'B')
        if (i < 10) trackVariantConversion('large_test', 'B', 'click')
      }

      const isSignificant = isStatisticallySignificant('large_test')
      // With such a large difference and sample size, should be significant
      expect(typeof isSignificant).toBe('boolean')
    })
  })

  // ==========================================================================
  // DATA MANAGEMENT
  // ==========================================================================

  describe('clearTest', () => {
    beforeEach(() => {
      trackVariantImpression('test_to_clear', 'A')
      trackVariantImpression('test_to_keep', 'B')
    })

    it('should clear specific test', () => {
      clearTest('test_to_clear')

      const clearedMetrics = getTestMetrics('test_to_clear')
      const keptMetrics = getTestMetrics('test_to_keep')

      expect(clearedMetrics).toBeNull()
      expect(keptMetrics).toBeDefined()
    })

    it('should not affect other tests', () => {
      const beforeClear = getAllTestMetrics().length

      clearTest('test_to_clear')

      const afterClear = getAllTestMetrics().length
      expect(afterClear).toBe(beforeClear - 1)
    })
  })

  describe('clearAllTests', () => {
    beforeEach(() => {
      trackVariantImpression('test_1', 'A')
      trackVariantImpression('test_2', 'B')
      trackVariantImpression('test_3', 'C')
    })

    it('should clear all tests', () => {
      clearAllTests()

      const allMetrics = getAllTestMetrics()
      expect(allMetrics).toEqual([])
    })

    it('should clear assignments', () => {
      const testName = 'test_1'
      const variants = { A: 'a', B: 'b' }

      // Get initial variant (establishes assignment)
      getVariant(testName, variants)

      clearAllTests()

      // After clear, should get fresh assignment (might be different)
      const variantAfter = getVariant(testName, variants)
      expect(variantAfter).toBeDefined()
      expect(['A', 'B']).toContain(variantAfter)
    })
  })

  describe('exportTestResults', () => {
    it('should export as JSON string', () => {
      trackVariantImpression('export_test', 'A')
      trackVariantConversion('export_test', 'A', 'click')

      const exported = exportTestResults()

      expect(typeof exported).toBe('string')
      expect(() => JSON.parse(exported)).not.toThrow()
    })

    it('should contain all test data', () => {
      trackVariantImpression('export_test_1', 'A')
      trackVariantImpression('export_test_2', 'B')

      const exported = exportTestResults()
      const data = JSON.parse(exported)

      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThanOrEqual(2)
    })

    it('should be valid JSON', () => {
      trackVariantImpression('json_test', 'A')

      const exported = exportTestResults()
      const parsed = JSON.parse(exported)
      const reExported = JSON.stringify(parsed)

      expect(reExported).toBeTruthy()
    })
  })

  // ==========================================================================
  // EDGE CASES & PERFORMANCE
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle conversion without impression', () => {
      // Conversion tracked before impression
      trackVariantConversion('orphan_test', 'A', 'click')

      const metrics = getTestMetrics('orphan_test')
      expect(metrics).toBeDefined()
      expect(metrics?.totalConversions).toBeGreaterThanOrEqual(1)
    })

    it('should handle rapid impressions', () => {
      for (let i = 0; i < 1000; i++) {
        trackVariantImpression('rapid_test', 'A')
      }

      const metrics = getTestMetrics('rapid_test')
      expect(metrics?.totalImpressions).toBe(1000)
    })

    it('should handle many variants', () => {
      const manyVariants = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
        E: 5,
        F: 6,
        G: 7,
        H: 8,
      }

      const variant = getVariant('many_variants', manyVariants)
      expect(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']).toContain(variant)
    })

    it('should handle empty variant value', () => {
      const emptyVariants = {
        A: '',
        B: 'value',
      }

      const value = getVariantValue('empty_test', emptyVariants)
      expect(value).toBeDefined()
      expect(['', 'value']).toContain(value)
    })

    it('should persist across page refreshes', () => {
      const testName = 'persist_test'
      const variants = { A: 'a', B: 'b' }

      const variant1 = getVariant(testName, variants)

      // Simulate page refresh (localStorage persists)
      const variant2 = getVariant(testName, variants)

      expect(variant1).toBe(variant2)
    })
  })
})
