import React, { useRef, useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents'
import type { DealItem } from '../types'

export interface ProductCarouselControls {
  scroll: (__dir: 'left' | 'right') => void
  canScrollLeft: boolean
  canScrollRight: boolean
  currentIndex: number
  totalPages: number
}

interface ProductCarouselProps {
  products: DealItem[]
  renderProduct: (__product: DealItem, __index: number) => React.ReactNode
  hideDefaultNavigation?: boolean
  onNavigationChange?: (__controls: ProductCarouselControls) => void
}

const ProductCarousel = forwardRef<ProductCarouselControls, ProductCarouselProps>(
  ({ products, renderProduct, hideDefaultNavigation = false, onNavigationChange }, ref) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isScrolling, setIsScrolling] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return false
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])
  const [hasAnimatedIn, setHasAnimatedIn] = useState(prefersReducedMotion)

  const productKey = useMemo(() => products.map((product) => product.id).join('|'), [products])

  // Calculate total pages (groups of visible items)
  const itemsPerView = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1
  const totalPages = Math.ceil(products.length / itemsPerView)

  useEffect(() => {
    if (prefersReducedMotion) {
      setHasAnimatedIn(true)
      return
    }

    setHasAnimatedIn(false)
    const animationFrame = window.requestAnimationFrame(() => setHasAnimatedIn(true))
    return () => window.cancelAnimationFrame(animationFrame)
  }, [productKey, prefersReducedMotion])

  const updateScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    
    // Update current index based on scroll position
    const cardWidth = 320
    const newIndex = Math.round(scrollLeft / cardWidth)
    setCurrentIndex(newIndex)
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    updateScrollButtons()
    container.addEventListener('scroll', updateScrollButtons)
    window.addEventListener('resize', updateScrollButtons)

    return () => {
      container.removeEventListener('scroll', updateScrollButtons)
      window.removeEventListener('resize', updateScrollButtons)
    }
  }, [productKey, updateScrollButtons])

  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container || isScrolling) return

    setIsScrolling(true)
    const cardWidth = 320 // Approximate card width + gap
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    })

    setTimeout(() => {
      setIsScrolling(false)
      updateScrollButtons()
    }, 400)
  }, [isScrolling, updateScrollButtons])

  // Expose controls via ref
  useImperativeHandle(ref, () => ({
    scroll,
    canScrollLeft,
    canScrollRight,
    currentIndex,
    totalPages,
  }))

  // Notify parent of navigation changes
  useEffect(() => {
    if (onNavigationChange) {
      onNavigationChange({
        scroll,
        canScrollLeft,
        canScrollRight,
        currentIndex,
        totalPages,
      })
    }
  }, [canScrollLeft, canScrollRight, currentIndex, totalPages, scroll, onNavigationChange])

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Geen producten beschikbaar in deze categorie</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Default navigation buttons if not hidden */}
      {!hideDefaultNavigation && (
        <>
          {/* Navigation buttons - always visible on desktop */}
          <div className="hidden md:flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border-2 border-slate-200 text-slate-700 transition-all duration-200 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white shadow-sm hover:shadow-md"
                aria-label="Vorige items"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border-2 border-slate-200 text-slate-700 transition-all duration-200 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white shadow-sm hover:shadow-md"
                aria-label="Volgende items"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress indicator - dots */}
            {products.length > 3 && (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                  const isActive = Math.floor(currentIndex / itemsPerView) === idx
                  return (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isActive ? 'w-6 bg-rose-500' : 'w-1.5 bg-slate-300'
                      }`}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Mobile swipe indicator */}
          <div className="md:hidden mb-3 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100">
              <span>👈</span>
              <span>Swipe om te navigeren</span>
              <span>👉</span>
            </div>
          </div>
        </>
      )}

      {/* Carousel container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {products.map((product, index) => {
          if (!product) return null

          const animationStyle = prefersReducedMotion
            ? undefined
            : ({
                opacity: hasAnimatedIn ? 1 : 0,
                transition: 'opacity 260ms ease-out',
                transitionDelay: `${Math.min(index, 10) * 40}ms`,
              } as React.CSSProperties)

          return (
            <div
              key={product.id ?? `${index}`}
              className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start"
              style={animationStyle}
            >
              {renderProduct(product, index)}
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
})

ProductCarousel.displayName = 'ProductCarousel'

export default ProductCarousel
