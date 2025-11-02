/**
 * Feature Flags Service
 *
 * Features:
 * - Environment-based feature flags
 * - Runtime feature toggling
 * - A/B testing support
 * - User-specific feature rollouts
 * - Feature flag analytics
 */

import { env } from './env'
import { logger } from './logger'

type FeatureFlag =
  | 'giftAI'
  | 'advancedFilters'
  | 'socialSharing'
  | 'newsletter'
  | 'affiliateDisclosure'
  | 'blog'
  | 'deals'
  | 'quiz'
  | 'adminDashboard'
  | 'productRecommendations'

interface FeatureFlagOverride {
  flag: FeatureFlag
  enabled: boolean
  expiresAt?: number
}

interface ABTestConfig {
  name: string
  variants: string[]
  distribution: number[] // Percentage for each variant (should sum to 100)
}

class FeatureFlagService {
  private overrides: Map<FeatureFlag, FeatureFlagOverride> = new Map()
  private abTests: Map<string, ABTestConfig> = new Map()

  constructor() {
    this.loadOverridesFromStorage()
    this.cleanupExpiredOverrides()
  }

  /**
   * Load overrides from localStorage
   */
  private loadOverridesFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('gifteez_feature_overrides')
      if (stored) {
        const overrides: FeatureFlagOverride[] = JSON.parse(stored)
        overrides.forEach((override) => {
          this.overrides.set(override.flag, override)
        })
        logger.debug('Feature flag overrides loaded', { count: overrides.length })
      }
    } catch (error) {
      logger.warn('Failed to load feature flag overrides', { error })
    }
  }

  /**
   * Save overrides to localStorage
   */
  private saveOverridesToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const overrides = Array.from(this.overrides.values())
      localStorage.setItem('gifteez_feature_overrides', JSON.stringify(overrides))
    } catch (error) {
      logger.warn('Failed to save feature flag overrides', { error })
    }
  }

  /**
   * Clean up expired overrides
   */
  private cleanupExpiredOverrides(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [flag, override] of this.overrides.entries()) {
      if (override.expiresAt && now > override.expiresAt) {
        this.overrides.delete(flag)
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.saveOverridesToStorage()
      logger.info('Cleaned up expired feature flag overrides', { count: cleaned })
    }
  }

  /**
   * Check if feature is enabled
   */
  isEnabled(flag: FeatureFlag): boolean {
    // Check for runtime override first
    const override = this.overrides.get(flag)
    if (override) {
      // Check if override is expired
      if (override.expiresAt && Date.now() > override.expiresAt) {
        this.overrides.delete(flag)
        this.saveOverridesToStorage()
      } else {
        logger.debug('Feature flag override applied', { flag, enabled: override.enabled })
        return override.enabled
      }
    }

    // Fall back to environment config
    return env.isFeatureEnabled(flag)
  }

  /**
   * Set runtime override for a feature flag
   */
  setOverride(flag: FeatureFlag, enabled: boolean, expiresInMs?: number): void {
    const override: FeatureFlagOverride = {
      flag,
      enabled,
      expiresAt: expiresInMs ? Date.now() + expiresInMs : undefined,
    }

    this.overrides.set(flag, override)
    this.saveOverridesToStorage()

    logger.info('Feature flag override set', {
      flag,
      enabled,
      expiresAt: override.expiresAt,
    })
  }

  /**
   * Clear override for a feature flag
   */
  clearOverride(flag: FeatureFlag): void {
    this.overrides.delete(flag)
    this.saveOverridesToStorage()
    logger.info('Feature flag override cleared', { flag })
  }

  /**
   * Clear all overrides
   */
  clearAllOverrides(): void {
    this.overrides.clear()
    this.saveOverridesToStorage()
    logger.info('All feature flag overrides cleared')
  }

  /**
   * Get all feature flags status
   */
  getAllFlags(): Record<string, boolean> {
    const flags: FeatureFlag[] = [
      'giftAI',
      'advancedFilters',
      'socialSharing',
      'newsletter',
      'affiliateDisclosure',
      'blog',
      'deals',
      'quiz',
      'adminDashboard',
      'productRecommendations',
    ]

    const status: Record<string, boolean> = {}
    flags.forEach((flag) => {
      status[flag] = this.isEnabled(flag)
    })

    return status
  }

  /**
   * Register an A/B test
   */
  registerABTest(config: ABTestConfig): void {
    // Validate distribution
    const sum = config.distribution.reduce((a, b) => a + b, 0)
    if (Math.abs(sum - 100) > 0.01) {
      throw new Error('A/B test distribution must sum to 100')
    }

    this.abTests.set(config.name, config)
    logger.info('A/B test registered', { name: config.name, variants: config.variants })
  }

  /**
   * Get A/B test variant for user
   */
  getABTestVariant(testName: string, userId?: string): string | null {
    const test = this.abTests.get(testName)
    if (!test) {
      logger.warn('A/B test not found', { testName })
      return null
    }

    // Check for persistent variant in storage
    const storageKey = `gifteez_ab_${testName}`
    const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null

    if (stored) {
      return stored
    }

    // Assign variant based on distribution
    const random = Math.random() * 100
    let cumulative = 0
    let variant = test.variants[0]

    for (let i = 0; i < test.variants.length; i++) {
      cumulative += test.distribution[i]
      if (random <= cumulative) {
        variant = test.variants[i]
        break
      }
    }

    // Store variant
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, variant)
    }

    logger.info('A/B test variant assigned', {
      test: testName,
      variant,
      userId,
    })

    return variant
  }

  /**
   * Log feature usage for analytics
   */
  logFeatureUsage(flag: FeatureFlag, action: string): void {
    logger.logUserAction(`Feature: ${flag} - ${action}`, {
      flag,
      action,
      enabled: this.isEnabled(flag),
    })
  }

  /**
   * Enable debug mode (shows all feature flags in console)
   */
  debug(): void {
    const flags = this.getAllFlags()
    const overrides = Array.from(this.overrides.values()).map((override) => ({
      flag: override.flag,
      enabled: override.enabled,
      expiresAt: override.expiresAt,
    }))

    logger.info('Feature Flags Debug Snapshot', {
      flags,
      overrides,
    })

    if (this.abTests.size > 0) {
      const tests = Array.from(this.abTests.entries()).map(([name, test]) => ({
        name,
        variants: test.variants,
        distribution: test.distribution,
        assignedVariant: this.getABTestVariant(name),
      }))

      logger.info('Feature Flags A/B Tests Debug Snapshot', { tests })
    }
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagService()

// Export types
export type { FeatureFlag, ABTestConfig }

// Export helper hook for React components
export function useFeatureFlag(flag: FeatureFlag): boolean {
  return featureFlags.isEnabled(flag)
}
