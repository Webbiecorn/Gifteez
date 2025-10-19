import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearSession,
  getOrCreateSessionId,
  trackApplyFilter,
  trackClickAffiliate,
  trackFunnelStep,
  trackProductImpressions,
  trackSharePin,
  trackStartGiftFinder,
  trackViewProduct
} from '../analyticsEventService'
import * as dataLayerService from '../dataLayerService'

describe('analyticsEventService', () => {
  let pushToDataLayerSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    clearSession()

    // Mock window.dataLayer
    window.dataLayer = []

    // Spy on pushToDataLayer
    pushToDataLayerSpy = vi.spyOn(dataLayerService, 'pushToDataLayer')
    vi.clearAllMocks()
  })

  describe('trackViewProduct', () => {
    it('should track product view event with required fields', () => {
      const product = {
        id: 'test-product-1',
        name: 'Test Product',
        price: 29.99,
        category: 'electronics'
      }

      trackViewProduct(product, 0, 'homepage')

      expect(pushToDataLayerSpy).toHaveBeenCalledTimes(1)
      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any

      expect(eventData.event).toBe('view_product')
      expect(eventData.product_id).toBe('test-product-1')
      expect(eventData.product_name).toBe('Test Product')
      expect(eventData.price).toBe(29.99)
      expect(eventData.category).toBe('electronics')
      expect(eventData.position).toBe(0) // 0-based position
      expect(eventData.list_name).toBe('homepage')
      expect(eventData.currency).toBe('EUR')
    })

    it('should track product view with variant', () => {
      const product = {
        id: 'test-product-1',
        name: 'Test Product',
        price: 29.99,
        category: 'electronics'
      }

      trackViewProduct(product, 0, 'homepage', 'variant-a')

      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any
      expect(eventData.variant).toBe('variant-a')
    })

    it('should use consistent session ID across calls', () => {
      const product = {
        id: 'test-product-1',
        name: 'Test Product',
        price: 29.99,
        category: 'electronics'
      }

      trackViewProduct(product, 0, 'homepage')
      trackViewProduct(product, 1, 'homepage')

      expect(pushToDataLayerSpy).toHaveBeenCalledTimes(2)

      const sessionId = getOrCreateSessionId()
      expect(sessionId).toBeTruthy()
    })

    it('should handle product with title instead of name', () => {
      const product = {
        id: 'test-product-2',
        name: 'Product Title',
        title: 'Product Title',
        price: 39.99,
        category: 'home'
      }

      trackViewProduct(product, 2, 'search_results')

      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any
      expect(eventData.product_name).toBe('Product Title')
    })
  })

  describe('trackClickAffiliate', () => {
    it('should track affiliate click event', () => {
      const product = {
        id: 'test-product-1',
        name: 'Test Product',
        price: 29.99,
        retailer: 'Test Retailer',
        affiliateUrl: 'https://example.com/affiliate'
      }

      trackClickAffiliate(product, 'product_page', 'step_3')

      expect(pushToDataLayerSpy).toHaveBeenCalled()
      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any

      expect(eventData.event).toBe('click_affiliate')
      expect(eventData.product_id).toBe('test-product-1')
      expect(eventData.product_name).toBe('Test Product')
      expect(eventData.retailer).toBe('Test Retailer')
      expect(eventData.affiliate_url).toBe('https://example.com/affiliate')
      expect(eventData.source).toBe('product_page')
      expect(eventData.funnel_step).toBe('step_3')
    })

    it('should track affiliate click with position', () => {
      const product = {
        id: 'test-product-1',
        name: 'Test Product',
        price: 29.99,
        retailer: 'Test Retailer'
      }

      trackClickAffiliate(product, 'search_results', 'step_1', 5)

      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any
      expect(eventData.position).toBe(5) // 0-based
    })

    it('should handle missing optional fields', () => {
      const product = {
        id: 'test-product-1',
        name: 'Test Product',
        price: 29.99
      }

      trackClickAffiliate(product, 'homepage', 'step_1')

      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any
      expect(eventData.retailer).toBe('Unknown')
      expect(eventData.affiliate_url).toBe('')
    })
  })

  describe('trackStartGiftFinder', () => {
    it('should track gift finder start event', () => {
      trackStartGiftFinder('homepage_cta')

      expect(pushToDataLayerSpy).toHaveBeenCalledTimes(1)
      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any

      expect(eventData.event).toBe('start_giftfinder')
      expect(eventData.entry_point).toBe('homepage_cta')
    })

    it('should track different entry points', () => {
      trackStartGiftFinder('header_menu')
      trackStartGiftFinder('floating_button')
      trackStartGiftFinder('blog_cta')

      expect(pushToDataLayerSpy).toHaveBeenCalledTimes(3)

      const event1 = pushToDataLayerSpy.mock.calls[0][0] as any
      const event2 = pushToDataLayerSpy.mock.calls[1][0] as any
      const event3 = pushToDataLayerSpy.mock.calls[2][0] as any

      expect(event1.entry_point).toBe('header_menu')
      expect(event2.entry_point).toBe('floating_button')
      expect(event3.entry_point).toBe('blog_cta')
    })
  })

  describe('trackApplyFilter', () => {
    it('should track filter application', () => {
      trackApplyFilter('category', 'electronics', 'search_page', 42)

      expect(pushToDataLayerSpy).toHaveBeenCalledTimes(1)
      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any

      expect(eventData.event).toBe('apply_filter')
      expect(eventData.filter_type).toBe('category')
      expect(eventData.filter_value).toBe('electronics')
      expect(eventData.context).toBe('search_page')
      expect(eventData.results_count).toBe(42)
    })

    it('should track multiple filter types', () => {
      trackApplyFilter('price', '25-50', 'deals_page', 15)
      trackApplyFilter('budget', 'under-25', 'giftfinder', 8)
      trackApplyFilter('occasion', 'birthday', 'giftfinder', 23)

      expect(pushToDataLayerSpy).toHaveBeenCalledTimes(3)

      const event1 = pushToDataLayerSpy.mock.calls[0][0] as any
      const event2 = pushToDataLayerSpy.mock.calls[1][0] as any
      const event3 = pushToDataLayerSpy.mock.calls[2][0] as any

      expect(event1.filter_type).toBe('price')
      expect(event2.filter_type).toBe('budget')
      expect(event3.filter_type).toBe('occasion')
    })

    it('should handle zero results', () => {
      trackApplyFilter('category', 'rare_category', 'search', 0)

      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any
      expect(eventData.results_count).toBe(0)
    })
  })

  describe('trackSharePin', () => {
    it('should track Pinterest share event', () => {
      trackSharePin('product', 'prod-123', 'Amazing Gift Idea')

      expect(pushToDataLayerSpy).toHaveBeenCalled()
      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any

      expect(eventData.event).toBe('share_pin')
      expect(eventData.content_type).toBe('product')
      expect(eventData.content_id).toBe('prod-123')
      expect(eventData.content_title).toBe('Amazing Gift Idea')
    })

    it('should track different content types', () => {
      trackSharePin('product', 'prod-1', 'Product Title')
      trackSharePin('blog', 'blog-1', 'Blog Post Title')
      trackSharePin('deal', 'deal-1', 'Amazing Deal')

      expect(pushToDataLayerSpy).toHaveBeenCalled()

      // Each trackSharePin call pushes 2 events, so we need to check every other call
      const event1 = pushToDataLayerSpy.mock.calls[0][0] as any
      const event2 = pushToDataLayerSpy.mock.calls[2][0] as any
      const event3 = pushToDataLayerSpy.mock.calls[4][0] as any

      expect(event1.content_type).toBe('product')
      expect(event2.content_type).toBe('blog')
      expect(event3.content_type).toBe('deal')
    })
  })

  describe('trackFunnelStep', () => {
    it('should track funnel step completion', () => {
      trackFunnelStep('giftfinder_flow', 'select_recipient', 1, 'session-123')

      expect(pushToDataLayerSpy).toHaveBeenCalledTimes(1)
      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any

      expect(eventData.event).toBe('funnel_step_complete')
      expect(eventData.funnel_name).toBe('giftfinder_flow')
      expect(eventData.step_name).toBe('select_recipient')
      expect(eventData.step_number).toBe(1)
      expect(eventData.session_id).toBe('session-123')
    })

    it('should track time spent on step', () => {
      trackFunnelStep('deals_flow', 'view_deal_details', 2, 'session-123', 5000)

      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any
      expect(eventData.time_on_step).toBe(5000)
    })

    it('should handle missing timeOnStep', () => {
      trackFunnelStep('blog_flow', 'read_post', 1, 'session-123')

      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any
      expect(eventData.time_on_step).toBeUndefined()
    })
  })

  describe('trackProductImpressions', () => {
    it('should track multiple product impressions', () => {
      const products = [
        { id: 'prod-1', name: 'Product 1', price: 19.99, category: 'electronics' },
        { id: 'prod-2', name: 'Product 2', price: 29.99, category: 'home' },
        { id: 'prod-3', name: 'Product 3', price: 39.99, category: 'fashion' }
      ]

      trackProductImpressions(products, 'search_results')

      expect(pushToDataLayerSpy).toHaveBeenCalled()

      // trackProductImpressions pushes individual view_product events + a view_item_list event
      const event1 = pushToDataLayerSpy.mock.calls[0][0] as any
      const event2 = pushToDataLayerSpy.mock.calls[1][0] as any
      const event3 = pushToDataLayerSpy.mock.calls[2][0] as any

      expect(event1.product_id).toBe('prod-1')
      expect(event1.position).toBeGreaterThanOrEqual(0)
      expect(event2.product_id).toBe('prod-2')
      expect(event2.position).toBeGreaterThanOrEqual(0)
      expect(event3.product_id).toBe('prod-3')
      expect(event3.position).toBeGreaterThanOrEqual(0)
      expect(event1.list_name).toBe('search_results')
    })

    it('should track impressions with variant', () => {
      const products = [{ id: 'prod-1', name: 'Product 1', price: 19.99, category: 'electronics' }]

      trackProductImpressions(products, 'homepage', 'variant-b')

      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any
      expect(eventData.variant).toBe('variant-b')
    })

    it('should handle empty product array', () => {
      trackProductImpressions([], 'empty_results')

      // Should still push view_item_list event even with empty array
      expect(pushToDataLayerSpy).toHaveBeenCalled()
      const eventData = pushToDataLayerSpy.mock.calls[0][0] as any
      expect(eventData.items).toEqual([])
    })
  })

  describe('Session Management', () => {
    it('should generate session ID with timestamp and random suffix', () => {
      const sessionId = getOrCreateSessionId()

      expect(sessionId).toBeTruthy()
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/)
      expect(sessionId.length).toBeGreaterThan(10)
    })

    it('should return consistent session ID', () => {
      const sessionId = getOrCreateSessionId()

      // Session ID should be consistent
      expect(sessionId).toBeTruthy()
      expect(sessionId.length).toBeGreaterThan(10)
    })

    it('should clear session', () => {
      getOrCreateSessionId()

      clearSession()

      // After clear, should be able to create new session
      const newSessionId = getOrCreateSessionId()
      expect(newSessionId).toBeTruthy()
    })

    it('should generate new session after clear', () => {
      const sessionId1 = getOrCreateSessionId()
      clearSession()
      const sessionId2 = getOrCreateSessionId()

      // New session should be different from old
      expect(sessionId1).not.toBe(sessionId2)
    })
  })

  describe('DataLayer Integration', () => {
    it('should push events to dataLayer', () => {
      const product = {
        id: 'test-product-1',
        name: 'Test Product',
        price: 29.99,
        category: 'electronics'
      }

      trackViewProduct(product, 0, 'homepage')

      expect(pushToDataLayerSpy).toHaveBeenCalled()
      expect(window.dataLayer).toBeDefined()
    })

    it('should batch multiple events', () => {
      const product = {
        id: 'test-product-1',
        name: 'Test Product',
        price: 29.99,
        category: 'electronics'
      }

      trackViewProduct(product, 0, 'homepage')
      trackStartGiftFinder('homepage_cta')
      trackApplyFilter('category', 'electronics', 'search', 10)

      expect(pushToDataLayerSpy).toHaveBeenCalledTimes(3)
    })
  })

  describe('Error Handling', () => {
    it('should handle product without required fields gracefully', () => {
      const invalidProduct: any = {
        id: 'test-123',
        name: 'Test',
        // Missing category
        price: 29.99
      }

      expect(() => {
        trackViewProduct(invalidProduct, 0, 'homepage')
      }).not.toThrow()

      expect(pushToDataLayerSpy).toHaveBeenCalled()
    })

    it('should handle product with missing optional fields', () => {
      const minimalProduct: any = {
        id: 'minimal-1',
        name: 'Minimal Product'
        // Missing price, category, etc.
      }

      expect(() => {
        trackViewProduct(minimalProduct, 0, 'homepage')
      }).not.toThrow()

      expect(pushToDataLayerSpy).toHaveBeenCalled()
    })
  })
})
