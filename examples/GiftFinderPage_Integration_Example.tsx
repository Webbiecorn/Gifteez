/**
 * Example Integration: Analytics in GiftFinderPage
 * 
 * This demonstrates how to add comprehensive analytics tracking
 * to the GiftFinder page for funnel and event tracking.
 */

import React, { useEffect } from 'react';
import { useFunnelTracking } from '../hooks/useFunnelTracking';
import {
  trackStartGiftFinder,
  trackApplyFilter,
  trackViewProduct,
  trackProductImpressions,
  Product
} from '../services/analyticsEventService';

// Example usage in GiftFinderPage component
export function GiftFinderPageExample() {
  
  // Setup funnel tracking
  const { trackStep } = useFunnelTracking('giftfinder_flow');
  
  // Track GiftFinder start on page load
  useEffect(() => {
    // Track analytics event
    trackStartGiftFinder('page_visit');
    
    // Track funnel step
    trackStep('start_giftfinder');
  }, [trackStep]);
  
  // Handle filter changes
  const handleOccasionChange = (occasion: string) => {
    // Update local state
    setOccasion(occasion);
    
    // Track analytics event
    trackApplyFilter('occasion', occasion, 'giftfinder', filteredProducts.length);
    
    // Track funnel step
    trackStep('apply_filters');
  };
  
  const handleBudgetChange = (budgetMin: number, budgetMax: number) => {
    setBudgetMin(budgetMin);
    setBudgetMax(budgetMax);
    
    // Track budget filter
    trackApplyFilter('budget', `${budgetMin}-${budgetMax}`, 'giftfinder', filteredProducts.length);
    
    trackStep('apply_filters');
  };
  
  const handleRecipientChange = (recipient: string) => {
    setRecipient(recipient);
    
    trackApplyFilter('recipient', recipient, 'giftfinder', filteredProducts.length);
    
    trackStep('apply_filters');
  };
  
  const handleInterestsChange = (interests: string[]) => {
    setInterests(interests);
    
    trackApplyFilter('interests', interests, 'giftfinder', filteredProducts.length);
    
    trackStep('apply_filters');
  };
  
  // Track product impressions when results are shown
  useEffect(() => {
    if (filteredProducts.length > 0) {
      // Batch track all product impressions
      trackProductImpressions(filteredProducts, 'giftfinder_results');
      
      // Track funnel step
      trackStep('view_results');
    }
  }, [filteredProducts, trackStep]);
  
  // Handle product click
  const handleProductClick = (product: Product, position: number) => {
    // Track individual product view
    trackViewProduct(product, position, 'giftfinder_results');
    
    // Track funnel step
    trackStep('view_product');
  };
  
  return (
    <div className="giftfinder-page">
      {/* Filters */}
      <div className="filters">
        <select onChange={(e) => handleOccasionChange(e.target.value)}>
          <option>Verjaardag</option>
          <option>Kerst</option>
          <option>Sinterklaas</option>
        </select>
        
        <select onChange={(e) => handleRecipientChange(e.target.value)}>
          <option>Partner</option>
          <option>Vriend(in)</option>
          <option>Familielid</option>
        </select>
        
        {/* Budget slider */}
        <input 
          type="range" 
          min="0" 
          max="500"
          onChange={(e) => handleBudgetChange(0, parseInt(e.target.value))}
        />
      </div>
      
      {/* Results */}
      <div className="results">
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            position={index + 1}
            onClick={() => handleProductClick(product, index + 1)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * GIFTRESULTCARD INTEGRATION:
 * 
 * Add this to your GiftResultCard component when user clicks affiliate link:
 */

import { trackClickAffiliate } from '../services/analyticsEventService';

export function handleAffiliateClick(product: Product) {
  // Track affiliate click
  trackClickAffiliate(product, 'giftfinder', 'result_card', position);
  
  // Track funnel step
  trackStep('click_affiliate');
  
  // Track outbound (from existing dataLayerService)
  trackOutboundClick({
    url: product.affiliateUrl,
    retailer: product.retailer,
    productName: product.name
  });
  
  // Open affiliate link
  window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
}

/**
 * ANALYTICS DATA STRUCTURE:
 * 
 * All events will be sent to GTM with this structure:
 * 
 * apply_filter event:
 * {
 *   event: 'apply_filter',
 *   filter_type: 'occasion',
 *   filter_value: 'Verjaardag',
 *   context: 'giftfinder',
 *   results_count: 42
 * }
 * 
 * view_product event:
 * {
 *   event: 'view_product',
 *   product_id: 'prod_123',
 *   product_name: 'Smart Home Starter Kit',
 *   category: 'Technologie',
 *   price: 89.99,
 *   retailer: 'Coolblue',
 *   position: 1,
 *   list_name: 'giftfinder_results',
 *   currency: 'EUR'
 * }
 * 
 * click_affiliate event:
 * {
 *   event: 'click_affiliate',
 *   product_id: 'prod_123',
 *   product_name: 'Smart Home Starter Kit',
 *   affiliate_url: 'https://...',
 *   retailer: 'Coolblue',
 *   price: 89.99,
 *   category: 'Technologie',
 *   source: 'giftfinder',
 *   funnel_step: 'result_card',
 *   position: 1,
 *   currency: 'EUR'
 * }
 * 
 * funnel_step_complete event:
 * {
 *   event: 'funnel_step_complete',
 *   funnel_name: 'giftfinder_flow',
 *   step_name: 'apply_filters',
 *   step_number: 2,
 *   session_id: 'session_1234567890_abc123',
 *   time_on_step: 5000
 * }
 */

/**
 * GTM CONFIGURATION NEEDED:
 * 
 * 1. Create DataLayer Variables:
 *    - dlv - filter_type
 *    - dlv - filter_value
 *    - dlv - results_count
 *    - dlv - product_id
 *    - dlv - list_name
 *    - dlv - position
 *    - dlv - affiliate_url
 *    - dlv - funnel_name
 *    - dlv - step_name
 *    - dlv - step_number
 *    - dlv - session_id
 *    - dlv - time_on_step
 * 
 * 2. Create Triggers:
 *    - Custom Event: apply_filter
 *    - Custom Event: view_product
 *    - Custom Event: click_affiliate
 *    - Custom Event: funnel_step_complete
 * 
 * 3. Create Tags:
 *    - GA4 Event: Apply Filter
 *    - GA4 Event: View Product (item_list_view)
 *    - GA4 Event: Click Affiliate (select_item)
 *    - GA4 Event: Funnel Step Complete
 * 
 * 4. Test in GTM Preview Mode:
 *    - Visit GiftFinder page
 *    - Apply filters → Check apply_filter event
 *    - View results → Check view_product events (one per product)
 *    - Click product → Check click_affiliate event
 *    - Verify all dataLayer variables populate correctly
 */
