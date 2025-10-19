import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analyticsEventService from '../analyticsEventService'
import {
  clearFunnelMetrics,
  completeStep,
  endFunnel,
  FUNNEL_DEFINITIONS,
  getAllFunnelMetrics,
  getCurrentSession,
  getDropOffRate,
  getFunnelMetrics,
  startFunnel
} from '../funnelTrackingService'

describe('funnelTrackingService', () => {
  let trackFunnelStepSpy: any
  let getOrCreateSessionIdSpy: any

  beforeEach(() => {
    // Clear storage and metrics (service uses sessionStorage, not localStorage!)
    sessionStorage.clear()
    localStorage.clear()
    clearFunnelMetrics()

    // Setup spies
    trackFunnelStepSpy = vi.spyOn(analyticsEventService, 'trackFunnelStep')
    getOrCreateSessionIdSpy = vi
      .spyOn(analyticsEventService, 'getOrCreateSessionId')
      .mockReturnValue('test-session-123')

    vi.clearAllMocks()
  })

  describe('FUNNEL_DEFINITIONS', () => {
    it('should define giftfinder_flow funnel', () => {
      expect(FUNNEL_DEFINITIONS.giftfinder_flow).toBeDefined()
      expect(FUNNEL_DEFINITIONS.giftfinder_flow.name).toBe('GiftFinder Flow')
      expect(FUNNEL_DEFINITIONS.giftfinder_flow.steps).toContain('start_giftfinder')
      expect(FUNNEL_DEFINITIONS.giftfinder_flow.steps).toContain('click_affiliate')
    })

    it('should define deals_flow funnel', () => {
      expect(FUNNEL_DEFINITIONS.deals_flow).toBeDefined()
      expect(FUNNEL_DEFINITIONS.deals_flow.name).toBe('Deals Flow')
      expect(FUNNEL_DEFINITIONS.deals_flow.steps).toContain('view_deals_page')
    })

    it('should define category_flow funnel', () => {
      expect(FUNNEL_DEFINITIONS.category_flow).toBeDefined()
      expect(FUNNEL_DEFINITIONS.category_flow.name).toBe('Category Flow')
    })

    it('should define blog_flow funnel', () => {
      expect(FUNNEL_DEFINITIONS.blog_flow).toBeDefined()
      expect(FUNNEL_DEFINITIONS.blog_flow.name).toBe('Blog Flow')
    })
  })

  describe('startFunnel', () => {
    it('should start a new funnel session', () => {
      const sessionId = startFunnel('giftfinder_flow')

      expect(sessionId).toBe('test-session-123')
      expect(getOrCreateSessionIdSpy).toHaveBeenCalled()
    })

    it('should create session in localStorage', () => {
      startFunnel('giftfinder_flow')

      const session = getCurrentSession('giftfinder_flow')
      expect(session).toBeDefined()
      expect(session?.funnelName).toBe('giftfinder_flow')
      expect(session?.sessionId).toBe('test-session-123')
      expect(session?.steps).toEqual([])
      expect(session?.completed).toBe(false)
    })

    it('should handle multiple funnel sessions', () => {
      const session1 = startFunnel('giftfinder_flow')
      const session2 = startFunnel('deals_flow')

      expect(session1).toBe('test-session-123')
      expect(session2).toBe('test-session-123')

      const giftfinderSession = getCurrentSession('giftfinder_flow')
      const dealsSession = getCurrentSession('deals_flow')

      expect(giftfinderSession?.funnelName).toBe('giftfinder_flow')
      expect(dealsSession?.funnelName).toBe('deals_flow')
    })

    it('should overwrite existing session for same funnel', () => {
      startFunnel('giftfinder_flow')
      completeStep('giftfinder_flow', 'start_giftfinder')

      // Start again - should create new session
      startFunnel('giftfinder_flow')

      const session = getCurrentSession('giftfinder_flow')
      expect(session?.steps.length).toBe(0) // Reset
    })
  })

  describe('completeStep', () => {
    beforeEach(() => {
      startFunnel('giftfinder_flow')
    })

    it('should complete a funnel step', () => {
      completeStep('giftfinder_flow', 'start_giftfinder')

      const session = getCurrentSession('giftfinder_flow')
      expect(session?.steps.length).toBe(1)
      expect(session?.steps[0].name).toBe('start_giftfinder')
      expect(session?.steps[0].stepNumber).toBe(1) // 1-based indexing
    })

    it('should track funnel step to analytics', () => {
      completeStep('giftfinder_flow', 'start_giftfinder')

      expect(trackFunnelStepSpy).toHaveBeenCalledWith(
        'giftfinder_flow',
        'start_giftfinder',
        1, // 1-based step number
        'test-session-123',
        expect.any(Number) // timeFromPrevious (calculated from startTime)
      )
    })

    it('should complete multiple steps in sequence', () => {
      completeStep('giftfinder_flow', 'start_giftfinder')
      completeStep('giftfinder_flow', 'apply_filters')
      completeStep('giftfinder_flow', 'view_results')

      const session = getCurrentSession('giftfinder_flow')
      expect(session?.steps.length).toBe(3)
      expect(session?.steps[0].name).toBe('start_giftfinder')
      expect(session?.steps[1].name).toBe('apply_filters')
      expect(session?.steps[2].name).toBe('view_results')
    })

    it('should calculate time from previous step', async () => {
      completeStep('giftfinder_flow', 'start_giftfinder')

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 50))

      completeStep('giftfinder_flow', 'apply_filters')

      const session = getCurrentSession('giftfinder_flow')
      const secondStep = session?.steps[1]

      expect(secondStep?.timeFromPrevious).toBeGreaterThan(0)
      expect(secondStep?.timeFromPrevious).toBeGreaterThanOrEqual(40) // At least 40ms
    })

    it('should handle completing step without starting funnel', () => {
      clearFunnelMetrics()
      localStorage.clear()

      // Should not throw error
      expect(() => {
        completeStep('giftfinder_flow', 'start_giftfinder')
      }).not.toThrow()
    })

    it('should mark funnel as completed when all steps done', () => {
      const steps = FUNNEL_DEFINITIONS.giftfinder_flow.steps

      steps.forEach((step) => {
        completeStep('giftfinder_flow', step)
      })

      const session = getCurrentSession('giftfinder_flow')
      expect(session?.completed).toBe(true)
    })
  })

  describe('getCurrentSession', () => {
    it('should return null for non-existent funnel', () => {
      const session = getCurrentSession('giftfinder_flow')
      expect(session).toBeNull()
    })

    it('should return current session', () => {
      startFunnel('giftfinder_flow')
      completeStep('giftfinder_flow', 'start_giftfinder')

      const session = getCurrentSession('giftfinder_flow')
      expect(session).toBeDefined()
      expect(session?.funnelName).toBe('giftfinder_flow')
      expect(session?.steps.length).toBe(1)
    })
  })

  describe('endFunnel', () => {
    beforeEach(() => {
      startFunnel('giftfinder_flow')
      completeStep('giftfinder_flow', 'start_giftfinder')
      completeStep('giftfinder_flow', 'apply_filters')
    })

    it('should end funnel and save to history', () => {
      endFunnel('giftfinder_flow')

      // Session should be removed from active sessions
      const session = getCurrentSession('giftfinder_flow')
      expect(session).toBeNull()
    })

    it('should save funnel metrics to localStorage', () => {
      endFunnel('giftfinder_flow')

      const metrics = getFunnelMetrics('giftfinder_flow')
      expect(metrics).toBeDefined()
      expect(metrics?.totalSessions).toBeGreaterThanOrEqual(1)
    })

    it('should handle ending non-existent funnel', () => {
      expect(() => {
        endFunnel('non_existent_funnel')
      }).not.toThrow()
    })
  })

  describe('getFunnelMetrics', () => {
    beforeEach(() => {
      // Create a complete funnel session
      startFunnel('deals_flow')
      completeStep('deals_flow', 'view_deals_page')
      completeStep('deals_flow', 'view_deal')
      completeStep('deals_flow', 'click_affiliate')
      completeStep('deals_flow', 'outbound')
      endFunnel('deals_flow')
    })

    it('should return metrics for funnel', () => {
      const metrics = getFunnelMetrics('deals_flow')

      expect(metrics).toBeDefined()
      expect(metrics?.funnelName).toBe('deals_flow')
      expect(metrics?.totalSessions).toBeGreaterThanOrEqual(1)
    })

    it('should calculate completion rate', () => {
      const metrics = getFunnelMetrics('deals_flow')

      expect(metrics?.completionRate).toBeGreaterThanOrEqual(0)
      expect(metrics?.completionRate).toBeLessThanOrEqual(100)
    })

    it('should include step metrics', () => {
      const metrics = getFunnelMetrics('deals_flow')

      expect(metrics?.stepMetrics).toBeDefined()
      expect(metrics?.stepMetrics.length).toBeGreaterThan(0)
    })

    it('should return null for non-existent funnel', () => {
      const metrics = getFunnelMetrics('non_existent_funnel')
      expect(metrics).toBeNull()
    })

    it('should calculate drop-off rates', () => {
      // Create incomplete funnel (drop-off scenario)
      startFunnel('giftfinder_flow')
      completeStep('giftfinder_flow', 'start_giftfinder')
      completeStep('giftfinder_flow', 'apply_filters')
      // Don't complete remaining steps - simulates drop-off
      endFunnel('giftfinder_flow')

      const metrics = getFunnelMetrics('giftfinder_flow')

      expect(metrics?.dropOffRate).toBeGreaterThan(0)
      expect(metrics?.mostCommonDropOff).toBeDefined()
    })
  })

  describe('getDropOffRate', () => {
    beforeEach(() => {
      // Create sessions with drop-offs
      startFunnel('giftfinder_flow')
      completeStep('giftfinder_flow', 'start_giftfinder')
      completeStep('giftfinder_flow', 'apply_filters')
      endFunnel('giftfinder_flow')
    })

    it('should calculate drop-off rate for specific step', () => {
      const dropOffRate = getDropOffRate('giftfinder_flow', 'apply_filters')

      expect(dropOffRate).toBeGreaterThanOrEqual(0)
      expect(dropOffRate).toBeLessThanOrEqual(100)
    })

    it('should return drop-off rate for first step', () => {
      const dropOffRate = getDropOffRate('giftfinder_flow', 'start_giftfinder')

      // First step CAN have drop-off if users don't complete it
      expect(dropOffRate).toBeGreaterThanOrEqual(0)
      expect(dropOffRate).toBeLessThanOrEqual(100)
    })

    it('should return 0 for non-existent funnel', () => {
      const dropOffRate = getDropOffRate('non_existent_funnel', 'some_step')
      expect(dropOffRate).toBe(0)
    })
  })

  describe('getAllFunnelMetrics', () => {
    beforeEach(() => {
      // Create metrics for multiple funnels
      startFunnel('giftfinder_flow')
      completeStep('giftfinder_flow', 'start_giftfinder')
      endFunnel('giftfinder_flow')

      startFunnel('deals_flow')
      completeStep('deals_flow', 'view_deals_page')
      endFunnel('deals_flow')
    })

    it('should return metrics for all funnels', () => {
      const allMetrics = getAllFunnelMetrics()

      expect(allMetrics).toBeDefined()
      expect(typeof allMetrics).toBe('object')
    })

    it('should include giftfinder_flow metrics', () => {
      const allMetrics = getAllFunnelMetrics()

      expect(allMetrics.giftfinder_flow).toBeDefined()
    })

    it('should include deals_flow metrics', () => {
      const allMetrics = getAllFunnelMetrics()

      expect(allMetrics.deals_flow).toBeDefined()
    })
  })

  describe('clearFunnelMetrics', () => {
    beforeEach(() => {
      startFunnel('giftfinder_flow')
      completeStep('giftfinder_flow', 'start_giftfinder')
      endFunnel('giftfinder_flow')
    })

    it('should clear all funnel metrics', () => {
      const metricsBefore = getFunnelMetrics('giftfinder_flow')
      expect(metricsBefore).toBeDefined()

      clearFunnelMetrics()

      const metricsAfter = getFunnelMetrics('giftfinder_flow')
      expect(metricsAfter).toBeNull()
    })

    it('should clear current sessions', () => {
      startFunnel('giftfinder_flow')

      clearFunnelMetrics()

      const session = getCurrentSession('giftfinder_flow')
      expect(session).toBeNull()
    })
  })

  describe('Complete Funnel Flow', () => {
    it('should track complete giftfinder flow', () => {
      const sessionId = startFunnel('giftfinder_flow')
      expect(sessionId).toBeTruthy()

      completeStep('giftfinder_flow', 'start_giftfinder')
      completeStep('giftfinder_flow', 'apply_filters')
      completeStep('giftfinder_flow', 'view_results')
      completeStep('giftfinder_flow', 'view_product')
      completeStep('giftfinder_flow', 'click_affiliate')
      completeStep('giftfinder_flow', 'outbound')

      const session = getCurrentSession('giftfinder_flow')
      expect(session?.completed).toBe(true)
      expect(session?.steps.length).toBe(6)

      endFunnel('giftfinder_flow')

      const metrics = getFunnelMetrics('giftfinder_flow')
      expect(metrics?.completedSessions).toBeGreaterThanOrEqual(1)
      expect(metrics?.completionRate).toBeGreaterThan(0)
    })

    it('should track partial funnel with drop-off', () => {
      startFunnel('deals_flow')

      completeStep('deals_flow', 'view_deals_page')
      completeStep('deals_flow', 'view_deal')
      // User drops off here, doesn't click affiliate

      const session = getCurrentSession('deals_flow')
      expect(session?.completed).toBe(false)
      expect(session?.steps.length).toBe(2)

      endFunnel('deals_flow')

      const metrics = getFunnelMetrics('deals_flow')
      expect(metrics?.dropOffRate).toBeGreaterThan(0)
    })

    it('should handle multiple concurrent funnels', () => {
      // Start multiple funnels
      startFunnel('giftfinder_flow')
      startFunnel('deals_flow')
      startFunnel('blog_flow')

      // Complete steps in different funnels
      completeStep('giftfinder_flow', 'start_giftfinder')
      completeStep('deals_flow', 'view_deals_page')
      completeStep('blog_flow', 'view_blog_post') // Correct step name

      const session1 = getCurrentSession('giftfinder_flow')
      const session2 = getCurrentSession('deals_flow')
      const session3 = getCurrentSession('blog_flow')

      expect(session1?.steps.length).toBe(1)
      expect(session2?.steps.length).toBe(1)
      expect(session3?.steps.length).toBe(1)
    })
  })

  describe('Performance & Edge Cases', () => {
    it('should handle rapid step completions', () => {
      startFunnel('deals_flow')

      // Complete steps rapidly
      completeStep('deals_flow', 'view_deals_page')
      completeStep('deals_flow', 'view_deal')
      completeStep('deals_flow', 'click_affiliate')
      completeStep('deals_flow', 'outbound')

      const session = getCurrentSession('deals_flow')
      expect(session?.steps.length).toBe(4)
    })

    it('should handle large number of funnel sessions', () => {
      // Create 50 sessions
      for (let i = 0; i < 50; i++) {
        startFunnel('giftfinder_flow')
        completeStep('giftfinder_flow', 'start_giftfinder')
        endFunnel('giftfinder_flow')
      }

      const metrics = getFunnelMetrics('giftfinder_flow')
      expect(metrics?.totalSessions).toBeGreaterThanOrEqual(50)
    })

    it('should handle localStorage quota gracefully', () => {
      // This should not throw even if localStorage is full
      expect(() => {
        for (let i = 0; i < 100; i++) {
          startFunnel('giftfinder_flow')
          FUNNEL_DEFINITIONS.giftfinder_flow.steps.forEach((step) => {
            completeStep('giftfinder_flow', step)
          })
          endFunnel('giftfinder_flow')
        }
      }).not.toThrow()
    })
  })

  describe('Analytics Integration', () => {
    it('should track each step to analytics', () => {
      startFunnel('deals_flow')

      completeStep('deals_flow', 'view_deals_page')
      completeStep('deals_flow', 'view_deal')
      completeStep('deals_flow', 'click_affiliate')

      expect(trackFunnelStepSpy).toHaveBeenCalledTimes(3)
    })

    it('should pass correct step numbers to analytics', () => {
      startFunnel('deals_flow')

      completeStep('deals_flow', 'view_deals_page')
      completeStep('deals_flow', 'view_deal')

      expect(trackFunnelStepSpy).toHaveBeenNthCalledWith(
        1,
        'deals_flow',
        'view_deals_page',
        1, // 1-based: first step
        'test-session-123',
        expect.any(Number) // Time from funnel start
      )

      expect(trackFunnelStepSpy).toHaveBeenNthCalledWith(
        2,
        'deals_flow',
        'view_deal',
        2, // 1-based: second step
        'test-session-123',
        expect.any(Number) // Time from previous step
      )
    })

    it('should use consistent session ID across funnel', () => {
      startFunnel('giftfinder_flow')
      completeStep('giftfinder_flow', 'start_giftfinder')
      completeStep('giftfinder_flow', 'apply_filters')

      const calls = trackFunnelStepSpy.mock.calls
      const sessionIds = calls.map((call) => call[3])

      // All session IDs should be the same
      expect(new Set(sessionIds).size).toBe(1)
      expect(sessionIds[0]).toBe('test-session-123')
    })
  })
})
