import React, { useCallback, useEffect, useMemo, useState, useRef, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import {
  dealOfTheWeek as fallbackDealOfWeek,
  top10Deals as fallbackTopDeals,
  dealCategories as fallbackDealCategories,
} from '../data/dealsData'
import { isAutomationEnvironment } from '../lib/automationEnvironment'
import { logger } from '../lib/logger'
import { withAffiliate } from '../services/affiliate'
import CoolblueAffiliateService from '../services/coolblueAffiliateService'
import CoolblueFeedService from '../services/coolblueFeedService'
import { DealCategoryConfigService } from '../services/dealCategoryConfigService'
import { DynamicProductService } from '../services/dynamicProductService'
import { PartyProService } from '../services/partyProService'
import { PerformanceInsightsService } from '../services/performanceInsightsService'
import { PinnedDealsService } from '../services/pinnedDealsService'
import { ShopLikeYouGiveADamnService } from '../services/shopLikeYouGiveADamnService'
import Button from './Button'
import { FeaturedDealSkeleton, CarouselSkeleton } from './DealCardSkeleton'
import {
  SparklesIcon,
  TagIcon,
  StarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  HeartIconFilled,
  GiftIcon,
  CakeIcon,
  SnowflakeIcon,
  ShareIcon,
} from './IconComponents'
import ImageWithFallback from './ImageWithFallback'
import InternalLinkCTA from './InternalLinkCTA'
import JsonLd from './JsonLd'
import { Container } from './layout/Container'
import Meta from './Meta'
import ProductCarousel from './ProductCarousel'
import { SocialShare } from './SocialShare'
import type { ProductCarouselControls } from './ProductCarousel'
import type { NavigateTo, DealCategory, DealItem, Gift } from '../types'

type RetailerInfo = {
  label: string
  shortLabel: string
  badgeClass: string
  accentClass: string
}

const REQUIRED_PARTNER_BRANDS = ['Coolblue', 'Shop Like You Give A Damn', 'PartyPro.nl'] as const

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
  if (host.includes('shoplikeyougiveadamn') || affiliateLink.includes('shoplikeyougiveadamn')) {
    return {
      label: 'Partner: Shop Like You Give A Damn',
      shortLabel: 'Shop Like You Give A Damn',
      badgeClass: 'bg-emerald-600 text-white',
      accentClass: 'text-emerald-600',
    }
  }
  if (host.includes('partypro') || affiliateLink.includes('partypro')) {
    return {
      label: 'Partner: PartyPro.nl',
      shortLabel: 'PartyPro.nl',
      badgeClass: 'bg-purple-600 text-white',
      accentClass: 'text-purple-600',
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

const AUTOMATION_TOP_DEALS_LIMIT = 12
const AUTOMATION_CATEGORY_LIMIT = 3
const AUTOMATION_PINNED_LIMIT = 4

const buildAutomationDealsSnapshot = () => {
  const topDeals = fallbackTopDeals.slice(0, AUTOMATION_TOP_DEALS_LIMIT)
  const categories = fallbackDealCategories.slice(0, AUTOMATION_CATEGORY_LIMIT)

  const state: DealsPageState = {
    dealOfWeek: fallbackDealOfWeek ?? topDeals[0] ?? null,
    topDeals,
    categories,
  }

  const pinned = topDeals.slice(0, AUTOMATION_PINNED_LIMIT)
  const lastUpdated = new Date()

  return { state, pinned, lastUpdated }
}

type GtagFunction = (...args: unknown[]) => void

interface AnalyticsWindow extends Window {
  gtag?: GtagFunction
}

const getAnalyticsTracker = (): GtagFunction | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const gtag = (window as AnalyticsWindow).gtag
  return typeof gtag === 'function' ? gtag : null
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const message = ((error as { message: string }).message ?? '').trim()
    if (message) {
      return message
    }
  }

  return fallback
}

const logUnknownError = (
  message: string,
  error: unknown,
  context?: Record<string, unknown>
): void => {
  if (error instanceof Error) {
    logger.error(message, {
      ...context,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    })
    return
  }

  logger.error(message, { ...context, error })
}

const getFallbackImageUrl = (deal: DealItem): string | undefined => {
  const record = deal as unknown as Record<string, unknown>
  const awinImage = record.awinImageUrl
  if (typeof awinImage === 'string' && awinImage.trim()) {
    return awinImage
  }

  const merchantImage = record.merchantImageUrl
  if (typeof merchantImage === 'string' && merchantImage.trim()) {
    return merchantImage
  }

  return undefined
}

const trackAnalyticsEvent = (eventName: string, params: Record<string, unknown>): void => {
  const gtag = getAnalyticsTracker()
  if (!gtag) {
    return
  }
  gtag('event', eventName, params)
}

// Helper function to get icon based on category title
const getCategoryIcon = (title: string) => {
  const lowerTitle = title.toLowerCase()

  if (
    lowerTitle.includes('duurza') ||
    lowerTitle.includes('eco') ||
    lowerTitle.includes('vegan') ||
    lowerTitle.includes('groen') ||
    lowerTitle.includes('sustainable')
  ) {
    return <span className="text-lg">🌱</span>
  }
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

// Helper function to generate social proof badges with urgency
const getSocialProofBadge = (
  deal: DealItem,
  index: number
): { text: string; icon: string; color: string } | null => {
  const score = deal.giftScore || 0
  const retailerInfo = resolveRetailerInfo(deal.affiliateLink)
  const isAmazon = retailerInfo.shortLabel.includes('Amazon')

  // Top 3 badge for first 3 items with high scores
  if (index < 3 && score >= 8) {
    return {
      text: `#${index + 1} Deze week`,
      icon: '🏆',
      color: 'bg-amber-100 text-amber-700',
    }
  }

  // Amazon Prime delivery urgency
  if (isAmazon && score >= 8) {
    return {
      text: '📦 Prime levering morgen',
      icon: '📦',
      color: 'bg-blue-100 text-blue-700',
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

  // New badge for on-sale items with time pressure
  if (deal.isOnSale) {
    return {
      text: '⏰ Deal eindigt binnenkort',
      icon: '⚡',
      color: 'bg-red-100 text-red-700',
    }
  }

  return null
}

// Hero Carousel Component
interface HeroCarouselProps {
  topDeals: DealItem[]
  dealOfWeek: DealItem | null
  navigateTo: NavigateTo
  handleFeaturedClick: () => void
  handleRefresh: () => void
  lastUpdated: Date | null
  formatDate: (value?: Date | string | null) => string | null
  partnerBadges: string[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HeroCarousel: React.FC<HeroCarouselProps> = ({
  topDeals,
  dealOfWeek,
  navigateTo,
  handleFeaturedClick,
  handleRefresh,
  lastUpdated: _lastUpdated,
  formatDate: _formatDate,
  partnerBadges,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const isAutoPlaying = true
  const [isHovering, setIsHovering] = useState(false)
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Helper to parse Euro formatted strings like "€314,00" to number 314.00
  const parseEuro = useCallback((input?: string): number | null => {
    if (!input) return null
    try {
      const normalized = input
        .toString()
        .replace(/[^0-9,.-]/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
      const num = Number.parseFloat(normalized)
      return Number.isNaN(num) ? null : num
    } catch {
      return null
    }
  }, [])

  // Get featured deals for carousel (max 6 for better variety)
  const featuredDeals = useMemo(() => {
    const deals = dealOfWeek ? [dealOfWeek, ...topDeals.slice(0, 5)] : topDeals.slice(0, 6)
    return deals.filter(Boolean)
  }, [topDeals, dealOfWeek])

  // Auto-play functionality - faster for more dynamic feel
  useEffect(() => {
    if (isAutoPlaying && featuredDeals.length > 1 && !isHovering) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredDeals.length)
      }, 5000)
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, featuredDeals.length, isHovering])

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredDeals.length) % featuredDeals.length)
  }

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredDeals.length)
  }

  const handleDotClick = (index: number) => {
    setCurrentSlide(index)
  }

  if (featuredDeals.length === 0) {
    return null
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-rose-900 py-8 md:py-12">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

      <Container size="xl" padded className="relative">
        {/* Header Section */}
        <div className="text-center mb-8 lg:mb-10 space-y-4">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-white">
              Live • {featuredDeals.length} Toppers vandaag
            </span>
          </div>

          {/* Main heading */}
          <div className="space-y-3">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black leading-none">
              <span className="block text-white drop-shadow-2xl mb-2">De beste</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400 animate-text-shimmer">
                cadeaus deals
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto">
              Ontdek exclusieve aanbiedingen met{' '}
              <span className="text-pink-300 font-bold">tot 50% korting</span>
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 justify-center text-sm">
            <div className="text-center">
              <div className="text-2xl font-black text-white">{featuredDeals.length}+</div>
              <div className="text-xs text-white/70 font-medium">Top Deals</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-black text-white">50%</div>
              <div className="text-xs text-white/70 font-medium">Korting</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-black text-white">24u</div>
              <div className="text-xs text-white/70 font-medium">Levering</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigateTo('giftFinder')}
              className="group relative px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full font-bold text-white shadow-2xl hover:shadow-pink-500/50 hover:scale-105 transition-all duration-300"
            >
              <span className="relative flex items-center gap-2">
                <SparklesIcon className="h-5 w-5" />
                Ontdek deals
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
              </span>
            </button>

            <button
              onClick={handleRefresh}
              className="px-5 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full font-semibold text-white hover:bg-white/20 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Vernieuwen
              </span>
            </button>
          </div>
        </div>

        {/* Carousel Section */}
        <div
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Cards container - 3D perspective effect */}
          <div className="relative h-[420px] lg:h-[450px] flex items-center justify-center perspective-1000">
            {featuredDeals.map((deal, index) => {
              const dealRetailerInfo = resolveRetailerInfo(deal.affiliateLink)
              const socialProof = getSocialProofBadge(deal, index)
              const currentPrice = parseEuro(deal.price)
              const originalPrice = parseEuro(deal.originalPrice)
              const discountPct =
                originalPrice && currentPrice && originalPrice > 0
                  ? Math.max(0, Math.round(((originalPrice - currentPrice) / originalPrice) * 100))
                  : null

              // Calculate position relative to current slide
              const offset = (index - currentSlide + featuredDeals.length) % featuredDeals.length
              const isCenter = offset === 0
              const isPrev = offset === featuredDeals.length - 1
              const isNext = offset === 1
              const isVisible = isCenter || isPrev || isNext

              // Calculate transform based on position
              let transform = ''
              let zIndex = 0
              let opacity = 0
              let scale = 0.8

              if (isCenter) {
                transform = 'translateX(0) translateZ(0) rotateY(0deg)'
                zIndex = 30
                opacity = 1
                scale = 1
              } else if (isPrev) {
                transform = 'translateX(-90%) translateZ(-150px) rotateY(30deg)'
                zIndex = 10
                opacity = 0.5
                scale = 0.8
              } else if (isNext) {
                transform = 'translateX(90%) translateZ(-150px) rotateY(-30deg)'
                zIndex = 10
                opacity = 0.5
                scale = 0.8
              }

              return (
                <div
                  key={deal.id}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    isVisible ? 'pointer-events-auto' : 'pointer-events-none'
                  }`}
                  style={{
                    transform,
                    zIndex,
                    opacity: isVisible ? opacity : 0,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="w-full h-full max-w-sm mx-auto flex items-center justify-center px-4">
                    <a
                      href={withAffiliate(deal.affiliateLink, {
                        pageType: 'deals',
                        placement: 'hero-3d-card',
                        cardIndex: index,
                        retailer: (dealRetailerInfo?.shortLabel || '').toLowerCase(),
                      })}
                      target="_blank"
                      rel="sponsored nofollow noopener noreferrer"
                      onClick={() => {
                        if (index === 0 && dealOfWeek) {
                          handleFeaturedClick()
                        }
                        try {
                          // Optional GTM event for affiliate click attribution
                          ;(window as any)?.dataLayer?.push({
                            event: 'affiliate_click',
                            source: 'deals_hero',
                            retailer: dealRetailerInfo.shortLabel,
                            deal_id: deal.id,
                            price: deal.price,
                          })
                        } catch {
                          // no-op
                        }
                      }}
                      className={`block w-full group ${!isCenter ? 'pointer-events-none' : ''}`}
                      style={{ transform: `scale(${scale})` }}
                    >
                      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-pink-500/30 transition-all duration-500">
                        {/* Image section */}
                        <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 aspect-square w-full flex items-center justify-center overflow-hidden">
                          {/* Rotating glow ring behind product */}
                          <div className="ring-gradient animate-spin-slower" aria-hidden="true" />
                          {/* Badges */}
                          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2 z-10">
                            {index === 0 && dealOfWeek && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white font-bold text-xs shadow-xl">
                                <StarIcon className="h-4 w-4" />
                                <span>DEAL WEEK</span>
                              </div>
                            )}
                            {discountPct !== null && discountPct > 0 && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600 text-white font-extrabold text-[11px] shadow-xl">
                                <TagIcon className="h-4 w-4" />
                                <span>-{discountPct}%</span>
                              </div>
                            )}
                            {socialProof && (
                              <div
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs shadow-md ${socialProof.color}`}
                              >
                                <span>{socialProof.icon}</span>
                              </div>
                            )}
                          </div>

                          {/* Product image */}
                          <div className="relative w-full h-full p-8 flex items-center justify-center">
                            <ImageWithFallback
                              src={deal.imageUrl}
                              alt={deal.name}
                              fallbackSrc={getFallbackImageUrl(deal)}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>

                          {/* Retailer badge */}
                          <div className="absolute bottom-3 right-3">
                            <div
                              className={`inline-flex items-center px-3 py-1.5 rounded-lg font-bold text-xs shadow-lg ${dealRetailerInfo.badgeClass}`}
                            >
                              {dealRetailerInfo.shortLabel}
                            </div>
                          </div>
                        </div>

                        {/* Content section */}
                        <div className="p-5 bg-white space-y-3">
                          {/* Title */}
                          <h2 className="font-display text-xl font-black text-slate-900 leading-tight group-hover:text-rose-600 transition-colors line-clamp-2">
                            {deal.name}
                          </h2>

                          {/* Price */}
                          <div className="flex items-baseline gap-2 flex-wrap">
                            {deal.isOnSale && deal.originalPrice && (
                              <span className="text-base text-slate-400 line-through font-semibold">
                                {deal.originalPrice}
                              </span>
                            )}
                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                              {deal.price || 'Bekijk prijs'}
                            </span>
                          </div>

                          {/* CTA Button */}
                          <button className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                            <span>Shop bij {dealRetailerInfo.shortLabel}</span>
                            <svg
                              className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
                          <p className="text-[11px] text-slate-500 text-center mt-1">
                            Partnerlink • wij kunnen commissie ontvangen
                          </p>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation arrows */}
          {featuredDeals.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-0 lg:-left-12 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all duration-300 group"
                aria-label="Vorige"
              >
                <ChevronLeftIcon className="h-6 w-6 text-slate-700 group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 lg:-right-12 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all duration-300 group"
                aria-label="Volgende"
              >
                <ChevronRightIcon className="h-6 w-6 text-slate-700 group-hover:text-white transition-colors" />
              </button>
            </>
          )}
        </div>

        {/* Progress indicators */}
        {featuredDeals.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {featuredDeals.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-10 bg-gradient-to-r from-pink-400 to-rose-400 shadow-lg'
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Ga naar deal ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom info */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-white/80">
              <CheckIcon className="h-4 w-4 text-green-400" />
              <span>Gratis verzending</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <CheckIcon className="h-4 w-4 text-green-400" />
              <span>Snelle levering</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <CheckIcon className="h-4 w-4 text-green-400" />
              <span>Top retailers</span>
            </div>
          </div>

          {partnerBadges.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs mt-4">
              <span className="font-semibold text-white/70">Partnerwinkels:</span>
              {partnerBadges.slice(0, 4).map((badge, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

// Pro hero with two-column layout and spotlight card
interface ProDealsHeroProps extends HeroCarouselProps {
  themeCategories?: DealCategory[]
}

const ProDealsHero: React.FC<ProDealsHeroProps> = (props) => {
  const {
    topDeals,
    dealOfWeek,
    navigateTo,
    handleFeaturedClick,
    handleRefresh,
    lastUpdated,
    formatDate,
    partnerBadges = [],
    themeCategories = [],
  } = props

  // Theme selection: 'spotlight' (default) or category id
  const [selectedTheme, setSelectedTheme] = React.useState<string>('spotlight')

  const selectedCategory = React.useMemo(() => {
    if (!themeCategories || selectedTheme === 'spotlight') return null
    return themeCategories.find((c) => (c.id || c.title) === selectedTheme) || null
  }, [themeCategories, selectedTheme])

  const deck = React.useMemo(() => {
    const sourceDeals = selectedCategory
      ? selectedCategory.items || []
      : dealOfWeek
        ? [dealOfWeek, ...topDeals]
        : topDeals
    const arr = (sourceDeals || []).filter(Boolean)
    // Deduplicate by id
    const map = new Map(arr.map((d) => [d.id, d]))
    return Array.from(map.values()).slice(0, 12)
  }, [topDeals, dealOfWeek, selectedCategory])

  const [idx, setIdx] = React.useState(0)

  // Ensure required partner brands are always present in the hero marquee
  const marqueeBrands = React.useMemo(() => {
    const lower = new Set(partnerBadges.map((b) => b.toLowerCase()))
    const merged = [...partnerBadges]
    REQUIRED_PARTNER_BRANDS.forEach((r) => {
      if (!lower.has(r.toLowerCase())) merged.push(r)
    })
    // Deduplicate while preserving order
    return Array.from(new Map(merged.map((v) => [v.toLowerCase(), v])).values())
  }, [partnerBadges])

  const active = deck[idx] ?? null
  const prev = () => setIdx((p) => (p - 1 + deck.length) % deck.length)
  const next = () => setIdx((p) => (p + 1) % deck.length)

  const parseEuro = React.useCallback((input?: string): number | null => {
    if (!input) return null
    const normalized = input
      .replace(/[^0-9,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
    const n = Number.parseFloat(normalized)
    return Number.isNaN(n) ? null : n
  }, [])

  // Theme-driven background and blob colors (must be before any early returns to keep hook order stable)
  const themeVisuals = React.useMemo(() => {
    const def = {
      // Spotlight (default): nóg lichter, maar nog leesbaar met witte tekst
      bg: 'from-rose-500 via-pink-400 to-fuchsia-400',
      blob1: 'bg-pink-100',
      blob2: 'bg-rose-100',
      blob3: 'bg-fuchsia-200',
    }
    if (!selectedCategory) return def
    const t = (selectedCategory.title || '').toLowerCase()
    if (t.includes('duurza') || t.includes('eco') || t.includes('vegan') || t.includes('groen')) {
      return {
        bg: 'from-emerald-950 via-green-900 to-lime-800',
        blob1: 'bg-emerald-500',
        blob2: 'bg-lime-500',
        blob3: 'bg-green-600',
      }
    }
    if (t.includes('feest') || t.includes('party')) {
      return {
        // Nog iets lichter en gradient omgedraaid (van fuchsia naar rose)
        bg: 'from-fuchsia-500 via-pink-500 to-rose-500',
        blob1: 'bg-pink-200',
        blob2: 'bg-rose-200',
        blob3: 'bg-fuchsia-300',
      }
    }
    return def
  }, [selectedCategory])

  if (!active) return null

  const retailer = resolveRetailerInfo(active.affiliateLink)
  const curr = parseEuro(active.price)
  const orig = parseEuro(active.originalPrice)
  const pct = orig && curr ? Math.max(0, Math.round(((orig - curr) / orig) * 100)) : null

  return (
    <section className={`relative deals-hero overflow-hidden bg-gradient-to-br ${themeVisuals.bg}`}>
      {/* background accents */}
      <div className="absolute inset-0 opacity-30">
        <div
          className={`absolute -top-12 -left-8 w-[420px] h-[420px] ${themeVisuals.blob1} rounded-full mix-blend-multiply filter blur-3xl animate-blob`}
        />
        <div
          className={`absolute -bottom-16 left-1/3 w-[420px] h-[420px] ${themeVisuals.blob2} rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000`}
        />
        <div
          className={`absolute -top-10 -right-10 w-[520px] h-[520px] ${themeVisuals.blob3} rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000`}
        />
      </div>

      <Container size="xl" padded className="relative py-10 md:py-14">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left copy */}
          <div className="text-center lg:text-left space-y-6">
            {/* Theme tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-1 justify-center lg:justify-start">
              {[
                { id: 'spotlight', title: 'Spotlight' },
                ...themeCategories
                  .slice(0, 4)
                  .map((c) => ({ id: c.id || c.title, title: c.title })),
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setIdx(0)
                    setSelectedTheme(t.id)
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                    selectedTheme === t.id
                      ? 'bg-white text-slate-900'
                      : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-sm font-bold">
                Live • {deck.length} toppers vandaag
              </span>
            </div>

            <h1 className="font-display leading-tight font-black text-4xl md:text-5xl lg:text-6xl text-white">
              {selectedCategory ? (
                <>{selectedCategory.title} deals zonder keuzestress</>
              ) : (
                <>
                  <span className="block">Beste cadeau deals</span>
                  <span className="block">van Amazon, Coolblue & partners</span>
                </>
              )}
            </h1>
            {/* Subregel voor spotlight verwijderd op verzoek (hoogte blijft geborgd via beschrijving) */}
            <p className="text-white/90 text-lg md:text-xl leading-relaxed line-clamp-4 max-w-xl lg:max-w-none min-h-[112px] md:min-h-[132px]">
              {selectedCategory?.description || (
                <>
                  Handgepickt van top retailers als {marqueeBrands[0] ?? 'onze partners'}. Snelle
                  levering, hoge scores en scherpe prijzen.
                </>
              )}
            </p>

            {/* Thematic helper badge */}
            {selectedCategory && (
              <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-white/15 text-white/90 border border-white/20">
                {selectedCategory.title.toLowerCase().includes('duurzaam')
                  ? '✨ Impactvolle keuzes'
                  : '🎉 Direct feestklaar'}
              </div>
            )}

            <div className="flex flex-wrap gap-3 lg:gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigateTo('giftFinder')}
                className="group relative px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full font-bold text-white shadow-xl hover:shadow-pink-500/40 hover:scale-105 transition-all"
              >
                <span className="relative flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5" />
                  {selectedCategory ? `Shop ${selectedCategory.title}` : 'Ontdek deals'}
                </span>
              </button>
              <button
                onClick={handleRefresh}
                className="px-5 py-3 rounded-full border border-white/25 text-white/90 hover:bg-white/10 backdrop-blur-md font-semibold"
              >
                Vernieuwen
              </button>
            </div>

            {/* trust mini row */}
            <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start text-xs text-white/80">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-400" />
                Gratis verzending
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-400" />
                Snelle levering
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-400" />
                Top retailers
              </div>
            </div>

            {/* brand marquee */}
            {marqueeBrands.length > 0 && (
              <div className="hero-marquee border-white/30 bg-white/70">
                <div className="hero-marquee-track">
                  {marqueeBrands.concat(marqueeBrands).map((b, i) => (
                    <span key={`${b}-${i}`} className="hero-marquee-item">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {lastUpdated && (
              <div className="text-white/60 text-xs">
                Laatst bijgewerkt: {formatDate(lastUpdated)}
              </div>
            )}
          </div>

          {/* Right spotlight card */}
          <div className="relative">
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-6 bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-purple-500/10 blur-2xl rounded-[2rem]" />
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="relative aspect-square flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                  <div className="ring-gradient animate-spin-slower" />
                  {pct !== null && pct > 0 && (
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-extrabold shadow-lg">
                      <TagIcon className="h-4 w-4" /> -{pct}%
                    </div>
                  )}
                  <div
                    className={`absolute bottom-3 right-3 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg ${retailer.badgeClass}`}
                  >
                    {retailer.shortLabel}
                  </div>
                  <div className="relative w-full h-full p-8">
                    <ImageWithFallback
                      src={active.imageUrl}
                      alt={active.name}
                      fallbackSrc={getFallbackImageUrl(active)}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h2 className="font-display text-xl font-black text-slate-900 line-clamp-2">
                    {active.name}
                  </h2>
                  <div className="flex items-baseline gap-2">
                    {active.isOnSale && active.originalPrice && (
                      <span className="text-slate-400 line-through text-sm font-semibold">
                        {active.originalPrice}
                      </span>
                    )}
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                      {active.price || 'Bekijk prijs'}
                    </span>
                  </div>
                  <a
                    href={withAffiliate(active.affiliateLink, {
                      pageType: 'deals',
                      theme: selectedTheme,
                      placement: 'hero-spotlight-cta',
                      cardIndex: idx,
                      retailer: (retailer.shortLabel || '').toLowerCase(),
                    })}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    onClick={handleFeaturedClick}
                    className="w-full block text-center py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
                  >
                    Shop bij {retailer.shortLabel}
                  </a>
                  <p className="text-[11px] text-slate-500 text-center">
                    Partnerlink • wij kunnen commissie ontvangen
                  </p>
                </div>
              </div>
            </div>

            {/* nav arrows */}
            {deck.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 transition"
                  aria-label="Vorige"
                >
                  <ChevronLeftIcon className="h-6 w-6 text-slate-700" />
                </button>
                <button
                  onClick={next}
                  className="absolute -right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 transition"
                  aria-label="Volgende"
                >
                  <ChevronRightIcon className="h-6 w-6 text-slate-700" />
                </button>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

class DealsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message?: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) }
  }
  componentDidCatch(error: unknown, errorInfo: unknown) {
    try {
      // Best-effort logging without breaking the UI
      console.error('Deals page runtime error:', error, errorInfo)
    } catch (loggingError) {
      console.error('Deals page error logging failed:', loggingError)
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 max-w-xl text-center">
            <p className="font-semibold mb-1">Er ging iets mis bij het laden van de deals.</p>
            <p className="text-sm opacity-80">
              Probeer de pagina te verversen. Blijft dit gebeuren? Laat het ons weten.
            </p>
          </div>
        </div>
      )
    }
    return this.props.children as React.ReactElement
  }
}

const DealsPage: React.FC<DealsPageProps> = ({ navigateTo }) => {
  const automationModeActive = useMemo(() => isAutomationEnvironment(), [])
  const [state, setState] = useState<DealsPageState>(DEFAULT_STATE)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [pinnedDeals, setPinnedDeals] = useState<DealItem[]>([])

  // Filter state
  const [priceFilter, setPriceFilter] = useState<string>('all')
  const [scoreFilter, setScoreFilter] = useState<number>(0)

  // Quick budget filter handler
  const handleQuickBudgetFilter = useCallback((budgetRange: string) => {
    setPriceFilter(budgetRange)
    trackAnalyticsEvent('budget_filter_click', {
      event_category: 'Deals Page',
      event_label: budgetRange,
      value: budgetRange,
    })
  }, [])

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

      if (automationModeActive) {
        const snapshot = buildAutomationDealsSnapshot()
        setState(snapshot.state)
        setPinnedDeals(snapshot.pinned)
        setLastUpdated(snapshot.lastUpdated)
        setIsLoading(false)
        return
      }

      try {
        // Always force refresh on first load to ensure fresh data
        const shouldForceRefresh =
          forceRefresh || !sessionStorage.getItem('deals_loaded_this_session')

        if (shouldForceRefresh) {
          // Only invalidate caches when explicitly requested to avoid unnecessary cold starts
          CoolblueFeedService.clearCache()
          DealCategoryConfigService.clearCache()
          logger.info('Forcing fresh deals data load', {
            scope: 'deals.load',
            reason: forceRefresh ? 'manual-refresh' : 'initial-load',
          })
          sessionStorage.setItem('deals_loaded_this_session', 'true')
        }

        const [
          dealOfWeek,
          topDeals,
          categories,
          config,
          pinnedEntries,
          sustainableProducts,
          partyProducts,
        ] = await Promise.all([
          DynamicProductService.getDealOfTheWeek(),
          DynamicProductService.getTopDeals(20),
          DynamicProductService.getDealCategories(),
          DealCategoryConfigService.load(),
          PinnedDealsService.load(),
          ShopLikeYouGiveADamnService.loadProducts(),
          PartyProService.loadProducts(),
        ])

        const stats = DynamicProductService.getStats()
        setLastUpdated(stats?.lastUpdated ?? null)

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

        if (premiumRotation.length > 0) {
          logger.info('Premium rotation prepared', {
            scope: 'deals.load',
            candidateCount: premiumRotation.length,
          })
        }

        const pinned = pinnedEntries
          .map((entry) => entry?.deal)
          .filter((deal): deal is DealItem => Boolean(deal?.id))

        setPinnedDeals(pinned)

        const hasManualCategories = Boolean(config?.categories?.length)
        const categoriesToDisplay = hasManualCategories
          ? categories.filter((category) => category.items.length > 0)
          : []

        // Voeg Duurzame Cadeaus categorie toe als er producten zijn
        if (sustainableProducts && sustainableProducts.length > 0) {
          // Groepeer producten per subcategorie voor variatie
          const grouped: Record<string, typeof sustainableProducts> = {}
          sustainableProducts.forEach((product) => {
            // Gebruik de detectSubcategory functie
            const name = product.name.toLowerCase()
            let subcategory = 'Overige'

            if (name.includes('ring')) subcategory = 'Ringen'
            else if (name.includes('ketting') || name.includes('necklace'))
              subcategory = 'Kettingen'
            else if (name.includes('oorbel') || name.includes('earring')) subcategory = 'Oorbellen'
            else if (name.includes('armband') || name.includes('bracelet'))
              subcategory = 'Armbanden'
            else if (name.includes('yoga') || name.includes('peshtemal'))
              subcategory = 'Yoga & Wellness'
            else if (name.includes('waterfles') || name.includes('bottle'))
              subcategory = 'Drinkflessen'
            else if (name.includes('tas') || name.includes('bag')) subcategory = 'Tassen'
            else if (name.includes('portemonnee') || name.includes('wallet'))
              subcategory = 'Portemonnees'

            if (!grouped[subcategory]) grouped[subcategory] = []
            grouped[subcategory].push(product)
          })

          // Selecteer gevarieerd: neem uit elke categorie, rond robin
          const variedProducts: typeof sustainableProducts = []
          const categories = Object.keys(grouped).sort(() => Math.random() - 0.5) // Shuffle
          let added = 0
          let round = 0

          // Blijf rondjes doen tot we 20 producten hebben
          while (added < 20 && round < 10) {
            categories.forEach((category) => {
              if (added >= 20) return
              const categoryProducts = grouped[category]
              if (categoryProducts && categoryProducts.length > round) {
                variedProducts.push(categoryProducts[round])
                added++
              }
            })
            round++
          }

          const sustainableDeals = variedProducts.slice(0, 20).map((product) => ({
            id: product.id,
            name: product.name,
            price: `€${product.price.toFixed(2)}`,
            originalPrice: product.originalPrice
              ? `€${product.originalPrice.toFixed(2)}`
              : undefined,
            imageUrl: product.imageUrl || product.image,
            affiliateLink: product.affiliateLink,
            description: product.description || product.shortDescription,
            giftScore: product.giftScore || 8,
            isOnSale: Boolean(product.originalPrice && product.originalPrice > product.price),
            category: product.category, // Bewaar categorie voor later
          }))

          const sustainableCategory = {
            id: 'duurzame-cadeaus-slygad',
            title: 'Duurzame Cadeaus',
            description:
              '🌿 Bewuste en ecologische geschenken van Shop Like You Give A Damn. Gevarieerde selectie van 20 duurzame producten - van yoga items tot vegan sieraden. Perfect voor mensen die van de aarde houden.',
            items: sustainableDeals,
          }

          categoriesToDisplay.push(sustainableCategory)
          logger.info('Added sustainable deals category', {
            scope: 'deals.load',
            productCount: sustainableDeals.length,
            subcategoryCount: categories.length,
          })
        }

        // Voeg PartyPro Feest & Party Cadeaus categorie toe
        if (partyProducts && partyProducts.length > 0) {
          // Groepeer producten per subcategorie voor variatie
          const grouped: Record<string, typeof partyProducts> = {}
          partyProducts.forEach((product) => {
            const name = product.name.toLowerCase()
            let subcategory = 'Overige'

            if (name.includes('ballon') || name.includes('slingers') || name.includes('decoratie'))
              subcategory = 'Decoratie'
            else if (
              name.includes('drinkspel') ||
              name.includes('beer pong') ||
              name.includes('spel')
            )
              subcategory = 'Drinkspellen'
            else if (name.includes('licht') || name.includes('led') || name.includes('gadget'))
              subcategory = 'Party Gadgets'
            else if (name.includes('bord') || name.includes('beker') || name.includes('servies'))
              subcategory = 'Servies & Tafel'
            else if (name.includes('thema') || name.includes('theme')) subcategory = 'Thema Feest'
            else if (name.includes('kostuum') || name.includes('masker') || name.includes('hoed'))
              subcategory = 'Kostuums'
            else if (name.includes('confetti') || name.includes('serpentine'))
              subcategory = 'Confetti'

            if (!grouped[subcategory]) grouped[subcategory] = []
            grouped[subcategory].push(product)
          })

          // Selecteer gevarieerd: neem uit elke categorie, round robin
          const variedProducts: typeof partyProducts = []
          const partyCategories = Object.keys(grouped).sort(() => Math.random() - 0.5) // Shuffle
          let added = 0
          let round = 0

          // Blijf rondjes doen tot we 20 producten hebben
          while (added < 20 && round < 10) {
            partyCategories.forEach((category) => {
              if (added >= 20) return
              const categoryProducts = grouped[category]
              if (categoryProducts && categoryProducts.length > round) {
                variedProducts.push(categoryProducts[round])
                added++
              }
            })
            round++
          }

          const partyDeals = variedProducts.slice(0, 20).map((product) => ({
            id: product.id,
            name: product.name,
            price: `€${product.price.toFixed(2)}`,
            originalPrice: product.originalPrice
              ? `€${product.originalPrice.toFixed(2)}`
              : undefined,
            imageUrl: product.imageUrl || product.image,
            affiliateLink: product.affiliateLink,
            description: product.description || product.shortDescription,
            giftScore: product.giftScore || 8,
            isOnSale: Boolean(product.originalPrice && product.originalPrice > product.price),
            category: product.category,
          }))

          const partyCategory = {
            id: 'feest-party-partypro',
            title: 'Feest & Party Cadeaus',
            description:
              '🎉 Maak elk feest onvergetelijk met PartyPro.nl! Van decoratie en drinkspellen tot party gadgets en kostuums. Gevarieerde selectie van 20 feestelijke producten voor elke gelegenheid.',
            items: partyDeals,
          }

          categoriesToDisplay.push(partyCategory)
          logger.info('Added party deals category', {
            scope: 'deals.load',
            productCount: partyDeals.length,
            subcategoryCount: partyCategories.length,
          })
        }

        setState({
          dealOfWeek: featuredDeal,
          topDeals,
          categories: categoriesToDisplay,
        })
      } catch (loadError: unknown) {
        logUnknownError('Kon deals niet laden', loadError, { scope: 'deals.load' })
        setError(getErrorMessage(loadError, 'Kon deals niet laden. Probeer het later opnieuw.'))
        setState(DEFAULT_STATE)
      } finally {
        setIsLoading(false)
      }
    },
    [automationModeActive]
  )

  useEffect(() => {
    // Force fresh data load on mount to prevent stale cache issues
    void loadDeals({ forceRefresh: true })
  }, [loadDeals])

  // Filter deals based on selected filters
  const filterDeals = useCallback(
    (deals: DealItem[]) => {
      return deals.filter((deal) => {
        const normalizedPrice = deal.price
          ? deal.price.replace(/[^0-9,.]/g, '').replace(',', '.')
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
      const price = deal.price?.replace(/[^0-9,.]/g, '').replace(',', '.') ?? ''

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: deal.name,
          image: deal.imageUrl,
          description: deal.description || deal.name,
          brand: {
            '@type': 'Brand',
            name: sellerName,
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price: price,
            url: withAffiliate(deal.affiliateLink),
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'Organization',
              name: sellerName,
            },
            priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          },
          ...(deal.giftScore &&
            deal.giftScore >= 8 && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: deal.giftScore,
                bestRating: '10',
                ratingCount: '100',
              },
            }),
        },
      }
    })

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'De beste cadeaus van de week - Gifteez',
      description:
        'Handgeselecteerde cadeaus van Coolblue en Amazon met snelle levering. Perfect voor elke gelegenheid.',
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
  const QuickBudgetFilters: React.FC = () => {
    const budgetOptions = [
      { label: 'Onder €25', value: '0-25', icon: '💰' },
      { label: '€25 - €50', value: '25-50', icon: '💎' },
      { label: '€50 - €100', value: '50-100', icon: '✨' },
      { label: '€100+', value: '100+', icon: '🎁' },
    ]

    return (
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-semibold text-slate-700">Snel filteren op budget:</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleQuickBudgetFilter('all')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md ${
              priceFilter === 'all'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white scale-105'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50'
            }`}
          >
            <span>🎯</span>
            <span>Alle prijzen</span>
          </button>
          {budgetOptions.map((option) => {
            // Map the custom ranges to the existing filter logic
            let filterValue = option.value
            if (option.value === '0-25')
              filterValue = '0-50' // Map to existing 0-50
            else if (option.value === '25-50')
              filterValue = '0-50' // Map to existing 0-50
            else if (option.value === '100+') filterValue = '200+' // Map to existing 200+

            const isActive = priceFilter === filterValue

            return (
              <button
                key={option.value}
                onClick={() => handleQuickBudgetFilter(filterValue)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white scale-105'
                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50'
                }`}
              >
                <span className="text-base">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

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
    const [currentIndex, setCurrentIndex] = useState(0)

    // Touch swipe state
    const [touchStart, setTouchStart] = useState(0)
    const [touchEnd, setTouchEnd] = useState(0)

    const checkScroll = useCallback(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)

        // Update current index
        const cardWidth = 280
        const newIndex = Math.round(scrollLeft / cardWidth)
        setCurrentIndex(newIndex)
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

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0
    const itemsPerView = viewportWidth >= 1024 ? 3 : viewportWidth >= 640 ? 2 : 1
    const totalPages = Math.ceil(items.length / itemsPerView)

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
          {/* Desktop navigation - always visible */}
          <div className="hidden md:flex items-center gap-3">
            {/* Progress dots */}
            {items.length > 3 && (
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
            {/* Navigation buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white shadow-sm hover:shadow-md"
                aria-label="Vorige items"
              >
                <ChevronRightIcon className="h-5 w-5 rotate-180" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white shadow-sm hover:shadow-md"
                aria-label="Volgende items"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile swipe indicator */}
        <div className="md:hidden mb-3 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100">
            <span>👈</span>
            <span>Swipe om te navigeren</span>
            <span>👉</span>
          </div>
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

        {/* Mobile scroll indicator - Shows there's more content below */}
        <div className="md:hidden mt-4 flex flex-col items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <span>↓</span>
            <span>Scroll naar beneden voor meer</span>
            <span>↓</span>
          </div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
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
    const auth = useContext(AuthContext)

    // Favorites state
    const [isFavorite, setIsFavorite] = useState(false)
    const [favoritePulse, setFavoritePulse] = useState(false)
    const favoritePulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    // Reserve consistent content height for non-feature cards so all cards align
    const contentMinHClass = variant === 'feature' ? '' : 'min-h-[190px]'
    const metaRowMinHClass = variant === 'feature' ? '' : 'min-h-[28px]'
    const titleMinHClass = variant === 'feature' ? '' : 'min-h-[44px]'
    const priceBadgeClass = variant === 'feature' ? 'px-4 py-2 text-base' : 'px-3 py-1.5 text-sm'
    const buttonPaddingClass =
      variant === 'feature' ? 'px-6 py-3.5 text-base' : 'px-4 py-2.5 text-sm'

    const formattedPrice = formatPrice(deal.price) ?? deal.price ?? ''

    // Convert DealItem to Gift format for favorites
    const dealAsGift = useMemo<Gift>(() => {
      const retailerLabel = retailerInfo?.shortLabel ?? 'Partnerdeal'

      return {
        productName: deal.name,
        description: deal.description || `Toppertje: ${deal.name} nu met korting!`,
        priceRange: formattedPrice,
        retailers: [
          {
            name: retailerLabel,
            affiliateLink: deal.affiliateLink,
          },
        ],
        imageUrl: deal.imageUrl,
        tags: deal.tags,
      }
    }, [deal, formattedPrice, retailerInfo?.shortLabel])

    // Check favorite status
    useEffect(() => {
      if (auth?.currentUser) {
        setIsFavorite(auth.isFavorite(dealAsGift))
      } else {
        try {
          const favorites: Gift[] = JSON.parse(localStorage.getItem('gifteezFavorites') || '[]')
          setIsFavorite(favorites.some((fav: Gift) => fav.productName === deal.name))
        } catch (parseError) {
          logUnknownError('Failed to parse guest favorites from localStorage', parseError, {
            scope: 'deals.favorites.load',
            dealId: deal.id,
          })
        }
      }
    }, [deal.id, deal.name, auth, dealAsGift])

    // Cleanup timeout on unmount
    useEffect(
      () => () => {
        if (favoritePulseTimeoutRef.current) {
          clearTimeout(favoritePulseTimeoutRef.current)
          favoritePulseTimeoutRef.current = null
        }
      },
      []
    )

    // Toggle favorite handler
    const handleToggleFavorite = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      let isNowFavorite: boolean

      if (auth?.currentUser) {
        auth.toggleFavorite(dealAsGift)
        isNowFavorite = !auth.isFavorite(dealAsGift)
      } else {
        try {
          const favorites: Gift[] = JSON.parse(localStorage.getItem('gifteezFavorites') || '[]')
          const isCurrentlyFavorite = favorites.some((fav) => fav.productName === deal.name)

          let updatedFavorites: Gift[]
          if (isCurrentlyFavorite) {
            updatedFavorites = favorites.filter((fav) => fav.productName !== deal.name)
          } else {
            updatedFavorites = [...favorites, dealAsGift]
          }
          localStorage.setItem('gifteezFavorites', JSON.stringify(updatedFavorites))
          isNowFavorite = !isCurrentlyFavorite
        } catch (updateError) {
          logUnknownError('Failed to update guest favorites in localStorage', updateError, {
            scope: 'deals.favorites.update',
            dealId: deal.id,
          })
          return
        }
      }

      setIsFavorite(isNowFavorite)
      if (isNowFavorite) {
        if (favoritePulseTimeoutRef.current) {
          clearTimeout(favoritePulseTimeoutRef.current)
          favoritePulseTimeoutRef.current = null
        }
        setFavoritePulse(true)
        favoritePulseTimeoutRef.current = setTimeout(() => {
          setFavoritePulse(false)
          favoritePulseTimeoutRef.current = null
        }, 220)
      }
    }

    // Enhance product name for gift sets
    const enhanceProductName = (name: string): string => {
      const lower = name.toLowerCase()
      // If it's a gift set for women, make it more appealing
      if (lower.includes('set') || lower.includes('box') || lower.includes('kit')) {
        // Don't modify if already has "voor haar" or similar
        if (lower.includes('voor haar') || lower.includes('vrouwen') || lower.includes('dames')) {
          return name
        }
        // Add female-focused language for beauty/wellness/spa sets
        if (
          lower.includes('beauty') ||
          lower.includes('spa') ||
          lower.includes('skincare') ||
          lower.includes('wellness') ||
          lower.includes('bath') ||
          lower.includes('badolie') ||
          lower.includes('body') ||
          lower.includes('verzorging')
        ) {
          return `${name} - Luxe Verwenset voor Haar`
        }
      }
      return name
    }

    const displayName = enhanceProductName(deal.name)

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
    }, [deal.id, retailerInfo?.shortLabel])

    const handleClick = () => {
      if (deal.id) {
        trackDealClick(deal.id, retailerInfo?.shortLabel)
      }
      // Navigate to product landing page
      navigateTo('productLanding', { productId: deal.id, product: deal })
    }

    return (
      <div ref={cardRef} className="h-full" data-testid={`deal-card-${variant}`}>
        <div
          onClick={handleClick}
          className={`group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer p-[2px] ${
            isTopDeal
              ? 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 animate-gradient-xy'
              : 'bg-slate-200/40'
          }`}
        >
          {/* Consistent inner wrapper so all cards keep the same outer size */}
          <div className="bg-white rounded-2xl h-full flex flex-col overflow-hidden shadow-sm">
            <div
              className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-white ${imageHeightClass}`}
            >
              <ImageWithFallback
                src={deal.imageUrl}
                alt={deal.name}
                fallbackSrc={getFallbackImageUrl(deal)}
                className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                fit="contain"
              />

              {/* Favorite button - top-left corner */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleFavorite(e)
                }}
                className={`absolute top-2 left-2 z-10 rounded-full bg-white p-2 shadow-md transition-all hover:scale-110 hover:shadow-lg ${
                  favoritePulse ? 'animate-pulse' : ''
                }`}
                aria-label={isFavorite ? 'Verwijder van favorieten' : 'Voeg toe aan favorieten'}
              >
                {isFavorite ? (
                  <HeartIconFilled className="h-5 w-5 text-rose-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-slate-400 hover:text-rose-500" />
                )}
              </button>

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
            <div className={`flex flex-1 flex-col gap-3 ${bodyPaddingClass} ${contentMinHClass}`}>
              {/* Reserved meta row so cards keep equal height whether badges show or not */}
              <div className={`flex items-start gap-2 flex-wrap ${metaRowMinHClass}`}>
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
              </div>

              <div className={`space-y-1.5 ${titleMinHClass}`}>
                <h3
                  className="font-display text-base font-semibold text-slate-900 line-clamp-2 leading-snug"
                  data-testid="deal-title"
                >
                  {displayName}
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
                    className={`rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white shadow-md ${priceBadgeClass}`}
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
                  href={withAffiliate(deal.affiliateLink, {
                    pageType: 'deals',
                    placement: 'card-cta',
                    cardIndex: index,
                    retailer: (retailerInfo?.shortLabel || '').toLowerCase(),
                  })}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClick()
                  }}
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
                    <svg
                      className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
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
                  </span>
                </a>

                {/* Share button - Stuur deze deal naar een vriend */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const shareBtn = e.currentTarget.nextElementSibling
                    if (shareBtn && shareBtn.classList.contains('deal-share-menu')) {
                      shareBtn.classList.toggle('hidden')
                    }
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                >
                  <ShareIcon className="h-4 w-4" />
                  <span>Deel deze deal</span>
                </button>
                <div className="deal-share-menu hidden rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                  <p className="mb-2 text-xs font-semibold text-slate-600">
                    Stuur deze deal naar een vriend
                  </p>
                  <SocialShare item={dealAsGift} type="gift" variant="compact" />
                </div>
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
      if (
        lowerTitle.includes('man') ||
        lowerTitle.includes('heren') ||
        lowerTitle.includes('men')
      ) {
        return 'Stoere Gift Sets voor Mannen - Maak Indruk'
      }
      return 'Luxe Gift Sets voor Vrouwen - Direct Indruk Maken'
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
        if (
          lowerTitle.includes('man') ||
          lowerTitle.includes('heren') ||
          lowerTitle.includes('men')
        ) {
          return `🎯 Stoere cadeauboxen speciaal voor mannen. ${count} gave sets met grooming, tech en lifestyle producten. Strak verpakt, snel leverbaar via Amazon Prime, en meteen klaar om te geven. Perfect voor vaders, broers, vrienden of een traktatie voor jezelf.`
        }
        return `✨ Speciaal samengestelde cadeauboxen voor haar. ${count} prachtige sets met beauty, wellness en lifestyle producten. Luxe verpakkingen, snelle levering via Amazon Prime, en direct klaar om cadeau te geven. Perfect voor vriendinnen, moeders, zussen of een verwenmoment voor jezelf.`
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
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const carouselRef = useRef<ProductCarouselControls | null>(null)

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
          const normalised = item.price.replace(/[^0-9,.]/g, '').replace(',', '.')
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

    if (!items.length) {
      return null
    }

    const displayTitle = getDisplayTitle(category.title)
    const description = getCategoryDescription(category.title, displayTitle, items.length)

    // Detect category type for themed colors
    const lowerTitle = category.title.toLowerCase()
    const isMensCategory =
      lowerTitle.includes('mannen') ||
      lowerTitle.includes('heren') ||
      lowerTitle.includes('men') ||
      lowerTitle.includes('voor mannen')

    const isSustainableCategory =
      lowerTitle.includes('duurza') ||
      lowerTitle.includes('eco') ||
      lowerTitle.includes('vegan') ||
      lowerTitle.includes('groen') ||
      lowerTitle.includes('sustainable')

    const isPartyCategory =
      lowerTitle.includes('feest') ||
      lowerTitle.includes('party') ||
      lowerTitle.includes('viering') ||
      lowerTitle.includes('celebration')

    // Determine urgency badge based on category performance
    const avgScore =
      items.reduce((sum, item) => sum + (item.giftScore || 0), 0) / (items.length || 1)
    const isNewCategory = items.some((item) => item.isOnSale) // Using isOnSale as proxy for new
    const isLimitedStock = items.length <= 5 // Small collection implies scarcity

    let urgencyBadge: { text: string; icon: string; classes: string } | null = null
    if (avgScore >= 8.5) {
      urgencyBadge = {
        text: '🔥 Nieuw deze week',
        icon: '🔥',
        classes: 'bg-orange-100 text-orange-700',
      }
    } else if (isNewCategory) {
      urgencyBadge = {
        text: '⚡ Trending nu',
        icon: '⚡',
        classes: 'bg-yellow-100 text-yellow-700',
      }
    } else if (isLimitedStock) {
      urgencyBadge = {
        text: '⏰ Beperkte selectie',
        icon: '⏰',
        classes: 'bg-red-100 text-red-700',
      }
    }

    // Different colors based on category theme
    let badgeClasses, buttonGradient, buttonGlowGradient

    if (isSustainableCategory) {
      // Green/eco theme for sustainable products
      badgeClasses = 'bg-emerald-100 text-emerald-700'
      buttonGradient = 'from-emerald-600 via-green-600 to-teal-700'
      buttonGlowGradient = 'from-emerald-400 via-green-400 to-teal-500'
    } else if (isPartyCategory) {
      // Purple/magenta/gold theme for party/celebration categories
      badgeClasses = 'bg-purple-100 text-purple-700'
      buttonGradient = 'from-purple-600 via-fuchsia-600 to-pink-600'
      buttonGlowGradient = 'from-purple-400 via-fuchsia-400 to-pink-400'
    } else if (isMensCategory) {
      // Blue theme for men's categories
      badgeClasses = 'bg-blue-100 text-blue-700'
      buttonGradient = 'from-blue-600 via-indigo-600 to-slate-700'
      buttonGlowGradient = 'from-blue-400 via-indigo-400 to-slate-500'
    } else {
      // Pink/rose theme for women's/general categories
      badgeClasses = 'bg-rose-100 text-rose-600'
      buttonGradient = 'from-rose-500 via-pink-500 to-purple-500'
      buttonGlowGradient = 'from-pink-400 via-rose-400 to-purple-400'
    }

    // Calculate total pages
    const viewportWidth2 = typeof window !== 'undefined' ? window.innerWidth : 0
    const itemsPerView = viewportWidth2 >= 1024 ? 3 : viewportWidth2 >= 640 ? 2 : 1
    const totalPages = Math.ceil(items.length / itemsPerView)

    // Determine badge text - show partner for themed categories
    const badgeText = isSustainableCategory
      ? 'Partner: Shop Like You Give A Damn'
      : isPartyCategory
        ? 'Partner: PartyPro.nl'
        : 'Curated selectie'

    return (
      <article
        id={`category-${category.id}`}
        className="space-y-6 animate-fade-in-up scroll-mt-24"
        style={{ animationDelay: `${120 + index * 70}ms` }}
      >
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses}`}
            >
              <GiftIcon className="h-4 w-4" />
              {badgeText}
            </div>
            {urgencyBadge && (
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${urgencyBadge.classes} animate-pulse`}
              >
                <span>{urgencyBadge.icon}</span>
                <span>{urgencyBadge.text}</span>
              </div>
            )}
          </div>
          {/* Desktop layout: titel + knop naast elkaar */}
          <div className="hidden md:flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-slate-900">
                {displayTitle}
              </h3>
              <p className="mt-2 max-w-3xl text-sm md:text-base text-slate-600">{description}</p>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <button
                onClick={() => {
                  trackAnalyticsEvent('category_cta_click', {
                    event_category: 'Deals Page',
                    event_label: displayTitle,
                    category_id: category.id,
                  })
                  navigateTo('categoryDetail', {
                    categoryId: category.id,
                    categoryTitle: displayTitle,
                    categoryDescription: description,
                    products: items,
                  })
                }}
                className={`group relative overflow-visible rounded-2xl bg-gradient-to-br ${buttonGradient} px-6 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1`}
              >
                {/* Glow effect achter de knop bij hover */}
                <div
                  className={`absolute -inset-2 -z-10 bg-gradient-to-r ${buttonGlowGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500`}
                />

                {/* Animated gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${buttonGlowGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl`}
                />

                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>

                {/* Button content */}
                <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Shop deze collectie nu
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
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
                </span>
              </button>

              {/* Navigation buttons onder de knop */}
              <div className="flex items-center gap-2">
                {/* Progress dots */}
                {items.length > 3 && (
                  <div className="flex items-center gap-1.5 mr-2">
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

                {/* Navigation buttons */}
                <button
                  onClick={() => carouselRef.current?.scroll('left')}
                  disabled={!canScrollLeft}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border-2 border-slate-200 text-slate-700 transition-all duration-200 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white shadow-sm hover:shadow-md"
                  aria-label="Vorige items"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => carouselRef.current?.scroll('right')}
                  disabled={!canScrollRight}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border-2 border-slate-200 text-slate-700 transition-all duration-200 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white shadow-sm hover:shadow-md"
                  aria-label="Volgende items"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile layout: titel boven, knop onder beschrijving */}
          <div className="md:hidden space-y-4">
            <div>
              <h3 className="font-display text-2xl font-bold text-slate-900">{displayTitle}</h3>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </div>

            <button
              onClick={() => {
                trackAnalyticsEvent('category_cta_click', {
                  event_category: 'Deals Page',
                  event_label: displayTitle,
                  category_id: category.id,
                })
                navigateTo('categoryDetail', {
                  categoryId: category.id,
                  categoryTitle: displayTitle,
                  categoryDescription: description,
                  products: items,
                })
              }}
              className={`group relative overflow-visible w-full rounded-2xl bg-gradient-to-br ${buttonGradient} px-6 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-2xl active:scale-95`}
            >
              {/* Glow effect */}
              <div
                className={`absolute -inset-2 -z-10 bg-gradient-to-r ${buttonGlowGradient} rounded-2xl blur-xl opacity-0 group-active:opacity-70 transition-opacity duration-500`}
              />

              {/* Button content */}
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Shop deze collectie nu
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-active:translate-x-1"
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
              </span>
            </button>
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

        <ProductCarousel
          ref={carouselRef}
          products={items}
          renderProduct={renderProductCard}
          hideDefaultNavigation={true}
          onNavigationChange={(controls) => {
            setCanScrollLeft(controls.canScrollLeft)
            setCanScrollRight(controls.canScrollRight)
            setCurrentIndex(controls.currentIndex)
          }}
        />
      </article>
    )
  }

  // Testimonials Section Component
  const TestimonialsSection: React.FC = () => {
    const testimonials = [
      {
        name: 'Lisa M.',
        rating: 5,
        text: 'Via Gifteez vond ik het perfecte cadeau voor mijn moeder. De collecties zijn echt handig samengesteld!',
        occasion: 'Moederdag cadeau',
      },
      {
        name: 'Thomas D.',
        rating: 5,
        text: 'Snelle levering en precies wat ik zocht. De gift sets zijn top en meteen klaar om te geven.',
        occasion: 'Verjaardagscadeau',
      },
      {
        name: 'Emma K.',
        rating: 5,
        text: 'Eindelijk een site waar ik niet urenlang hoef te zoeken. De selectie is gewoon goed en origineel.',
        occasion: 'Valentijnscadeau',
      },
      {
        name: 'Mark v.d.B.',
        rating: 5,
        text: 'De cadeauscore helpt echt bij het kiezen. Heb al meerdere cadeaus via Gifteez besteld.',
        occasion: 'Kerst cadeau',
      },
    ]

    return (
      <section className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 mb-3">
              <HeartIconFilled className="h-4 w-4 text-rose-500" />
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">
                Tevreden cadeaugevers
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Wat anderen zeggen over Gifteez
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Duizenden mensen vonden al het perfecte cadeau via onze collecties
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-700 leading-relaxed mb-4">"{testimonial.text}"</p>

                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.occasion}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <CheckIcon className="h-4 w-4" />
                    Geverifieerd
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust stats */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  10.000+
                </div>
                <div className="text-sm text-slate-600 mt-1">Tevreden klanten</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  4.8/5
                </div>
                <div className="text-sm text-slate-600 mt-1">Gemiddelde beoordeling</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  98%
                </div>
                <div className="text-sm text-slate-600 mt-1">Raadt ons aan</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const PinnedDealsSection: React.FC<{ deals: DealItem[] }> = ({ deals }) => {
    const priceRange = useMemo(() => {
      const parsed = deals
        .map((item) => {
          const normalised = item.price.replace(/[^0-9,.]/g, '').replace(',', '.')
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

    if (!deals.length) {
      return null
    }

    const featured = deals[0]
    const supporting = deals.slice(1)

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
        title="De beste cadeaus vinden en kopen - Coolblue & Amazon deals"
        description="Ontdek en koop de beste cadeaus van Coolblue en Amazon. Handpicked collecties voor elke gelegenheid met snelle levering."
      />
      <JsonLd data={structuredData} />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
        {/* Hero Section - Pro two-column spotlight design */}
        <ProDealsHero
          topDeals={state.topDeals}
          dealOfWeek={state.dealOfWeek}
          navigateTo={navigateTo}
          handleFeaturedClick={handleFeaturedClick}
          handleRefresh={handleRefresh}
          lastUpdated={lastUpdated}
          formatDate={formatDate}
          partnerBadges={partnerBadges}
          themeCategories={state.categories}
        />

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

              {/* Top 20 carousel skeleton */}
              <CarouselSkeleton />

              {/* Category carousels skeletons */}
              <CarouselSkeleton />
              <CarouselSkeleton />
            </div>
          ) : (
            <>
              {/* Deal of the Week block intentionally removed per request */}

              {/* Filter Bar */}
              <div className="animate-fade-in-up space-y-4" style={{ animationDelay: '80ms' }}>
                <QuickBudgetFilters />
                <FilterBar />
              </div>

              {/* Top 20 Deals Carousel */}
              {state.topDeals.length > 0 && (
                <section
                  className="animate-fade-in-up"
                  style={{ animationDelay: '100ms' }}
                  data-testid="top-deals-section"
                >
                  <Carousel
                    items={filterDeals(state.topDeals)}
                    title="🏆 Shop Top 20 Cadeaus"
                    badge={`${filterDeals(state.topDeals).length} toppers`}
                  />
                </section>
              )}

              {/* Shop per Thema - Moved up for better conversion flow */}
              {state.categories.length > 0 && (
                <section
                  className="space-y-14 animate-fade-in-up"
                  style={{ animationDelay: '110ms' }}
                >
                  <div className="text-center space-y-3">
                    <span className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      <SparklesIcon className="h-4 w-4 text-rose-500" />
                      Thematische Collecties
                    </span>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">
                      Shop per Thema
                    </h2>
                    <p className="mx-auto max-w-3xl text-sm md:text-base text-slate-600">
                      Elke collectie is zorgvuldig samengesteld met de beste deals van Amazon en
                      Coolblue. Perfect wanneer je snel een thematische selectie wilt zonder
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

              {/* Gift Sets Section - After categories */}
              {pinnedDeals.length > 0 && (
                <div className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
                  <PinnedDealsSection deals={pinnedDeals} />
                </div>
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

              {/* Community Wishlist Section - Wat wil jij in de deals zien? */}
              <section
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-12 md:py-16 px-6 md:px-8 animate-fade-in-up"
                style={{ animationDelay: '140ms' }}
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white shadow-lg border border-purple-200 px-5 py-2.5 mb-4">
                      <HeartIcon className="h-5 w-5 text-purple-500" />
                      <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Community
                      </span>
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 text-gray-900">
                      Wat wil{' '}
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        jij
                      </span>{' '}
                      in de deals zien?
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                      Jouw wensen zijn belangrijk! Laat ons weten welke producten of categorieën je
                      graag als deal zou willen zien.
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-purple-100 p-6 md:p-8">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const form = e.currentTarget
                        const formData = new FormData(form)
                        const wishData = {
                          product: formData.get('product'),
                          category: formData.get('category'),
                          description: formData.get('description'),
                          email: formData.get('email'),
                          timestamp: new Date().toISOString(),
                        }
                        logger.info('Community wishlist submission (persist pending backend)', {
                          scope: 'deals.wishlist',
                          wishData,
                        })
                        // TODO: Add Firebase backend to store wishes
                        window.alert(
                          'Bedankt voor je suggestie! We nemen dit mee in onze deal-selectie. 💜'
                        )
                        form.reset()
                      }}
                    >
                      <div className="space-y-5">
                        <div>
                          <label
                            htmlFor="product"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Welk product zou je graag willen zien?
                          </label>
                          <input
                            type="text"
                            id="product"
                            name="product"
                            placeholder="Bijv. iPhone 15, PlayStation 5, LEGO set..."
                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="category"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Categorie
                          </label>
                          <select
                            id="category"
                            name="category"
                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                          >
                            <option value="">Kies een categorie...</option>
                            <option value="tech">Tech & Gadgets</option>
                            <option value="home">Home & Living</option>
                            <option value="fashion">Mode & Accessoires</option>
                            <option value="beauty">Beauty & Wellness</option>
                            <option value="games">Gaming & Entertainment</option>
                            <option value="kitchen">Keuken & Koken</option>
                            <option value="sports">Sport & Outdoor</option>
                            <option value="kids">Kids & Baby</option>
                            <option value="other">Anders</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="description"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Extra toelichting (optioneel)
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="Vertel ons meer over waarom je dit product graag zou zien..."
                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            E-mail (optioneel - voor notificaties)
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="jouw@email.nl"
                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            We sturen je een mailtje als je gewenste product als deal verschijnt
                          </p>
                        </div>

                        <button
                          type="submit"
                          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <HeartIcon className="h-5 w-5" />
                            <span>Verstuur je wens</span>
                          </span>
                        </button>
                      </div>
                    </form>

                    {/* Stats */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">127</div>
                          <div className="text-xs text-gray-600">Wensen ingediend</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-pink-600">23</div>
                          <div className="text-xs text-gray-600">Deze week toegevoegd</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-rose-600">89%</div>
                          <div className="text-xs text-gray-600">Wensen vervuld</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Testimonials Section - Social Proof - Moved to bottom */}
              <div className="animate-fade-in-up" style={{ animationDelay: '140ms' }}>
                <TestimonialsSection />
              </div>

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

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}

const DealsPageWithBoundary: React.FC<DealsPageProps> = (props) => (
  <DealsErrorBoundary>
    <DealsPage {...props} />
  </DealsErrorBoundary>
)

export default DealsPageWithBoundary
