/**
 * Example Integration: Analytics in GiftFinderPage
 *
 * This demonstrates how to add comprehensive analytics tracking
 * to the GiftFinder page for funnel and event tracking.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useFunnelTracking } from '../hooks/useFunnelTracking'
import {
  trackStartGiftFinder,
  trackApplyFilter,
  trackViewProduct,
  trackProductImpressions,
  trackClickAffiliate,
} from '../services/analyticsEventService'
import { trackOutboundClick } from '../services/dataLayerService'
import type { Product } from '../services/analyticsEventService'

type GiftFinderFilters = {
  occasion: string
  recipient: string
  budgetMin: number
  budgetMax: number
}

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Duurzame Mok',
    category: 'Home',
    price: 19.95,
    retailer: 'Shop Like You Give A Damn',
    affiliateUrl: 'https://example.com/prod-1',
  },
  {
    id: 'prod_2',
    name: 'Eco Cadeaubox',
    category: 'Gifts',
    price: 39.5,
    retailer: 'Gifteez',
    affiliateUrl: 'https://example.com/prod-2',
  },
  {
    id: 'prod_3',
    name: 'Ervaringsvoucher',
    category: 'Experiences',
    price: 89,
    retailer: 'Coolblue',
    affiliateUrl: 'https://example.com/prod-3',
  },
]

const filterProducts = (products: Product[], filters: GiftFinderFilters): Product[] => {
  const { budgetMin, budgetMax } = filters
  return products.filter((product) => {
    const price = product.price ?? 0
    return price >= budgetMin && price <= budgetMax
  })
}

type ProductCardProps = {
  product: Product
  position: number
  onClick: () => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, position, onClick }) => (
  <button
    type="button"
    data-testid={`product-${position}`}
    onClick={onClick}
    className="product-card"
  >
    <span>{product.name}</span>
    {typeof product.price === 'number' && <span>{`€${product.price.toFixed(2)}`}</span>}
  </button>
)

// Example usage in GiftFinderPage component
export function GiftFinderPageExample() {
  const { trackStep } = useFunnelTracking('giftfinder_flow')
  const [filters, setFilters] = useState<GiftFinderFilters>({
    occasion: 'Verjaardag',
    recipient: 'Partner',
    budgetMin: 0,
    budgetMax: 250,
  })

  const filteredProducts = useMemo(() => filterProducts(SAMPLE_PRODUCTS, filters), [filters])

  useEffect(() => {
    trackStartGiftFinder('page_visit')
    trackStep('start_giftfinder')
  }, [trackStep])

  const updateFiltersAndTrack = (
    updater: (prev: GiftFinderFilters) => GiftFinderFilters,
    tracking: { type: 'occasion' | 'recipient' | 'budget'; value: string }
  ) => {
    setFilters((prev) => {
      const next = updater(prev)
      const resultsCount = filterProducts(SAMPLE_PRODUCTS, next).length
      trackApplyFilter(tracking.type, tracking.value, 'giftfinder', resultsCount)
      trackStep('apply_filters')
      return next
    })
  }

  const handleOccasionChange = (occasion: string) => {
    updateFiltersAndTrack((prev) => ({ ...prev, occasion }), {
      type: 'occasion',
      value: occasion,
    })
  }

  const handleRecipientChange = (recipient: string) => {
    updateFiltersAndTrack((prev) => ({ ...prev, recipient }), {
      type: 'recipient',
      value: recipient,
    })
  }

  const handleBudgetChange = (budgetMin: number, budgetMax: number) => {
    updateFiltersAndTrack((prev) => ({ ...prev, budgetMin, budgetMax }), {
      type: 'budget',
      value: `${budgetMin}-${budgetMax}`,
    })
  }

  useEffect(() => {
    if (filteredProducts.length > 0) {
      trackProductImpressions(filteredProducts, 'giftfinder_results')
      trackStep('view_results')
    }
  }, [filteredProducts, trackStep])

  const handleProductClick = (product: Product, position: number) => {
    trackViewProduct(product, position, 'giftfinder_results')
    trackStep('view_product')
  }

  return (
    <div className="giftfinder-page">
      <div className="filters">
        <select
          value={filters.occasion}
          onChange={(event) => handleOccasionChange(event.target.value)}
        >
          <option value="Verjaardag">Verjaardag</option>
          <option value="Kerst">Kerst</option>
          <option value="Sinterklaas">Sinterklaas</option>
        </select>

        <select
          value={filters.recipient}
          onChange={(event) => handleRecipientChange(event.target.value)}
        >
          <option value="Partner">Partner</option>
          <option value="Vriend(in)">Vriend(in)</option>
          <option value="Familielid">Familielid</option>
        </select>

        <input
          type="range"
          min="0"
          max="500"
          value={filters.budgetMax}
          onChange={(event) => handleBudgetChange(0, Number(event.target.value))}
        />
      </div>

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
  )
}

/**
 * GIFTRESULTCARD INTEGRATION:
 *
 * Use this helper when a user clicks an affiliate link from the GiftResultCard.
 */

const openAffiliateInNewTab = (url: string) => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

type AffiliateClickDeps = {
  trackStep: (step: string) => void
  source?: string
  funnelStep?: string
}

export const createAffiliateClickHandler = ({
  trackStep,
  source = 'giftfinder',
  funnelStep = 'result_card',
}: AffiliateClickDeps) => {
  return (product: Product, position: number) => {
    trackClickAffiliate(product, source, funnelStep, position)
    trackStep('click_affiliate')

    if (product.affiliateUrl) {
      trackOutboundClick({
        url: product.affiliateUrl,
        retailer: product.retailer || 'Unknown',
        productName: product.name,
      })
      openAffiliateInNewTab(product.affiliateUrl)
    }
  }
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
