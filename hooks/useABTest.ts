/**
 * useABTest Hook
 * 
 * React hook for A/B testing with automatic variant assignment and tracking.
 * Supports multi-variant tests and conversion tracking.
 * 
 * @example
 * const { variant, trackConversion } = useABTest('hero_cta_test', {
 *   A: { text: 'Vind het perfecte cadeau', color: 'blue' },
 *   B: { text: 'Start GiftFinder', color: 'green' },
 *   C: { text: 'Ontdek jouw ideale cadeau', color: 'purple' }
 * });
 * 
 * <Button 
 *   color={variant.color}
 *   onClick={() => {
 *     trackConversion('click');
 *     navigateTo('giftFinder');
 *   }}
 * >
 *   {variant.text}
 * </Button>
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getVariant,
  getVariantValue,
  trackVariantConversion,
  getTestMetrics,
  ABTestMetrics
} from '../services/abTestingService';

export interface UseABTestOptions {
  /**
   * Custom weights for each variant (default: equal distribution)
   * @example { A: 0.5, B: 0.3, C: 0.2 }
   */
  weights?: Record<string, number>;
  
  /**
   * Auto-track impression on mount (default: true)
   */
  autoTrackImpression?: boolean;
}

export interface UseABTestReturn<T> {
  /**
   * Assigned variant key (e.g., 'A', 'B', 'C')
   */
  variantKey: string;
  
  /**
   * Assigned variant value
   */
  variant: T;
  
  /**
   * Track conversion for this variant
   */
  trackConversion: (action?: string) => void;
  
  /**
   * Get test metrics
   */
  getMetrics: () => ABTestMetrics | null;
  
  /**
   * Check if this is the winning variant
   */
  isWinning: boolean;
}

export function useABTest<T>(
  testName: string,
  variants: Record<string, T>,
  options: UseABTestOptions = {}
): UseABTestReturn<T> {
  const {
    weights,
    autoTrackImpression = true
  } = options;
  
  // Get variant assignment (happens once per user)
  const [variantKey] = useState(() => getVariant(testName, variants, weights));
  const [variant] = useState(() => getVariantValue(testName, variants, weights));
  
  // Track metrics
  const [metrics, setMetrics] = useState<ABTestMetrics | null>(() => getTestMetrics(testName));
  
  // Auto-track impression on mount
  useEffect(() => {
    if (autoTrackImpression) {
      // Impression already tracked by getVariant, but we can update metrics
      const currentMetrics = getTestMetrics(testName);
      setMetrics(currentMetrics);
    }
  }, [testName, autoTrackImpression]);
  
  // Track conversion
  const trackConversion = useCallback((action: string = 'conversion') => {
    trackVariantConversion(testName, variantKey, action);
    
    // Update metrics
    const updatedMetrics = getTestMetrics(testName);
    setMetrics(updatedMetrics);
  }, [testName, variantKey]);
  
  // Get current metrics
  const getMetrics = useCallback(() => {
    return getTestMetrics(testName);
  }, [testName]);
  
  // Check if this is the winning variant
  const isWinning = metrics?.winningVariant === variantKey;
  
  return {
    variantKey,
    variant,
    trackConversion,
    getMetrics,
    isWinning
  };
}

export default useABTest;
