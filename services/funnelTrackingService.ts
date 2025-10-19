/**
 * Funnel Tracking Service
 * 
 * Track multi-step user journeys through conversion funnels.
 * Measures drop-off rates, time per step, and conversion metrics.
 * 
 * Supported Funnels:
 * - giftfinder_flow: Home → GiftFinder → Filters → Product → Affiliate
 * - deals_flow: Deals Page → Product View → Affiliate Click
 * - category_flow: Category → Product → Affiliate
 */

import { trackFunnelStep, getOrCreateSessionId } from './analyticsEventService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FunnelStep {
  name: string;
  stepNumber: number;
  timestamp: number;
  timeFromPrevious?: number; // milliseconds since previous step
}

export interface FunnelSession {
  funnelName: string;
  sessionId: string;
  startTime: number;
  steps: FunnelStep[];
  currentStep: number;
  completed: boolean;
}

export interface FunnelMetrics {
  funnelName: string;
  totalSessions: number;
  completedSessions: number;
  completionRate: number; // percentage
  averageTimeToComplete: number; // milliseconds
  stepMetrics: StepMetrics[];
  dropOffRate: number; // percentage
  mostCommonDropOff: string; // step name
}

export interface StepMetrics {
  stepName: string;
  stepNumber: number;
  reached: number; // how many sessions reached this step
  completed: number; // how many sessions completed this step
  dropOff: number; // how many sessions dropped off at this step
  dropOffRate: number; // percentage
  averageTime: number; // milliseconds spent on this step
}

// ============================================================================
// FUNNEL DEFINITIONS
// ============================================================================

export const FUNNEL_DEFINITIONS = {
  giftfinder_flow: {
    name: 'GiftFinder Flow',
    steps: [
      'start_giftfinder',
      'apply_filters',
      'view_results',
      'view_product',
      'click_affiliate',
      'outbound'
    ]
  },
  deals_flow: {
    name: 'Deals Flow',
    steps: [
      'view_deals_page',
      'view_deal',
      'click_affiliate',
      'outbound'
    ]
  },
  category_flow: {
    name: 'Category Flow',
    steps: [
      'view_category',
      'view_product',
      'click_affiliate',
      'outbound'
    ]
  },
  blog_flow: {
    name: 'Blog Flow',
    steps: [
      'view_blog_post',
      'click_product_link',
      'click_affiliate',
      'outbound'
    ]
  }
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_PREFIX = 'gifteez_funnel_';
const SESSION_KEY = 'gifteez_funnel_session';
const METRICS_KEY = 'gifteez_funnel_metrics';
const MAX_SESSIONS_STORED = 100; // Keep last 100 sessions per funnel

// ============================================================================
// FUNNEL SESSION MANAGEMENT
// ============================================================================

/**
 * Start a new funnel tracking session
 * 
 * @param funnelName - Name of funnel to track
 * @returns Session ID
 * 
 * @example
 * const sessionId = startFunnel('giftfinder_flow');
 */
export function startFunnel(funnelName: string): string {
  const sessionId = getOrCreateSessionId();
  
  const session: FunnelSession = {
    funnelName,
    sessionId,
    startTime: Date.now(),
    steps: [],
    currentStep: 0,
    completed: false
  };
  
  // Store session
  sessionStorage.setItem(`${STORAGE_PREFIX}${funnelName}`, JSON.stringify(session));
  
  console.log(`[FunnelTracking] Started funnel: ${funnelName}, session: ${sessionId}`);
  
  return sessionId;
}

/**
 * Track completion of a funnel step
 * 
 * @param funnelName - Name of funnel
 * @param stepName - Name of step completed
 * 
 * @example
 * completeStep('giftfinder_flow', 'apply_filters');
 */
export function completeStep(funnelName: string, stepName: string): void {
  // Get current session
  const sessionData = sessionStorage.getItem(`${STORAGE_PREFIX}${funnelName}`);
  
  if (!sessionData) {
    console.warn(`[FunnelTracking] No active session for funnel: ${funnelName}`);
    return;
  }
  
  const session: FunnelSession = JSON.parse(sessionData);
  const now = Date.now();
  
  // Calculate time from previous step
  const timeFromPrevious = session.steps.length > 0
    ? now - session.steps[session.steps.length - 1].timestamp
    : now - session.startTime;
  
  // Get step number from funnel definition
  const funnelDef = FUNNEL_DEFINITIONS[funnelName as keyof typeof FUNNEL_DEFINITIONS];
  const stepNumber = funnelDef.steps.indexOf(stepName) + 1;
  
  if (stepNumber === 0) {
    console.warn(`[FunnelTracking] Unknown step: ${stepName} for funnel: ${funnelName}`);
    return;
  }
  
  // Add step to session
  const step: FunnelStep = {
    name: stepName,
    stepNumber,
    timestamp: now,
    timeFromPrevious
  };
  
  session.steps.push(step);
  session.currentStep = stepNumber;
  
  // Check if funnel completed
  if (stepNumber === funnelDef.steps.length) {
    session.completed = true;
  }
  
  // Update session storage
  sessionStorage.setItem(`${STORAGE_PREFIX}${funnelName}`, JSON.stringify(session));
  
  // Track step completion via analytics
  trackFunnelStep(funnelName, stepName, stepNumber, session.sessionId, timeFromPrevious);
  
  console.log(`[FunnelTracking] Completed step: ${stepName} (${stepNumber}/${funnelDef.steps.length}) in ${timeFromPrevious}ms`);
  
  // Save to metrics if completed or user dropped off
  saveFunnelMetrics(session);
}

/**
 * Get current funnel session
 * 
 * @param funnelName - Name of funnel
 * @returns Current session or null
 */
export function getCurrentSession(funnelName: string): FunnelSession | null {
  const sessionData = sessionStorage.getItem(`${STORAGE_PREFIX}${funnelName}`);
  return sessionData ? JSON.parse(sessionData) : null;
}

/**
 * End current funnel session (mark as dropped off)
 * 
 * @param funnelName - Name of funnel
 */
export function endFunnel(funnelName: string): void {
  const session = getCurrentSession(funnelName);
  
  if (session) {
    saveFunnelMetrics(session);
    sessionStorage.removeItem(`${STORAGE_PREFIX}${funnelName}`);
    console.log(`[FunnelTracking] Ended funnel: ${funnelName}`);
  }
}

// ============================================================================
// METRICS CALCULATION
// ============================================================================

/**
 * Save funnel session to metrics (localStorage)
 * 
 * @param session - Funnel session to save
 */
function saveFunnelMetrics(session: FunnelSession): void {
  const metricsData = localStorage.getItem(METRICS_KEY);
  const allMetrics: Record<string, FunnelSession[]> = metricsData ? JSON.parse(metricsData) : {};
  
  // Initialize funnel array if doesn't exist
  if (!allMetrics[session.funnelName]) {
    allMetrics[session.funnelName] = [];
  }
  
  // Add session to metrics
  allMetrics[session.funnelName].push(session);
  
  // Keep only last MAX_SESSIONS_STORED sessions
  if (allMetrics[session.funnelName].length > MAX_SESSIONS_STORED) {
    allMetrics[session.funnelName] = allMetrics[session.funnelName].slice(-MAX_SESSIONS_STORED);
  }
  
  // Save back to localStorage
  localStorage.setItem(METRICS_KEY, JSON.stringify(allMetrics));
}

/**
 * Get funnel metrics (conversion rates, drop-off, etc.)
 * 
 * @param funnelName - Name of funnel
 * @returns Funnel metrics
 * 
 * @example
 * const metrics = getFunnelMetrics('giftfinder_flow');
 * console.log(`Conversion rate: ${metrics.completionRate}%`);
 */
export function getFunnelMetrics(funnelName: string): FunnelMetrics | null {
  const metricsData = localStorage.getItem(METRICS_KEY);
  
  if (!metricsData) {
    return null;
  }
  
  const allMetrics: Record<string, FunnelSession[]> = JSON.parse(metricsData);
  const sessions = allMetrics[funnelName] || [];
  
  if (sessions.length === 0) {
    return null;
  }
  
  const funnelDef = FUNNEL_DEFINITIONS[funnelName as keyof typeof FUNNEL_DEFINITIONS];
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.completed).length;
  const completionRate = (completedSessions / totalSessions) * 100;
  
  // Calculate average time to complete
  const completedTimes = sessions
    .filter(s => s.completed)
    .map(s => {
      const lastStep = s.steps[s.steps.length - 1];
      return lastStep.timestamp - s.startTime;
    });
  
  const averageTimeToComplete = completedTimes.length > 0
    ? completedTimes.reduce((sum, time) => sum + time, 0) / completedTimes.length
    : 0;
  
  // Calculate step metrics
  const stepMetrics: StepMetrics[] = funnelDef.steps.map((stepName, index) => {
    const stepNumber = index + 1;
    
    // How many sessions reached this step
    const reached = sessions.filter(s => 
      s.steps.some(step => step.stepNumber >= stepNumber)
    ).length;
    
    // How many sessions completed this step
    const completed = sessions.filter(s =>
      s.steps.some(step => step.stepNumber === stepNumber)
    ).length;
    
    // How many dropped off at this step (reached but didn't complete next)
    const dropOff = stepNumber < funnelDef.steps.length
      ? reached - sessions.filter(s => 
          s.steps.some(step => step.stepNumber > stepNumber)
        ).length
      : 0;
    
    const dropOffRate = reached > 0 ? (dropOff / reached) * 100 : 0;
    
    // Average time spent on this step
    const stepTimes = sessions
      .map(s => s.steps.find(step => step.stepNumber === stepNumber))
      .filter(step => step && step.timeFromPrevious)
      .map(step => step!.timeFromPrevious!);
    
    const averageTime = stepTimes.length > 0
      ? stepTimes.reduce((sum, time) => sum + time, 0) / stepTimes.length
      : 0;
    
    return {
      stepName,
      stepNumber,
      reached,
      completed,
      dropOff,
      dropOffRate,
      averageTime
    };
  });
  
  // Find most common drop-off point
  const dropOffRates = stepMetrics.map(sm => ({ name: sm.stepName, rate: sm.dropOffRate }));
  const mostCommonDropOff = dropOffRates.sort((a, b) => b.rate - a.rate)[0]?.name || 'Unknown';
  
  // Calculate overall drop-off rate
  const dropOffRate = 100 - completionRate;
  
  return {
    funnelName,
    totalSessions,
    completedSessions,
    completionRate,
    averageTimeToComplete,
    stepMetrics,
    dropOffRate,
    mostCommonDropOff
  };
}

/**
 * Get drop-off rate for specific step
 * 
 * @param funnelName - Name of funnel
 * @param stepName - Name of step
 * @returns Drop-off rate (percentage)
 */
export function getDropOffRate(funnelName: string, stepName: string): number {
  const metrics = getFunnelMetrics(funnelName);
  
  if (!metrics) {
    return 0;
  }
  
  const stepMetric = metrics.stepMetrics.find(sm => sm.stepName === stepName);
  return stepMetric?.dropOffRate || 0;
}

/**
 * Get all funnel metrics
 * 
 * @returns Object with metrics for all funnels
 */
export function getAllFunnelMetrics(): Record<string, FunnelMetrics> {
  const metricsData = localStorage.getItem(METRICS_KEY);
  
  if (!metricsData) {
    return {};
  }
  
  const allMetrics: Record<string, FunnelSession[]> = JSON.parse(metricsData);
  const result: Record<string, FunnelMetrics> = {};
  
  Object.keys(allMetrics).forEach(funnelName => {
    const metrics = getFunnelMetrics(funnelName);
    if (metrics) {
      result[funnelName] = metrics;
    }
  });
  
  return result;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clear all funnel metrics (for testing/privacy)
 */
export function clearFunnelMetrics(): void {
  localStorage.removeItem(METRICS_KEY);
  
  // Also clear active sessions
  Object.keys(FUNNEL_DEFINITIONS).forEach(funnelName => {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${funnelName}`);
  });
  
  console.log('[FunnelTracking] Cleared all funnel metrics');
}

/**
 * Export funnel metrics (for admin/analysis)
 * 
 * @returns All funnel metrics as JSON string
 */
export function exportFunnelMetrics(): string {
  const allMetrics = getAllFunnelMetrics();
  return JSON.stringify(allMetrics, null, 2);
}

/**
 * Format time duration (milliseconds to human-readable)
 * 
 * @param ms - Milliseconds
 * @returns Formatted string (e.g., "2m 30s")
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const FunnelTracking = {
  // Session management
  start: startFunnel,
  completeStep,
  getCurrent: getCurrentSession,
  end: endFunnel,
  
  // Metrics
  getMetrics: getFunnelMetrics,
  getAllMetrics: getAllFunnelMetrics,
  getDropOffRate,
  
  // Utilities
  clear: clearFunnelMetrics,
  export: exportFunnelMetrics,
  formatDuration,
  
  // Definitions
  definitions: FUNNEL_DEFINITIONS
};

export default FunnelTracking;
