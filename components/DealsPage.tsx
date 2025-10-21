import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { withAffiliate } from '../services/affiliate'
import CoolblueAffiliateService from '../services/coolblueAffiliateService'
import CoolblueFeedService from '../services/coolblueFeedService'
import { DealCategoryConfigService } from '../services/dealCategoryConfigService'
import { DynamicProductService } from '../services/dynamicProductService'
import { PerformanceInsightsService } from '../services/performanceInsightsService'
import { PinnedDealsService } from '../services/pinnedDealsService'
import Breadcrumbs from './Breadcrumbs'
import Button from './Button'
import { FeaturedDealSkeleton, CarouselSkeleton } from './DealCardSkeleton'
import {
  SparklesIcon,
  TagIcon,
  StarIcon,
  BookmarkFilledIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronRightIcon,
  HeartIcon,
  GiftIcon,
  CakeIcon,
  SnowflakeIcon,
} from './IconComponents'
import ImageWithFallback from './ImageWithFallback'
import InternalLinkCTA from './InternalLinkCTA'
import JsonLd from './JsonLd'
import { Container } from './layout/Container'
import LoadingSpinner from './LoadingSpinner'
import Meta from './Meta'
import ProductCarousel from './ProductCarousel'
import type { NavigateTo, DealCategory, DealItem } from '../types'

type RetailerInfo = {
  label: string
  shortLabel: string
  badgeClass: string
  accentClass: string
}

const parseHost = (url: string): string | null => {
  if (!url) return null
  try {
    const absolute = url.startsWith('http') ? url : `https://${url.replace(/^\/+/, '')}`
    const parsed = new URL(absolute)
    if (parsed.hostname.includes('awin') && parsed.searchParams.has('p')) {
      const original = CoolblueAffiliateService.extractOriginalUrl(absolute)
      if (original) {
        return parseHost(original)
      }
    }
    return parsed.hostname
  } catch {
    return null
  }
}

const resolveRetailerInfo = (affiliateLink: string): RetailerInfo => {
  const host = parseHost(affiliateLink) ?? ''
  if (host.includes('amazon')) {
    return {
      label: 'Partner: Amazon.nl',
      shortLabel: 'Amazon.nl',
      badgeClass: 'bg-orange-500 text-white',
      accentClass: 'text-orange-600',
    }
  }
  if (host.includes('coolblue')) {
    return {
      label: 'Partner: Coolblue',
      shortLabel: 'Coolblue',
      badgeClass: 'bg-sky-600 text-white',
      accentClass: 'text-sky-600',
    }
  }
  if (host.includes('bol')) {
    return {
      label: 'Partner: Bol.com',
      shortLabel: 'Bol.com',
      badgeClass: 'bg-blue-500 text-white',
      accentClass: 'text-blue-600',
    }
  }
  return {
    label: 'Partnerdeal',
    shortLabel: 'onze partner',
    badgeClass: 'bg-slate-200 text-slate-700',
    accentClass: 'text-slate-600',
  }
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

interface DealsPageProps {
  navigateTo: NavigateTo
}

interface DealsPageState {
  dealOfWeek: DealItem | null
  topDeals: DealItem[]
  categories: DealCategory[]
}

const DEFAULT_STATE: DealsPageState = {
  dealOfWeek: null,
  topDeals: [],
  categories: [],
}

// Helper function to get icon based on category title
const getCategoryIcon = (title: string) => {
  const lowerTitle = title.toLowerCase()

  if (
    lowerTitle.includes('tech') ||
    lowerTitle.includes('gadget') ||
    lowerTitle.includes('electronica')
  ) {
    return <SparklesIcon className="h-5 w-5" />
  }
  if (lowerTitle.includes('home') || lowerTitle.includes('woon') || lowerTitle.includes('huis')) {
    return <HeartIcon className="h-5 w-5" />
  }
  if (
    lowerTitle.includes('food') ||
    lowerTitle.includes('eten') ||
    lowerTitle.includes('drinken')
  ) {
    return <CakeIcon className="h-5 w-5" />
  }
  if (
    lowerTitle.includes('winter') ||
    lowerTitle.includes('kerst') ||
    lowerTitle.includes('feest')
  ) {
    return <SnowflakeIcon className="h-5 w-5" />
  }
  if (lowerTitle.includes('top') || lowerTitle.includes('best')) {
    return <StarIcon className="h-5 w-5" />
  }

  // Default fallback
  return <GiftIcon className="h-5 w-5" />
}

// Helper function to generate social proof badges
const getSocialProofBadge = (
  deal: DealItem,
  index: number
): { text: string; icon: string; color: string } | null => {
  const score = deal.giftScore || 0

  // Top 3 badge for first 3 items with high scores
  if (index < 3 && score >= 8) {
    return {
      text: `#${index + 1} Deze week`,
      icon: '🏆',
      color: 'bg-amber-100 text-amber-700',
    }
  }

  // Trending badge for high score deals
  if (score >= 9) {
    return {
      text: '150+ bekeken vandaag',
      icon: '👀',
      color: 'bg-purple-100 text-purple-700',
    }
  }

  // Popular badge for good score deals
  if (score >= 8) {
    return {
      text: '50+ mensen bekeken',
      icon: '🔥',
      color: 'bg-orange-100 text-orange-700',
    }
  }

  // New badge for on-sale items
  if (deal.isOnSale) {
    return {
      text: 'Populaire deal',
      icon: '⚡',
      color: 'bg-blue-100 text-blue-700',
    }
  }

  return null
}

const DealsPage: React.FC<DealsPageProps> = ({ navigateTo }) => {
  const [state, setState] = useState<DealsPageState>(DEFAULT_STATE)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [manualConfigUpdatedAt, setManualConfigUpdatedAt] = useState<string | null>(null)
  const [dealOfWeekIndex, setDealOfWeekIndex] = useState(0)
  const [premiumDeals, setPremiumDeals] = useState<DealItem[]>([])
  const [pinnedDeals, setPinnedDeals] = useState<DealItem[]>([])

  // Filter state
  const [priceFilter, setPriceFilter] = useState<string>('all')
  const [scoreFilter, setScoreFilter] = useState<number>(0)

  // Track impressions for visible deals
  const impressionTrackedRef = useRef<Set<string>>(new Set())

  const trackDealImpression = useCallback((dealId: string, retailer?: string) => {
    if (!impressionTrackedRef.current.has(dealId)) {
      const source = retailer ? `deals-page:${retailer}` : 'deals-page'
      PerformanceInsightsService.trackImpression(dealId, source)
      impressionTrackedRef.current.add(dealId)
    }
  }, [])

  const trackDealClick = useCallback((dealId: string, retailer?: string) => {
    const source = retailer ? `deals-page:${retailer}` : 'deals-page'
    PerformanceInsightsService.trackClick(dealId, source)
  }, [])

  const formatPrice = useCallback((value: string | undefined) => {
    if (!value) {
      return null
    }
    return value.startsWith('€') ? value : `€${value}`
  }, [])

  const formatDate = useCallback((value?: Date | string | null) => {
    if (!value) {
      return null
    }
    const date = typeof value === 'string' ? new Date(value) : value
    if (Number.isNaN(date.getTime())) {
      return null
    }
    return date.toLocaleString('nl-NL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  const loadDeals = useCallback(
    async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
      setIsLoading(true)
      setError(null)
      impressionTrackedRef.current = new Set()

      try {
        // Always force refresh on first load to ensure fresh data
        const shouldForceRefresh =
          forceRefresh || !sessionStorage.getItem('deals_loaded_this_session')

        if (shouldForceRefresh) {
          // Only invalidate caches when explicitly requested to avoid unnecessary cold starts
          CoolblueFeedService.clearCache()
          DealCategoryConfigService.clearCache()
          console.log('🔄 Forcing fresh data load...')
          sessionStorage.setItem('deals_loaded_this_session', 'true')
        }

        const [dealOfWeek, topDeals, categories, config, pinnedEntries] = await Promise.all([
          DynamicProductService.getDealOfTheWeek(),
          DynamicProductService.getTop10Deals(),
          DynamicProductService.getDealCategories(),
          DealCategoryConfigService.load(),
          PinnedDealsService.load(),
        ])

        const stats = DynamicProductService.getStats()
        setLastUpdated(stats?.lastUpdated ?? null)
        setManualConfigUpdatedAt(config?.updatedAt ?? null)

        // Collect premium candidates (featured deal + high scoring top deals)
        const premiumCandidates = [
          dealOfWeek,
          ...topDeals.filter((deal) => (deal.giftScore ?? 0) >= 7),
        ].filter((candidate): candidate is DealItem => Boolean(candidate))
        const uniquePremiums = Array.from(
          new Map(premiumCandidates.map((item) => [item.id, item])).values()
        )
        const featuredDeal = dealOfWeek ?? uniquePremiums[0] ?? topDeals[0] ?? null
        const premiumRotation =
          uniquePremiums.length > 0
            ? uniquePremiums.slice(0, 5)
            : featuredDeal
              ? [featuredDeal]
              : []

        setPremiumDeals(premiumRotation)
        setDealOfWeekIndex(0)

        const pinned = pinnedEntries
          .map((entry) => entry?.deal)
          .filter((deal): deal is DealItem => Boolean(deal?.id))

        setPinnedDeals(pinned)

        const hasManualCategories = Boolean(config?.categories?.length)
        const categoriesToDisplay = hasManualCategories
          ? categories.filter((category) => category.items.length > 0)
          : []

        setState({
          dealOfWeek: featuredDeal,
          topDeals,
          categories: categoriesToDisplay,
        })
      } catch (loadError: any) {
        console.error('Kon deals niet laden:', loadError)
        setError(loadError?.message ?? 'Kon deals niet laden. Probeer het later opnieuw.')
        setState(DEFAULT_STATE)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    // Force fresh data load on mount to prevent stale cache issues
    void loadDeals({ forceRefresh: true })
  }, [loadDeals])

  // Function to rotate to the next premium deal
  const showNextDeal = useCallback(() => {
    if (premiumDeals.length === 0) return

    const nextIndex = (dealOfWeekIndex + 1) % premiumDeals.length
    setDealOfWeekIndex(nextIndex)

    setState((prev) => ({
      ...prev,
      dealOfWeek: premiumDeals[nextIndex],
    }))
  }, [premiumDeals, dealOfWeekIndex])

  // Filter deals based on selected filters
  const filterDeals = useCallback(
    (deals: DealItem[]) => {
      return deals.filter((deal) => {
        const normalizedPrice = deal.price
          ? deal.price.replace(/[^0-9,\.]/g, '').replace(',', '.')
          : ''
        const parsedPrice = normalizedPrice ? Number.parseFloat(normalizedPrice) : Number.NaN

        let priceMatch = true
        if (priceFilter !== 'all') {
          if (Number.isNaN(parsedPrice)) {
            return false
          }

          if (priceFilter === '0-50') priceMatch = parsedPrice <= 50
          else if (priceFilter === '50-100') priceMatch = parsedPrice > 50 && parsedPrice <= 100
          else if (priceFilter === '100-200') priceMatch = parsedPrice > 100 && parsedPrice <= 200
          else if (priceFilter === '200+') priceMatch = parsedPrice > 200
        }

        const scoreValue = deal.giftScore ?? 0
        const scoreMatch = scoreFilter === 0 || scoreValue >= scoreFilter

        return priceMatch && scoreMatch
      })
    },
    [priceFilter, scoreFilter]
  )

  const handleRefresh = useCallback(() => {
    void loadDeals({ forceRefresh: true })
  }, [loadDeals])

  const structuredData = useMemo(() => {
    const topList = state.topDeals.map((deal, index) => {
      const retailer = resolveRetailerInfo(deal.affiliateLink)
      const sellerName = retailer.shortLabel || 'Partnerwinkel'

      return {
        '@type': 'ListItem',
        position: index + 1,
        url: withAffiliate(deal.affiliateLink),
        name: deal.name,
        image: deal.imageUrl,
        description: deal.description,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          price: deal.price?.replace(/[^0-9,\.]/g, '').replace(',', '.') ?? '',
          url: withAffiliate(deal.affiliateLink),
          seller: {
            '@type': 'Organization',
            name: sellerName,
          },
        },
      }
    })

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Gifteez deals overzicht',
      description:
        'Ontdek de scherpste cadeaudeals van deze week, samengesteld uit Coolblue en Amazon.',
      itemListElement: topList,
    }
  }, [state.topDeals])

  const featuredRetailer = useMemo(() => {
    if (!state.dealOfWeek) return null
    return resolveRetailerInfo(state.dealOfWeek.affiliateLink)
  }, [state.dealOfWeek])

  const featuredRetailerShortLabel = featuredRetailer?.shortLabel ?? null

  const handleFeaturedClick = useCallback(() => {
    if (state.dealOfWeek) {
      trackDealClick(state.dealOfWeek.id, featuredRetailerShortLabel ?? undefined)
    }
  }, [state.dealOfWeek, trackDealClick, featuredRetailerShortLabel])

  const partnerBadges = useMemo(() => {
    const unique = new Map<string, string>()
    const sampleDeals = [state.dealOfWeek, ...state.topDeals]
    sampleDeals.forEach((deal) => {
      if (!deal) return
      const info = resolveRetailerInfo(deal.affiliateLink)
      unique.set(info.shortLabel, info.shortLabel)
    })
    const labels = Array.from(unique.keys()).filter((label) => label !== 'onze partner')
    return labels.slice(0, 4)
  }, [state.dealOfWeek, state.topDeals])

  // Filter Bar Component
  const FilterBar: React.FC = () => {
    const activeFilters = priceFilter !== 'all' || scoreFilter > 0

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Filters:</span>
          </div>

          {/* Price Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="price-filter" className="text-sm text-slate-600">
              Prijs:
            </label>
            <select
              id="price-filter"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-all hover:border-rose-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
            >
              <option value="all">Alle prijzen</option>
              <option value="0-50">€0 - €50</option>
              <option value="50-100">€50 - €100</option>
              <option value="100-200">€100 - €200</option>
              <option value="200+">€200+</option>
            </select>
          </div>

          {/* Score Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="score-filter" className="text-sm text-slate-600">
              Min. score:
            </label>
            <select
              id="score-filter"
              value={scoreFilter}
              onChange={(e) => setScoreFilter(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-all hover:border-rose-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
            >
              <option value="0">Alle scores</option>
              <option value="7">7+ ⭐</option>
              <option value="8">8+ ⭐⭐</option>
              <option value="9">9+ ⭐⭐⭐</option>
            </select>
          </div>

          {/* Reset Button */}
          {activeFilters && (
            <button
              onClick={() => {
                setPriceFilter('all')
                setScoreFilter(0)
              }}
              className="ml-auto rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>
    )
  }

  // Carousel Component
  const Carousel: React.FC<{ items: DealItem[]; title: string; badge?: string }> = ({
    items,
    title,
    badge,
  }) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    // Touch swipe state
    const [touchStart, setTouchStart] = useState(0)
    const [touchEnd, setTouchEnd] = useState(0)

    const checkScroll = useCallback(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }, [])

    useEffect(() => {
      checkScroll()
      const ref = scrollRef.current
      if (ref) {
        ref.addEventListener('scroll', checkScroll)
        return () => ref.removeEventListener('scroll', checkScroll)
      }
    }, [checkScroll, items])

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const scrollAmount = 320
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        })
      }
    }

    // Touch handlers for swipe gestures
    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.targetTouches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX)
    }

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return

      const distance = touchStart - touchEnd
      const isLeftSwipe = distance > 50
      const isRightSwipe = distance < -50

      if (isLeftSwipe && canScrollRight) {
        scroll('right')
      }
      if (isRightSwipe && canScrollLeft) {
        scroll('left')
      }

      // Reset
      setTouchStart(0)
      setTouchEnd(0)
    }

    return (
      <div className="relative">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md">
              {getCategoryIcon(title)}
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900">{title}</h2>
            {badge && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                {badge}
              </span>
            )}
          </div>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll naar links"
            >
              <ChevronRightIcon className="h-5 w-5 rotate-180" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll naar rechts"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile swipe indicator */}
        <div className="md:hidden mb-3 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="animate-pulse">👈 Swipe 👉</span>
        </div>

        <div
          ref={scrollRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((deal, index) => (
            <div key={deal.id} className="flex-shrink-0 w-[280px] snap-start">
              <DealCard deal={deal} index={index} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Deal Card Component
  const DealCard: React.FC<{
    deal: DealItem
    index?: number
    variant?: 'carousel' | 'grid' | 'feature'
  }> = ({ deal, index = 0, variant = 'carousel' }) => {
    // Check if this is a top deal (score 9+) or hot deal (sale + score 8+)
    const isTopDeal = deal.giftScore && deal.giftScore >= 9
    const isHotDeal = deal.isOnSale && deal.giftScore && deal.giftScore >= 8
    const socialProof = getSocialProofBadge(deal, index)
    const retailerInfo = useMemo(
      () => resolveRetailerInfo(deal.affiliateLink),
      [deal.affiliateLink]
    )
    const imageHeightClass =
      variant === 'feature' ? 'h-64 md:h-72' : variant === 'grid' ? 'h-44' : 'h-48'
    const bodyPaddingClass = variant === 'feature' ? 'p-6' : variant === 'grid' ? 'p-5' : 'p-4'
    const priceBadgeClass = variant === 'feature' ? 'px-4 py-2 text-base' : 'px-3 py-1.5 text-sm'
    const buttonPaddingClass =
      variant === 'feature' ? 'px-6 py-3.5 text-base' : 'px-4 py-2.5 text-sm'

    // Track impression when card becomes visible
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      let hasTrackedImpression = false
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && deal.id && !hasTrackedImpression) {
              trackDealImpression(deal.id, retailerInfo?.shortLabel)
              hasTrackedImpression = true
            }
          })
        },
        { threshold: 0.1, rootMargin: '50px' }
      )

      const node = cardRef.current
      if (node) {
        observer.observe(node)
      }

      return () => {
        if (node) {
          observer.unobserve(node)
        }
      }
    }, [deal.id, retailerInfo?.shortLabel, trackDealImpression])

    const handleClick = () => {
      if (deal.id) {
        trackDealClick(deal.id, retailerInfo?.shortLabel)
      }
    }

    return (
      <div ref={cardRef} className="h-full">
        <div
          className={`group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] ${
            isTopDeal
              ? 'border-2 border-transparent bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 p-[2px] animate-gradient-xy'
              : 'border border-slate-200'
          }`}
        >
          {/* Inner card wrapper for TOP deals (creates gradient border effect) */}
          <div
            className={
              isTopDeal ? 'bg-white rounded-2xl h-full flex flex-col overflow-hidden' : 'contents'
            }
          >
            <div
              className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-white ${imageHeightClass}`}
            >
              <ImageWithFallback
                src={deal.imageUrl}
                alt={deal.name}
                className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                fit="contain"
              />

              {/* Badges - stacked in top-right corner */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {isTopDeal && (
                  <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-2 py-1 text-xs font-bold text-white shadow-md animate-pulse">
                    ⭐ TOP
                  </div>
                )}
                {isHotDeal && !isTopDeal && (
                  <div className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                    🔥 HOT
                  </div>
                )}
                {deal.isOnSale && !isHotDeal && !isTopDeal && (
                  <div className="rounded-lg bg-amber-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                    SALE
                  </div>
                )}
              </div>
            </div>
            <div className={`flex flex-1 flex-col gap-3 ${bodyPaddingClass}`}>
              {/* Social Proof Badge */}
              {socialProof && (
                <div
                  className={`inline-flex items-center gap-1.5 self-start rounded-full ${socialProof.color} px-3 py-1 text-xs font-semibold`}
                >
                  <span>{socialProof.icon}</span>
                  <span>{socialProof.text}</span>
                </div>
              )}
              {retailerInfo && (
                <div
                  className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-xs font-semibold ${retailerInfo.badgeClass}`}
                >
                  {retailerInfo.label}
                </div>
              )}

              <div className="space-y-1.5">
                <h3 className="font-display text-base font-semibold text-slate-900 line-clamp-2 leading-snug">
                  {deal.name}
                </h3>
                {variant === 'feature' && deal.description && (
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                    {deal.description}
                  </p>
                )}
              </div>
              <div className="mt-auto space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-lg bg-rose-500 font-bold text-white ${priceBadgeClass}`}
                  >
                    {formatPrice(deal.price) ?? 'Prijs op aanvraag'}
                  </span>
                  {deal.originalPrice && (
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                      <s>{deal.originalPrice}</s>
                    </span>
                  )}
                </div>
                {deal.giftScore && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <CheckIcon className="h-3.5 w-3.5" />
                    <span className="font-semibold">Cadeauscore: {deal.giftScore}/10</span>
                  </div>
                )}
                <a
                  href={withAffiliate(deal.affiliateLink)}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  onClick={handleClick}
                  className={`group/btn relative block w-full overflow-hidden rounded-xl text-center font-bold text-white shadow-lg transition-all hover:shadow-2xl hover:scale-105 ${buttonPaddingClass}`}
                >
                  {/* Gradient background with animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 transition-all duration-300 group-hover/btn:from-rose-600 group-hover/btn:via-pink-600 group-hover/btn:to-rose-700"></div>
                  
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                  
                  {/* Button content */}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>Naar {retailerInfo ? retailerInfo.shortLabel : 'de winkel'}</span>
                    <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getDisplayTitle = useCallback((title: string) => {
    const lowerTitle = title.toLowerCase()

    if (lowerTitle.includes('gift') && lowerTitle.includes('set')) {
      return 'Amazon Gift Sets die indruk maken'
    }

    if (lowerTitle.includes('keuken')) {
      return 'Beste keukenaccessoires van nu'
    }

    if (lowerTitle.includes('tech')) {
      return 'Top tech gadgets & smart upgrades'
    }

    if (lowerTitle.includes('lifestyle')) {
      return 'Lifestyle cadeaus voor verwenmomenten'
    }

    return title
  }, [])

  const getCategoryDescription = useCallback(
    (title: string, displayTitle: string, count: number) => {
      const lowerTitle = title.toLowerCase()

      if (lowerTitle.includes('gift') && lowerTitle.includes('set')) {
        return `Onze selectie van ${count} Amazon gift sets geeft direct het wow-effect. Perfect als last-minute cadeau: luxe verpakkingen, prime-levering en klaar om te geven.`
      }

      if (lowerTitle.includes('keuken')) {
        return `Handige keukenhulpen en smaakvolle cadeaus: ${count} toppers die koken leuker maken en bij foodies meteen in de smaak vallen.`
      }

      if (lowerTitle.includes('tech')) {
        return `${count} slimme gadgets en audio-upgrades waarmee je gadgetfans verrast. Mix van bestsellers en nieuwe releases, allemaal snel leverbaar.`
      }

      if (lowerTitle.includes('lifestyle')) {
        return `${count} lifestylecadeaus om iemand te verwennen – van wellness tot stijl. Ideaal voor persoonlijke momenten of self-care surprises.`
      }

      return `Onze redactie selecteerde ${count} cadeaus binnen ${displayTitle}. Geen eindeloze scroll, maar direct inspiratie.`
    },
    []
  )

  const CategorySection: React.FC<{
    category: DealCategory
    index: number
    navigateTo: NavigateTo
  }> = ({ category, index, navigateTo }) => {
    const items = category.items

    if (!items.length) {
      return null
    }

    const displayTitle = getDisplayTitle(category.title)
    const description = getCategoryDescription(category.title, displayTitle, items.length)

    const retailerLabels = useMemo(() => {
      const unique = new Set<string>()
      items.forEach((item) => {
        const info = resolveRetailerInfo(item.affiliateLink)
        if (info.shortLabel) {
          unique.add(info.shortLabel)
        }
      })
      return Array.from(unique)
    }, [items])

    const priceRange = useMemo(() => {
      const parsed = items
        .map((item) => {
          const normalised = item.price.replace(/[^0-9,\.]/g, '').replace(',', '.')
          const value = Number.parseFloat(normalised)
          return Number.isFinite(value) ? value : null
        })
        .filter((value): value is number => value !== null)

      if (!parsed.length) {
        return null
      }

      const min = Math.min(...parsed)
      const max = Math.max(...parsed)
      if (min === max) {
        return formatCurrency(min)
      }
      return `${formatCurrency(min)} – ${formatCurrency(max)}`
    }, [items])

    const renderProductCard = (deal: DealItem, dealIndex: number) => (
      <DealCard key={deal.id} deal={deal} index={dealIndex} variant="grid" />
    )

    return (
      <article
        className="space-y-6 animate-fade-in-up"
        style={{ animationDelay: `${120 + index * 70}ms` }}
      >
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
            <GiftIcon className="h-4 w-4" />
            Curated selectie
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-slate-900">
                {displayTitle}
              </h3>
              <p className="mt-2 max-w-3xl text-sm md:text-base text-slate-600">{description}</p>
            </div>
            <Button
              onClick={() =>
                navigateTo('categoryDetail', {
                  categoryId: category.id,
                  categoryTitle: displayTitle,
                  categoryDescription: description,
                  products: items,
                })
              }
              variant="secondary"
              className="shrink-0"
            >
              Bekijk alles
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              {items.length} cadeaus
            </span>
            {priceRange && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                Prijsrange {priceRange}
              </span>
            )}
            {retailerLabels.map((label) => (
              <span key={label} className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">
                {label}
              </span>
            ))}
          </div>
        </header>

        <ProductCarousel products={items} renderProduct={renderProductCard} />
      </article>
    )
  }

  const PinnedDealsSection: React.FC<{ deals: DealItem[] }> = ({ deals }) => {
    if (!deals.length) {
      return null
    }

    const featured = deals[0]
    const supporting = deals.slice(1)

    const priceRange = useMemo(() => {
      const parsed = deals
        .map((item) => {
          const normalised = item.price.replace(/[^0-9,\.]/g, '').replace(',', '.')
          const value = Number.parseFloat(normalised)
          return Number.isFinite(value) ? value : null
        })
        .filter((value): value is number => value !== null)

      if (!parsed.length) {
        return null
      }

      const min = Math.min(...parsed)
      const max = Math.max(...parsed)
      return min === max ? formatCurrency(min) : `${formatCurrency(min)} – ${formatCurrency(max)}`
    }, [deals])

    const partnerLabels = useMemo(() => {
      const labels = new Set<string>()
      deals.forEach((deal) => {
        const info = resolveRetailerInfo(deal.affiliateLink)
        labels.add(info.shortLabel)
      })
      return Array.from(labels)
    }, [deals])

    return (
      <section className="space-y-8">
        <header className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-orange-700">
            <GiftIcon className="h-4 w-4" />
            Amazon Gift Sets
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">
            Luxe cadeauboxen die direct klaar zijn om te geven
          </h2>
          <p className="mx-auto max-w-3xl text-sm md:text-base text-slate-600">
            Deze edit bestaat uit {deals.length} zorgvuldig geselecteerde gift sets. Stuk voor stuk
            Amazon Prime toppers met snelle levering, opvallende verpakkingen en een hoge
            cadeauscore.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-500">
            {priceRange && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                Prijsrange {priceRange}
              </span>
            )}
            {partnerLabels.map((label) => (
              <span key={label} className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                {label}
              </span>
            ))}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lg:sticky lg:top-24 h-fit">
            <DealCard deal={featured} variant="feature" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {supporting.map((deal, index) => (
              <DealCard key={deal.id} deal={deal} index={index + 1} variant="grid" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <Meta
        title="Deals & cadeaudeals van de week"
        description="Ontdek de scherpste cadeaudeals van Gifteez. We combineren de beste Coolblue aanbiedingen met handmatig geselecteerde toppers."
      />
      <JsonLd data={structuredData} />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
        {/* Hero Section - Modern Design */}
        <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 min-h-[70vh] flex items-center">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating sparkles */}
            <div className="absolute top-[15%] left-[10%] animate-float-slow">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                  fill="#f43f5e"
                  fillOpacity="0.3"
                />
              </svg>
            </div>
            <div className="absolute top-[25%] right-[15%] animate-float-delayed">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                  fill="#fb923c"
                  fillOpacity="0.4"
                />
              </svg>
            </div>
            <div className="absolute bottom-[20%] left-[20%] animate-float-slow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                  fill="#f43f5e"
                  fillOpacity="0.35"
                />
              </svg>
            </div>
            <div className="absolute top-[40%] right-[8%] animate-float-delayed">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                  fill="#fbbf24"
                  fillOpacity="0.4"
                />
              </svg>
            </div>

            {/* Gradient glows */}
            <div className="absolute top-[10%] right-[20%] w-96 h-96 bg-rose-300/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-[10%] left-[15%] w-80 h-80 bg-orange-300/20 rounded-full blur-3xl animate-pulse-slower" />
          </div>

          <Container size="xl" padded className="relative py-16 md:py-20">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white shadow-lg border border-rose-200 px-5 py-2.5 mb-6 animate-fade-in-up">
                <SparklesIcon className="h-5 w-5 text-rose-500" />
                <span className="text-sm font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                  Dagelijks bijgewerkt
                </span>
              </div>

              {/* Heading */}
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-up">
                <span className="block text-gray-900 mb-2">De beste cadeaudeals</span>
                <span className="block bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  van deze week
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
                Ontdek scherpe deals van Coolblue en Amazon,
                <span className="font-semibold text-rose-600"> perfect voor elk cadeau moment</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8 animate-fade-in-up">
                <button
                  onClick={() => navigateTo('giftFinder')}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-rose-300"
                >
                  <GiftIcon className="h-6 w-6" />
                  <span>Vind je perfect cadeau</span>
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>

                {state.dealOfWeek && (
                  <a
                    href={withAffiliate(state.dealOfWeek.affiliateLink)}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    onClick={handleFeaturedClick}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-rose-300 bg-white text-rose-600 font-bold text-lg hover:bg-rose-50 hover:border-rose-400 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <TagIcon className="h-5 w-5" />
                    <span>Bekijk topdeal</span>
                  </a>
                )}

                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-full border-2 border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Vernieuw deals</span>
                </button>
              </div>

              {/* Info badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Handgeplukte deals</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Dagelijks vernieuwd</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartIcon className="w-5 h-5 text-rose-500" />
                  <span className="font-medium">Beste prijzen</span>
                </div>
              </div>

              {/* Partner info */}
              {(lastUpdated || manualConfigUpdatedAt) && (
                <div className="text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                  {lastUpdated && <span>Laatst bijgewerkt: {formatDate(lastUpdated)}</span>}
                </div>
              )}
              {partnerBadges.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">Partnerwinkels:</span>
                  {partnerBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-gray-500 max-w-2xl mx-auto">
                Wij ontvangen een kleine commissie via deze partnerlinks – zonder extra kosten voor
                jou.
              </p>
            </div>
          </Container>
        </section>

        <Container size="xl" padded className="py-12 space-y-12">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-12">
              {/* Featured deal skeleton */}
              <FeaturedDealSkeleton />

              {/* Top 10 carousel skeleton */}
              <CarouselSkeleton />

              {/* Category carousels skeletons */}
              <CarouselSkeleton />
              <CarouselSkeleton />
            </div>
          ) : (
            <>
              {/* Deal of the Week - Featured Card */}
              {state.dealOfWeek && (
                <section className="animate-fade-in">
                  <div className="overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-br from-white via-rose-50/30 to-orange-50/30 shadow-xl">
                    <div className="grid lg:grid-cols-2 gap-6 p-6 md:p-8">
                      <div className="flex items-center justify-center bg-white rounded-2xl p-6">
                        <ImageWithFallback
                          src={state.dealOfWeek.imageUrl}
                          alt={state.dealOfWeek.name}
                          className="w-full max-w-[320px] object-contain"
                          fit="contain"
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-4">
                        <div className="inline-flex items-center gap-2 self-start rounded-full bg-rose-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                          <StarIcon className="h-4 w-4" />
                          Deal van de week
                        </div>
                        {featuredRetailer && (
                          <div
                            className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-xs font-semibold ${featuredRetailer.badgeClass}`}
                          >
                            {featuredRetailer.label}
                          </div>
                        )}
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">
                          {state.dealOfWeek.name}
                        </h2>
                        <p className="text-base text-slate-600 leading-relaxed">
                          {state.dealOfWeek.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-5 py-2.5 text-lg font-bold text-white">
                            {formatPrice(state.dealOfWeek.price) ?? 'Prijs op aanvraag'}
                          </span>
                          {state.dealOfWeek.originalPrice && (
                            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500">
                              <s>{state.dealOfWeek.originalPrice}</s>
                            </span>
                          )}
                          {state.dealOfWeek.giftScore && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700">
                              <CheckIcon className="h-4 w-4" />
                              Score {state.dealOfWeek.giftScore}/10
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <a
                            href={withAffiliate(state.dealOfWeek.affiliateLink)}
                            target="_blank"
                            rel="sponsored nofollow noopener noreferrer"
                            onClick={handleFeaturedClick}
                            className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-accent-hover hover:shadow-xl hover:scale-105"
                          >
                            Naar {featuredRetailer ? featuredRetailer.shortLabel : 'de winkel'} →
                          </a>
                          <Button variant="secondary" className="bg-white" onClick={showNextDeal}>
                            Toon andere deal
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Filter Bar */}
              <div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
                <FilterBar />
              </div>

              {/* Top 10 Deals Carousel */}
              {state.topDeals.length > 0 && (
                <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <Carousel
                    items={filterDeals(state.topDeals)}
                    title="🏆 Top 10 Cadeaus"
                    badge={`${filterDeals(state.topDeals).length} deals`}
                  />
                </section>
              )}

              {pinnedDeals.length > 0 && (
                <div className="animate-fade-in-up" style={{ animationDelay: '110ms' }}>
                  <PinnedDealsSection deals={pinnedDeals} />
                </div>
              )}

              {state.categories.length > 0 && (
                <section
                  className="space-y-14 animate-fade-in-up"
                  style={{ animationDelay: '120ms' }}
                >
                  <div className="text-center space-y-3">
                    <span className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      <SparklesIcon className="h-4 w-4 text-rose-500" />
                      Redactiecollecties
                    </span>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">
                      Handmatig samengestelde cadeaucollecties
                    </h2>
                    <p className="mx-auto max-w-3xl text-sm md:text-base text-slate-600">
                      We vullen deze blokken met actuele Amazon- en Coolblue-deals die direct
                      cadeauproof zijn. Ideaal wanneer je snel een thematische selectie wilt zonder
                      eindeloos zoeken.
                    </p>
                  </div>
                  <div className="space-y-16">
                    {state.categories.map((category, index) => (
                      <CategorySection
                        key={`${category.title}-${index}`}
                        category={category}
                        index={index}
                        navigateTo={navigateTo}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {!state.dealOfWeek &&
                state.topDeals.length === 0 &&
                state.categories.length === 0 &&
                !error && (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                      <TagIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                      Nog geen deals beschikbaar
                    </h3>
                    <p className="text-slate-500 mb-6">
                      Controleer later opnieuw voor de nieuwste cadeaudeals
                    </p>
                    <Button variant="primary" onClick={handleRefresh}>
                      Vernieuw nu
                    </Button>
                  </div>
                )}

              {/* Internal Links - Related Content */}
              <div className="mt-16">
                <h3 className="font-display text-2xl font-bold text-primary mb-6 text-center">
                  🎯 Meer cadeauinspiratie
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <InternalLinkCTA
                    to="/giftfinder"
                    title="🎁 AI GiftFinder"
                    description="Niet gevonden wat je zocht? Laat onze AI je helpen het perfecte cadeau te vinden op basis van budget, gelegenheid en interesses."
                    icon="🤖"
                    variant="primary"
                  />
                  <InternalLinkCTA
                    to="/blog"
                    title="📚 Cadeau Blog"
                    description="Lees inspirerende artikelen over de nieuwste cadeau trends, tips en gift guides voor elke gelegenheid."
                    icon="✨"
                    variant="secondary"
                  />
                </div>
              </div>
            </>
          )}
        </Container>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}

export default DealsPage
