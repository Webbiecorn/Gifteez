/**
 * Analytics Event Service
 * 
 * Unified event tracking with consistent schema.
 * All events push to GTM dataLayer for centralized management.
 * 
 * Event Categories:
 * - Product events (view_product, click_affiliate)
 * - User journey (start_giftfinder, apply_filter)
 * - Social (share_pin)
 * - Funnel progression (funnel_step_complete)
 */

import { pushToDataLayer } from './dataLayerService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Product {
  id: string;
  name: string;
  title?: string;
  category?: string;
  price?: number;
  retailer?: string;
  image?: string;
  affiliateUrl?: string;
  originalPrice?: number;
}

export interface ViewProductEvent {
  event: 'view_product';
  product_id: string;
  product_name: string;
  category: string;
  price?: number;
  retailer: string;
  position: number; // 1-based position in list
  list_name: string; // 'giftfinder_results', 'deals_page', 'category_grid'
  variant?: string; // A/B variant if applicable
  currency: 'EUR';
}

export interface ClickAffiliateEvent {
  event: 'click_affiliate';
  product_id: string;
  product_name: string;
  affiliate_url: string;
  retailer: string;
  price?: number;
  category: string;
  source: string; // 'giftfinder', 'deals', 'blog', 'category'
  funnel_step: string; // 'initial_view', 'quick_view', 'detail_page'
  position?: number; // Position in list
  currency: 'EUR';
}

export interface StartGiftFinderEvent {
  event: 'start_giftfinder';
  entry_point: string; // 'homepage_hero', 'navbar', 'floating_cta', 'direct_url'
  timestamp: number;
}

export interface ApplyFilterEvent {
  event: 'apply_filter';
  filter_type: string; // 'occasion', 'recipient', 'budget', 'interests'
  filter_value: string | number | string[];
  context: string; // 'giftfinder', 'deals', 'category'
  results_count: number;
}

export interface SharePinEvent {
  event: 'share_pin';
  content_type: string; // 'product', 'blog', 'deal'
  content_id: string;
  content_title: string;
  platform: 'pinterest';
}

export interface FunnelStepEvent {
  event: 'funnel_step_complete';
  funnel_name: string; // 'product_to_affiliate', 'giftfinder_flow'
  step_name: string; // 'view_product', 'apply_filters', 'click_affiliate'
  step_number: number;
  session_id: string;
  time_on_step?: number; // milliseconds since last step
}

// ============================================================================
// PRODUCT EVENTS
// ============================================================================

/**
 * Track product view/impression
 * 
 * @param product - Product object
 * @param position - Position in list (1-based)
 * @param listName - Name of list ('giftfinder_results', 'deals_page', etc.)
 * @param variant - Optional A/B variant identifier
 * 
 * @example
 * trackViewProduct(product, 1, 'giftfinder_results', 'variant_A');
 */
export function trackViewProduct(
  product: Product,
  position: number,
  listName: string,
  variant?: string
): void {
  const event: ViewProductEvent = {
    event: 'view_product',
    product_id: product.id,
    product_name: product.title || product.name,
    category: product.category || 'Unknown',
    price: product.price,
    retailer: product.retailer || 'Unknown',
    position,
    list_name: listName,
    variant,
    currency: 'EUR'
  };

  pushToDataLayer(event);
}

/**
 * Track affiliate link click
 * 
 * @param product - Product object
 * @param source - Source of click ('giftfinder', 'deals', 'blog', 'category')
 * @param funnelStep - Where in funnel ('initial_view', 'quick_view', 'detail_page')
 * @param position - Optional position in list
 * 
 * @example
 * trackClickAffiliate(product, 'giftfinder', 'quick_view', 3);
 */
export function trackClickAffiliate(
  product: Product,
  source: string,
  funnelStep: string,
  position?: number
): void {
  const event: ClickAffiliateEvent = {
    event: 'click_affiliate',
    product_id: product.id,
    product_name: product.title || product.name,
    affiliate_url: product.affiliateUrl || '',
    retailer: product.retailer || 'Unknown',
    price: product.price,
    category: product.category || 'Unknown',
    source,
    funnel_step: funnelStep,
    position,
    currency: 'EUR'
  };

  pushToDataLayer(event);

  // Also track as GA4 select_item event (for e-commerce tracking)
  pushToDataLayer({
    event: 'select_item',
    items: [{
      item_id: product.id,
      item_name: product.title || product.name,
      item_category: product.category || 'Unknown',
      price: product.price,
      quantity: 1
    }]
  });
}

// ============================================================================
// USER JOURNEY EVENTS
// ============================================================================

/**
 * Track GiftFinder start
 * 
 * @param entryPoint - Where user started GiftFinder
 * 
 * @example
 * trackStartGiftFinder('homepage_hero');
 */
export function trackStartGiftFinder(entryPoint: string): void {
  const event: StartGiftFinderEvent = {
    event: 'start_giftfinder',
    entry_point: entryPoint,
    timestamp: Date.now()
  };

  pushToDataLayer(event);
}

/**
 * Track filter application
 * 
 * @param filterType - Type of filter ('occasion', 'recipient', 'budget', 'interests')
 * @param filterValue - Value(s) selected
 * @param context - Where filter was applied
 * @param resultsCount - Number of results after filter
 * 
 * @example
 * trackApplyFilter('occasion', 'Verjaardag', 'giftfinder', 42);
 */
export function trackApplyFilter(
  filterType: string,
  filterValue: string | number | string[],
  context: string,
  resultsCount: number
): void {
  const event: ApplyFilterEvent = {
    event: 'apply_filter',
    filter_type: filterType,
    filter_value: filterValue,
    context,
    results_count: resultsCount
  };

  pushToDataLayer(event);
}

// ============================================================================
// SOCIAL EVENTS
// ============================================================================

/**
 * Track Pinterest share
 * 
 * @param contentType - Type of content ('product', 'blog', 'deal')
 * @param contentId - ID of content
 * @param contentTitle - Title of content
 * 
 * @example
 * trackSharePin('product', 'prod_123', 'Smart Home Starter Kit');
 */
export function trackSharePin(
  contentType: string,
  contentId: string,
  contentTitle: string
): void {
  const event: SharePinEvent = {
    event: 'share_pin',
    content_type: contentType,
    content_id: contentId,
    content_title: contentTitle,
    platform: 'pinterest'
  };

  pushToDataLayer(event);

  // Also track as GA4 share event
  pushToDataLayer({
    event: 'share',
    method: 'pinterest',
    content_type: contentType,
    item_id: contentId
  });
}

// ============================================================================
// FUNNEL EVENTS
// ============================================================================

/**
 * Track funnel step completion
 * 
 * @param funnelName - Name of funnel ('product_to_affiliate', 'giftfinder_flow')
 * @param stepName - Name of step ('view_product', 'apply_filters', etc.)
 * @param stepNumber - Step number (1-based)
 * @param sessionId - Session identifier
 * @param timeOnStep - Optional time spent on this step (ms)
 * 
 * @example
 * trackFunnelStep('giftfinder_flow', 'apply_filters', 2, 'session_123', 5000);
 */
export function trackFunnelStep(
  funnelName: string,
  stepName: string,
  stepNumber: number,
  sessionId: string,
  timeOnStep?: number
): void {
  const event: FunnelStepEvent = {
    event: 'funnel_step_complete',
    funnel_name: funnelName,
    step_name: stepName,
    step_number: stepNumber,
    session_id: sessionId,
    time_on_step: timeOnStep
  };

  pushToDataLayer(event);
}

// ============================================================================
// BATCH TRACKING (for lists/collections)
// ============================================================================

/**
 * Track multiple product impressions at once
 * 
 * @param products - Array of products
 * @param listName - Name of list
 * @param variant - Optional A/B variant
 * 
 * @example
 * trackProductImpressions(giftResults, 'giftfinder_results', 'variant_A');
 */
export function trackProductImpressions(
  products: Product[],
  listName: string,
  variant?: string
): void {
  products.forEach((product, index) => {
    trackViewProduct(product, index + 1, listName, variant);
  });

  // Also send as single GA4 event with all items
  pushToDataLayer({
    event: 'view_item_list',
    item_list_name: listName,
    items: products.map((product, index) => ({
      item_id: product.id,
      item_name: product.title || product.name,
      item_category: product.category || 'Unknown',
      price: product.price,
      index: index + 1
    }))
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current session ID from sessionStorage
 * Creates new session if none exists
 */
export function getOrCreateSessionId(): string {
  const STORAGE_KEY = 'gifteez_analytics_session_id';
  
  let sessionId = sessionStorage.getItem(STORAGE_KEY);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Clear session ID (useful for testing)
 */
export function clearSession(): void {
  sessionStorage.removeItem('gifteez_analytics_session_id');
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const AnalyticsEvents = {
  // Product events
  viewProduct: trackViewProduct,
  clickAffiliate: trackClickAffiliate,
  
  // User journey
  startGiftFinder: trackStartGiftFinder,
  applyFilter: trackApplyFilter,
  
  // Social
  sharePin: trackSharePin,
  
  // Funnel
  funnelStep: trackFunnelStep,
  
  // Batch
  productImpressions: trackProductImpressions,
  
  // Utilities
  getSessionId: getOrCreateSessionId,
  clearSession
};

export default AnalyticsEvents;
