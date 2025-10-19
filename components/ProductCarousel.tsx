import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents'
import type { DealItem } from '../types'

interface ProductCarouselProps {
  products: DealItem[]
  renderProduct: (product: DealItem, index: number) => React.ReactNode
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products, renderProduct }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isScrolling, setIsScrolling] = useState(false)
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return false
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])
  const [hasAnimatedIn, setHasAnimatedIn] = useState(prefersReducedMotion)

  const productKey = useMemo(() => products.map((product) => product.id).join('|'), [products])

  useEffect(() => {
    if (prefersReducedMotion) {
      setHasAnimatedIn(true)
      return
    }

    setHasAnimatedIn(false)
    const animationFrame = requestAnimationFrame(() => setHasAnimatedIn(true))
    return () => cancelAnimationFrame(animationFrame)
  }, [productKey, prefersReducedMotion])

  const updateScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
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

  const scroll = (direction: 'left' | 'right') => {
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
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Geen producten beschikbaar in deze categorie</p>
      </div>
    )
  }

  return (
    <div className="relative group">
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-xl hover:shadow-2xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
          aria-label="Scroll naar links"
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
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

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-xl hover:shadow-2xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
          aria-label="Scroll naar rechts"
        >
          <ChevronRightIcon className="w-6 h-6 text-gray-700" />
        </button>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default ProductCarousel
