/**
 * Example Integration: Analytics & A/B Testing in HomePage
 *
 * This file demonstrates how to integrate the analytics and A/B testing
 * framework into your existing components.
 *
 * Copy these patterns into your actual HomePage.tsx
 */

import React, { useEffect } from 'react'
import { useABTest } from '../hooks/useABTest'
import { useFunnelTracking } from '../hooks/useFunnelTracking'
import { trackStartGiftFinder } from '../services/analyticsEventService'
import Button from './Button'
import type { NavigateTo } from '../types'

interface HomePageProps {
  navigateTo: NavigateTo
}

const HomePage: React.FC<HomePageProps> = ({ navigateTo }) => {
  // ============================================================================
  // A/B TEST: Hero CTA Text
  // ============================================================================

  const { variant: heroCTA, trackConversion: trackHeroCTAClick } = useABTest('hero_cta_text', {
    A: 'Vind het perfecte cadeau',
    B: 'Start GiftFinder',
    C: 'Ontdek jouw ideale cadeau',
  })

  // ============================================================================
  // A/B TEST: Hero Image Style
  // ============================================================================

  const { variant: heroImage, trackConversion: trackHeroImageClick } = useABTest(
    'hero_image_style',
    {
      A: {
        src: '/gifteez-mascot-medium.webp',
        alt: 'Gifteez Mascot - Your gift guide',
        style: 'mascot',
      },
      B: {
        src: '/hero-product-collage.webp',
        alt: 'Popular gift ideas',
        style: 'products',
      },
      C: {
        src: '/hero-lifestyle.webp',
        alt: 'Gift giving made easy',
        style: 'lifestyle',
      },
    }
  )

  // ============================================================================
  // A/B TEST: Newsletter CTA Position
  // ============================================================================

  const { variantKey: newsletterPosition } = useABTest('newsletter_position', {
    A: 'top', // Above testimonials
    B: 'bottom', // Below blog section
    C: 'hidden', // No newsletter (control)
  })

  // ============================================================================
  // FUNNEL TRACKING: Homepage → GiftFinder Flow
  // ============================================================================

  const { trackStep } = useFunnelTracking('giftfinder_flow', {
    autoStart: false, // Don't auto-start, we'll track view_homepage manually
  })

  // Track homepage view on mount
  useEffect(() => {
    trackStep('view_homepage')
  }, [trackStep])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleGiftFinderClick = () => {
    // Track A/B conversion
    trackHeroCTAClick('click')
    trackHeroImageClick('engage')

    // Track funnel progression
    trackStep('start_giftfinder')

    // Track analytics event
    trackStartGiftFinder('homepage_hero')

    // Navigate
    navigateTo('giftFinder')
  }

  const handleDealsClick = () => {
    trackStep('view_deals_from_home')
    navigateTo('deals')
  }

  const handleCategoriesClick = () => {
    trackStep('view_categories_from_home')
    navigateTo('categories')
  }

  const handleBlogClick = (blogSlug: string) => {
    trackStep('view_blog_from_home')
    navigateTo('blog', blogSlug)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="home-page">
      {/* Hero Section with A/B Testing */}
      <section className="hero-section">
        <div className="hero-content">
          {/* A/B Test: Hero Image */}
          <img
            src={heroImage.src}
            alt={heroImage.alt}
            className={`hero-image hero-image--${heroImage.style}`}
          />

          {/* A/B Test: Hero CTA Text */}
          <h1 className="hero-title">{heroCTA}</h1>

          <p className="hero-subtitle">Binnen 30 seconden het perfecte cadeau met AI</p>

          {/* Primary CTA with tracking */}
          <Button onClick={handleGiftFinderClick} size="large" variant="primary">
            {heroCTA} →
          </Button>
        </div>
      </section>

      {/* Quick Links with funnel tracking */}
      <section className="quick-links">
        <Button onClick={handleDealsClick} variant="secondary">
          🔥 Deals
        </Button>
        <Button onClick={handleCategoriesClick} variant="secondary">
          📂 Categorieën
        </Button>
      </section>

      {/* Newsletter Section - Positioned based on A/B test */}
      {newsletterPosition !== 'C' && (
        <section className={`newsletter-section newsletter-section--${newsletterPosition}`}>
          <h3>Blijf op de hoogte van de beste cadeautips</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // Track newsletter signup conversion
              // This could be another A/B test variant
            }}
          >
            <input type="email" placeholder="Je e-mailadres" />
            <Button type="submit">Aanmelden</Button>
          </form>
        </section>
      )}

      {/* Blog Section with click tracking */}
      <section className="blog-section">
        <h2>Laatste Tips & Inspiratie</h2>

        <div className="blog-grid">
          {/* Render blog posts with tracking */}
          {/* ... blog post cards ... */}
        </div>
      </section>
    </div>
  )
}

export default HomePage

/**
 * INTEGRATION CHECKLIST:
 *
 * 1. Import hooks:
 *    ✅ import { useABTest } from '../hooks/useABTest';
 *    ✅ import { useFunnelTracking } from '../hooks/useFunnelTracking';
 *    ✅ import { trackStartGiftFinder } from '../services/analyticsEventService';
 *
 * 2. Setup A/B tests:
 *    ✅ Hero CTA text (3 variants)
 *    ✅ Hero image style (3 variants)
 *    ✅ Newsletter position (3 variants)
 *
 * 3. Setup funnel tracking:
 *    ✅ Track homepage view
 *    ✅ Track GiftFinder start
 *    ✅ Track navigation events
 *
 * 4. Add conversion tracking:
 *    ✅ CTA clicks
 *    ✅ Image engagement
 *    ✅ Newsletter signups
 *
 * 5. Test in GTM Preview:
 *    - Check ab_variant_impression events
 *    - Check ab_variant_conversion events
 *    - Check funnel_step_complete events
 *    - Verify variant assignments are consistent
 *
 * 6. Monitor results:
 *    - Check conversion rates in browser console:
 *      import { getAllTestMetrics } from '../services/abTestingService';
 *      console.log(getAllTestMetrics());
 *
 *    - Check funnel metrics:
 *      import { getAllFunnelMetrics } from '../services/funnelTrackingService';
 *      console.log(getAllFunnelMetrics());
 */
