/**
 * useFunnelTracking Hook
 * 
 * React hook for tracking user journey through conversion funnels.
 * Automatically manages funnel session lifecycle.
 * 
 * @example
 * const { trackStep } = useFunnelTracking('giftfinder_flow');
 * 
 * useEffect(() => {
 *   trackStep('view_homepage');
 * }, []);
 * 
 * const handleGiftFinderStart = () => {
 *   trackStep('start_giftfinder');
 *   navigateTo('giftFinder');
 * };
 */

import { useEffect, useCallback, useRef } from 'react';
import {
  startFunnel,
  completeStep,
  endFunnel,
  getCurrentSession,
  FunnelSession
} from '../services/funnelTrackingService';

export interface UseFunnelTrackingOptions {
  /**
   * Auto-start funnel on mount (default: true)
   */
  autoStart?: boolean;
  
  /**
   * Auto-end funnel on unmount (default: true)
   */
  autoEnd?: boolean;
}

export interface UseFunnelTrackingReturn {
  /**
   * Track completion of a step
   */
  trackStep: (stepName: string) => void;
  
  /**
   * Get current funnel session
   */
  getSession: () => FunnelSession | null;
  
  /**
   * Manually start funnel
   */
  start: () => void;
  
  /**
   * Manually end funnel
   */
  end: () => void;
}

export function useFunnelTracking(
  funnelName: string,
  options: UseFunnelTrackingOptions = {}
): UseFunnelTrackingReturn {
  const {
    autoStart = true,
    autoEnd = true
  } = options;
  
  const funnelNameRef = useRef(funnelName);
  const hasStartedRef = useRef(false);
  
  // Start funnel on mount
  useEffect(() => {
    if (autoStart && !hasStartedRef.current) {
      startFunnel(funnelNameRef.current);
      hasStartedRef.current = true;
    }
    
    // End funnel on unmount
    return () => {
      if (autoEnd && hasStartedRef.current) {
        endFunnel(funnelNameRef.current);
      }
    };
  }, [autoStart, autoEnd]);
  
  // Track step completion
  const trackStep = useCallback((stepName: string) => {
    completeStep(funnelNameRef.current, stepName);
  }, []);
  
  // Get current session
  const getSession = useCallback(() => {
    return getCurrentSession(funnelNameRef.current);
  }, []);
  
  // Manually start funnel
  const start = useCallback(() => {
    startFunnel(funnelNameRef.current);
    hasStartedRef.current = true;
  }, []);
  
  // Manually end funnel
  const end = useCallback(() => {
    endFunnel(funnelNameRef.current);
    hasStartedRef.current = false;
  }, []);
  
  return {
    trackStep,
    getSession,
    start,
    end
  };
}

export default useFunnelTracking;
