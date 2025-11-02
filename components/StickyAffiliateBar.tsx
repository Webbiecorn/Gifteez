import React, { useEffect, useState } from 'react'
import { withAffiliate } from '../services/affiliate'
import type { DealItem } from '../types'

interface StickyAffiliateBarProps {
  product: DealItem
  retailerName?: string
  onCtaClick?: () => void
}

const StickyAffiliateBar: React.FC<StickyAffiliateBarProps> = ({
  product,
  retailerName = 'de winkel',
  onCtaClick,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 300px
      const shouldShow = window.scrollY > 300
      setIsVisible(shouldShow)

      // Check if near bottom (within 200px of document end)
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const clientHeight = window.innerHeight
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 200

      setIsAtBottom(nearBottom)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible || isAtBottom) return null

  const handleClick = () => {
    if (onCtaClick) {
      onCtaClick()
    }

    if (window.gtag) {
      window.gtag('event', 'sticky_bar_click', {
        event_category: 'affiliate',
        event_label: product.name,
        retailer: retailerName,
      })
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden animate-slide-up">
      {/* Background with blur */}
      <div className="bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-2xl">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Product info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-12 w-12 rounded-lg object-cover flex-shrink-0 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">{product.name}</div>
                <div className="text-lg font-bold text-rose-600">
                  {product.price || 'Bekijk prijs'}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href={withAffiliate(product.affiliateLink, {
                pageType: 'product-landing',
                placement: 'sticky-bar',
              })}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              onClick={handleClick}
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span>Naar {retailerName}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StickyAffiliateBar

// Add this CSS to your global styles or index.css
/*
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
*/
