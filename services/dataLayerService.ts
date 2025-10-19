/**
 * Google Tag Manager DataLayer Service
 *
 * Centralized service for pushing events to GTM dataLayer.
 * All tracking events (GA4, Pinterest, etc.) should go through this service.
 *
 * Benefits:
 * - Single source of truth for tracking
 * - Easy to manage via GTM dashboard
 * - No code changes needed for new tracking tools
 * - Better debugging with GTM Preview Mode
 */

// Extend Window interface to include dataLayer
declare global {
  interface Window {
    dataLayer: any[]
  }
}

// Initialize dataLayer if it doesn't exist
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || []
}

/**
 * Generic function to push any event to dataLayer
 */
export const pushToDataLayer = (data: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(data)
    console.log('[DataLayer]', data) // Remove in production if needed
  }
}

/**
 * Page View Tracking
 * Fired when user navigates to a new page
 */
export const trackPageView = (pagePath: string, pageTitle: string) => {
  pushToDataLayer({
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href,
  })
}

/**
 * Search Event
 * Fired when user performs a search (GiftFinder, blog search, etc.)
 */
export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  pushToDataLayer({
    event: 'search',
    search_term: searchTerm,
    results_count: resultsCount || 0,
  })
}

/**
 * Product/Deal Click
 * Fired when user clicks on a product or deal
 */
export const trackProductClick = (params: {
  productName: string
  price?: string
  category?: string
  retailer?: string
  position?: number
}) => {
  pushToDataLayer({
    event: 'product_click',
    product_name: params.productName,
    price: params.price || 'N/A',
    category: params.category || 'Unknown',
    retailer: params.retailer || 'Unknown',
    position: params.position || 0,
    currency: 'EUR',
  })
}

/**
 * Product/Deal Impression
 * Fired when a product becomes visible in viewport
 */
export const trackProductImpression = (params: {
  productName: string
  price?: string
  category?: string
  retailer?: string
  position?: number
}) => {
  pushToDataLayer({
    event: 'product_impression',
    product_name: params.productName,
    price: params.price || 'N/A',
    category: params.category || 'Unknown',
    retailer: params.retailer || 'Unknown',
    position: params.position || 0,
    currency: 'EUR',
  })
}

/**
 * Add to Favorites
 * Fired when user adds a product to favorites
 */
export const trackAddToFavorites = (productName: string, category?: string) => {
  pushToDataLayer({
    event: 'add_to_favorites',
    product_name: productName,
    category: category || 'Unknown',
  })
}

/**
 * Remove from Favorites
 * Fired when user removes a product from favorites
 */
export const trackRemoveFromFavorites = (productName: string) => {
  pushToDataLayer({
    event: 'remove_from_favorites',
    product_name: productName,
  })
}

/**
 * Lead/Conversion Event
 * Fired when user completes a valuable action (contact form, quiz completion, etc.)
 */
export const trackLead = (leadType: string, value?: string) => {
  pushToDataLayer({
    event: 'generate_lead',
    lead_type: leadType,
    value: value || '',
    currency: 'EUR',
  })
}

/**
 * Quiz Started
 * Fired when user starts the personality quiz
 */
export const trackQuizStart = () => {
  pushToDataLayer({
    event: 'quiz_start',
  })
}

/**
 * Quiz Completed
 * Fired when user completes the quiz
 */
export const trackQuizComplete = (personality: string) => {
  pushToDataLayer({
    event: 'quiz_complete',
    personality_type: personality,
  })
}

/**
 * GiftFinder Search
 * Fired when user uses the GiftFinder tool
 */
export const trackGiftFinderSearch = (params: {
  occasion?: string
  recipient?: string
  budget?: string
  interests?: string[]
  resultsCount?: number
}) => {
  pushToDataLayer({
    event: 'giftfinder_search',
    occasion: params.occasion || 'Unknown',
    recipient: params.recipient || 'Unknown',
    budget: params.budget || 'Unknown',
    interests: params.interests?.join(', ') || 'None',
    results_count: params.resultsCount || 0,
  })
}

/**
 * Outbound Link Click
 * Fired when user clicks an affiliate link
 */
export const trackOutboundClick = (params: {
  url: string
  retailer: string
  productName?: string
}) => {
  pushToDataLayer({
    event: 'outbound_click',
    outbound_url: params.url,
    retailer: params.retailer,
    product_name: params.productName || 'Unknown',
  })
}

/**
 * Social Share
 * Fired when user shares content on social media
 */
export const trackSocialShare = (platform: string, contentType: string) => {
  pushToDataLayer({
    event: 'social_share',
    platform: platform,
    content_type: contentType,
  })
}

/**
 * User Login
 * Fired when user logs in
 */
export const trackLogin = (method: string) => {
  pushToDataLayer({
    event: 'login',
    method: method,
  })
}

/**
 * User Signup
 * Fired when user creates an account
 */
export const trackSignup = (method: string) => {
  pushToDataLayer({
    event: 'sign_up',
    method: method,
  })
}

/**
 * Blog Post Read
 * Fired when user reads a blog post (scrolls to 50%+)
 */
export const trackBlogRead = (params: {
  postTitle: string
  postSlug: string
  category: string
  scrollDepth: number
}) => {
  pushToDataLayer({
    event: 'blog_read',
    post_title: params.postTitle,
    post_slug: params.postSlug,
    category: params.category,
    scroll_depth: params.scrollDepth,
  })
}

/**
 * Custom Event
 * For any custom tracking needs
 */
export const trackCustomEvent = (eventName: string, data?: Record<string, any>) => {
  pushToDataLayer({
    event: eventName,
    ...data,
  })
}

// Export all functions as a service object for easier imports
export const DataLayerService = {
  push: pushToDataLayer,
  pageView: trackPageView,
  search: trackSearch,
  productClick: trackProductClick,
  productImpression: trackProductImpression,
  addToFavorites: trackAddToFavorites,
  removeFromFavorites: trackRemoveFromFavorites,
  lead: trackLead,
  quizStart: trackQuizStart,
  quizComplete: trackQuizComplete,
  giftFinderSearch: trackGiftFinderSearch,
  outboundClick: trackOutboundClick,
  socialShare: trackSocialShare,
  login: trackLogin,
  signup: trackSignup,
  blogRead: trackBlogRead,
  customEvent: trackCustomEvent,
}

export default DataLayerService
