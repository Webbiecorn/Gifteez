import React, { useCallback, useEffect, useMemo, useState, useRef, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { withAffiliate } from '../services/affiliate'
import CoolblueAffiliateService from '../services/coolblueAffiliateService'
import CoolblueFeedService from '../services/coolblueFeedService'
import { DealCategoryConfigService } from '../services/dealCategoryConfigService'
import { DynamicProductService } from '../services/dynamicProductService'
import { PerformanceInsightsService } from '../services/performanceInsightsService'
import { PinnedDealsService } from '../services/pinnedDealsService'
import { ShopLikeYouGiveADamnService } from '../services/shopLikeYouGiveADamnService'
/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import { PartyProService } from '../services/partyProService'
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
import type { NavigateTo, DealCategory, DealItem, Gift } from '../types'

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

  // Quick budget filter handler
  const handleQuickBudgetFilter = useCallback((budgetRange: string) => {
    setPriceFilter(budgetRange)
    // Track budget filter click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'budget_filter_click', {
        event_category: 'Deals Page',
        event_label: budgetRange,
        value: budgetRange,
      })
    }
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

      try {
        // Always force refresh on first load to ensure fresh data
        const shouldForceRefresh =
          forceRefresh || !sessionStorage.getItem('deals_loaded_this_session')

        if (shouldForceRefresh) {
          // Only invalidate caches when explicitly requested to avoid unnecessary cold starts
          CoolblueFeedService.clearCache()
          DealCategoryConfigService.clearCache()
          console.warn('🔄 Forcing fresh data load...')
          sessionStorage.setItem('deals_loaded_this_session', 'true')
        }

        const [dealOfWeek, topDeals, categories, config, pinnedEntries, sustainableProducts, partyProducts] = await Promise.all([
          DynamicProductService.getDealOfTheWeek(),
          DynamicProductService.getTop10Deals(),
          DynamicProductService.getDealCategories(),
          DealCategoryConfigService.load(),
          PinnedDealsService.load(),
          ShopLikeYouGiveADamnService.loadProducts(),
          PartyProService.loadProducts(),
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

        // Voeg Duurzame Cadeaus categorie toe als er producten zijn
        if (sustainableProducts && sustainableProducts.length > 0) {
          // Groepeer producten per subcategorie voor variatie
          const grouped: Record<string, typeof sustainableProducts> = {}
          sustainableProducts.forEach(product => {
            // Gebruik de detectSubcategory functie
            const name = product.name.toLowerCase()
            let subcategory = 'Overige'
            
            if (name.includes('ring')) subcategory = 'Ringen'
            else if (name.includes('ketting') || name.includes('necklace')) subcategory = 'Kettingen'
            else if (name.includes('oorbel') || name.includes('earring')) subcategory = 'Oorbellen'
            else if (name.includes('armband') || name.includes('bracelet')) subcategory = 'Armbanden'
            else if (name.includes('yoga') || name.includes('peshtemal')) subcategory = 'Yoga & Wellness'
            else if (name.includes('waterfles') || name.includes('bottle')) subcategory = 'Drinkflessen'
            else if (name.includes('tas') || name.includes('bag')) subcategory = 'Tassen'
            else if (name.includes('portemonnee') || name.includes('wallet')) subcategory = 'Portemonnees'
            
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
            categories.forEach(category => {
              if (added >= 20) return
              const categoryProducts = grouped[category]
              if (categoryProducts && categoryProducts.length > round) {
                variedProducts.push(categoryProducts[round])
                added++
              }
            })
            round++
          }
          
          const sustainableDeals = variedProducts.slice(0, 20).map(product => ({
            id: product.id,
            name: product.name,
            price: `€${product.price.toFixed(2)}`,
            originalPrice: product.originalPrice ? `€${product.originalPrice.toFixed(2)}` : undefined,
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
            description: '🌿 Bewuste en ecologische geschenken van Shop Like You Give A Damn. Gevarieerde selectie van 20 duurzame producten - van yoga items tot vegan sieraden. Perfect voor mensen die van de aarde houden.',
            items: sustainableDeals,
          }

          categoriesToDisplay.push(sustainableCategory)
          console.log(`🌱 Added Duurzame Cadeaus category with ${sustainableDeals.length} varied products from ${categories.length} subcategories`)
        }

        // Voeg PartyPro Feest & Party Cadeaus categorie toe
        if (partyProducts && partyProducts.length > 0) {
          // Groepeer producten per subcategorie voor variatie
          const grouped: Record<string, typeof partyProducts> = {}
          partyProducts.forEach(product => {
            const name = product.name.toLowerCase()
            let subcategory = 'Overige'
            
            if (name.includes('ballon') || name.includes('slingers') || name.includes('decoratie')) subcategory = 'Decoratie'
            else if (name.includes('drinkspel') || name.includes('beer pong') || name.includes('spel')) subcategory = 'Drinkspellen'
            else if (name.includes('licht') || name.includes('led') || name.includes('gadget')) subcategory = 'Party Gadgets'
            else if (name.includes('bord') || name.includes('beker') || name.includes('servies')) subcategory = 'Servies & Tafel'
            else if (name.includes('thema') || name.includes('theme')) subcategory = 'Thema Feest'
            else if (name.includes('kostuum') || name.includes('masker') || name.includes('hoed')) subcategory = 'Kostuums'
            else if (name.includes('confetti') || name.includes('serpentine')) subcategory = 'Confetti'
            
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
            partyCategories.forEach(category => {
              if (added >= 20) return
              const categoryProducts = grouped[category]
              if (categoryProducts && categoryProducts.length > round) {
                variedProducts.push(categoryProducts[round])
                added++
              }
            })
            round++
          }
          
          const partyDeals = variedProducts.slice(0, 20).map(product => ({
            id: product.id,
            name: product.name,
            price: `€${product.price.toFixed(2)}`,
            originalPrice: product.originalPrice ? `€${product.originalPrice.toFixed(2)}` : undefined,
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
            description: '🎉 Maak elk feest onvergetelijk met PartyPro.nl! Van decoratie en drinkspellen tot party gadgets en kostuums. Gevarieerde selectie van 20 feestelijke producten voor elke gelegenheid.',
            items: partyDeals,
          }

          categoriesToDisplay.push(partyCategory)
          console.log(`🎉 Added Feest & Party category with ${partyDeals.length} varied products from ${partyCategories.length} subcategories`)
        }

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
    if (premiumDeals.length <= 1) {
      return
    }

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
            if (option.value === '0-25') filterValue = '0-50' // Map to existing 0-50
            else if (option.value === '25-50') filterValue = '0-50' // Map to existing 0-50
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

    const itemsPerView =
      typeof window !== 'undefined' && window.innerWidth >= 1024
        ? 3
        : window.innerWidth >= 640
          ? 2
          : 1
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
    const favoritePulseTimeoutRef = useRef<number | null>(null)

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

    // Convert DealItem to Gift format for favorites
    const dealAsGift = useMemo(
      () => ({
        productName: deal.name,
        description: deal.description || '',
        imageUrl: deal.imageUrl,
        affiliateLink: deal.affiliateLink,
        price: formatPrice(deal.price) || '',
        occasion: '',
        recipientType: '',
        interests: [],
        ageRange: '',
        priceRange: formatPrice(deal.price) || '',
        relationship: '',
      }),
      [deal]
    )

    // Check favorite status
    useEffect(() => {
      if (auth?.currentUser) {
        setIsFavorite(auth.isFavorite(dealAsGift))
      } else {
        try {
          const favorites: Gift[] = JSON.parse(localStorage.getItem('gifteezFavorites') || '[]')
          setIsFavorite(favorites.some((fav: Gift) => fav.productName === deal.name))
        } catch (e) {
          console.error('Failed to parse guest favorites from localStorage', e)
        }
      }
    }, [deal.name, auth, dealAsGift])

    // Cleanup timeout on unmount
    useEffect(
      () => () => {
        if (favoritePulseTimeoutRef.current) {
          clearTimeout(favoritePulseTimeoutRef.current)
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
        } catch (e) {
          console.error('Failed to update guest favorites in localStorage', e)
          return
        }
      }

      setIsFavorite(isNowFavorite)
      if (isNowFavorite) {
        if (favoritePulseTimeoutRef.current) {
          clearTimeout(favoritePulseTimeoutRef.current)
        }
        setFavoritePulse(true)
        favoritePulseTimeoutRef.current = setTimeout(() => {
          setFavoritePulse(false)
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
      <div ref={cardRef} className="h-full">
        <div
          onClick={handleClick}
          className={`group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer ${
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
                fallbackSrc={(deal as any).awinImageUrl || (deal as any).merchantImageUrl}
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
                  href={withAffiliate(deal.affiliateLink)}
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
                  <SocialShare
                    item={
                      {
                        productName: deal.name,
                        description: deal.description || `Toppertje: ${deal.name} nu met korting!`,
                        imageUrl: deal.imageUrl,
                      } as any
                    }
                    type="gift"
                    variant="compact"
                  />
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
    const carouselRef = useRef<{ scroll: () => void }>(null)

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

    const renderProductCard = useCallback(
      (deal: DealItem, dealIndex: number) => (
        <DealCard key={deal.id} deal={deal} index={dealIndex} variant="grid" />
      ),
      []
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
    const itemsPerView =
      typeof window !== 'undefined' && window.innerWidth >= 1024
        ? 3
        : window.innerWidth >= 640
          ? 2
          : 1
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
                  // Track category CTA click
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    ;(window as any).gtag('event', 'category_cta_click', {
                      event_category: 'Deals Page',
                      event_label: displayTitle,
                      category_id: category.id,
                    })
                  }
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
                // Track category CTA click
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  ;(window as any).gtag('event', 'category_cta_click', {
                    event_category: 'Deals Page',
                    event_label: displayTitle,
                    category_id: category.id,
                  })
                }
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
                <span className="block text-gray-900 mb-2">Shop de beste cadeaus</span>
                <span className="block bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  voor elke gelegenheid
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
                Ontdek zorgvuldig geselecteerde cadeaus van Coolblue en Amazon,
                <span className="font-semibold text-rose-600"> direct te bestellen met snelle levering</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8 animate-fade-in-up">
                <button
                  onClick={() => navigateTo('giftFinder')}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-rose-300"
                >
                  <GiftIcon className="h-6 w-6" />
                  <span>Shop je perfect cadeau nu</span>
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
                    <span>Bestel deze topper direct</span>
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
                  <span>Vernieuw collectie</span>
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
                  <span className="font-medium">Zorgvuldig samengesteld</span>
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
                  <span className="font-medium">Kwaliteit voorop</span>
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
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                            <StarIcon className="h-4 w-4" />
                            In de spotlight
                          </div>
                          {featuredRetailer && (
                            <div
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${featuredRetailer.badgeClass}`}
                            >
                              {featuredRetailer.label}
                            </div>
                          )}
                          {/* Add Amazon Prime badge if applicable */}
                          {featuredRetailer?.shortLabel.includes('Amazon') && (
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                              <span>📦</span>
                              <span>Prime levering</span>
                            </div>
                          )}
                        </div>

                        <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">
                          {state.dealOfWeek.name}
                        </h2>

                        {/* Add "Waarom dit cadeau?" USP bullets */}
                        {state.dealOfWeek.giftScore && state.dealOfWeek.giftScore >= 8 && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <h3 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                              <CheckIcon className="h-4 w-4" />
                              Waarom dit cadeau?
                            </h3>
                            <ul className="space-y-1.5 text-sm text-emerald-800">
                              <li className="flex items-start gap-2">
                                <span className="text-emerald-600">✓</span>
                                <span>Hoge cadeauscore ({state.dealOfWeek.giftScore}/10)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-emerald-600">✓</span>
                                <span>
                                  {featuredRetailer?.shortLabel.includes('Amazon')
                                    ? 'Snelle levering via Amazon Prime'
                                    : 'Snelle levering beschikbaar'}
                                </span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-emerald-600">✓</span>
                                <span>Direct te bestellen en klaar om te geven</span>
                              </li>
                              {state.dealOfWeek.isOnSale && (
                                <li className="flex items-start gap-2">
                                  <span className="text-emerald-600">✓</span>
                                  <span className="font-semibold">Nu met korting ⚡</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

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
                            className="group relative inline-flex items-center gap-2 rounded-xl px-10 py-4 text-lg font-bold text-white shadow-xl transition-all hover:shadow-2xl hover:scale-105 overflow-hidden"
                          >
                            {/* Enhanced gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 transition-all duration-300 group-hover:from-rose-600 group-hover:via-pink-600 group-hover:to-rose-700"></div>

                            {/* Shimmer effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                            </div>

                            {/* Button content */}
                            <span className="relative z-10 flex items-center gap-2">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              Bestel nu bij {featuredRetailer ? featuredRetailer.shortLabel : 'partner'}
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
                            </span>
                          </a>
                          {premiumDeals.length > 1 && (
                            <Button variant="secondary" className="bg-white" onClick={showNextDeal}>
                              Toon ander cadeau ({dealOfWeekIndex + 1}/{premiumDeals.length})
                            </Button>
                          )}
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="font-medium">Veilig bestellen</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg
                              className="w-5 h-5 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                            </svg>
                            <span className="font-medium">Snelle levering</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg
                              className="w-5 h-5 text-purple-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="font-medium">Perfect cadeau</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Filter Bar */}
              <div className="animate-fade-in-up space-y-4" style={{ animationDelay: '80ms' }}>
                <QuickBudgetFilters />
                <FilterBar />
              </div>

              {/* Top 10 Deals Carousel */}
              {state.topDeals.length > 0 && (
                <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <Carousel
                    items={filterDeals(state.topDeals)}
                    title="🏆 Shop Top 10 Cadeaus"
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
                      Elke collectie is zorgvuldig samengesteld met de beste deals van Amazon en Coolblue. 
                      Perfect wanneer je snel een thematische selectie wilt zonder eindeloos zoeken.
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
                        console.warn(
                          'Community wishlist submission (TODO: add Firebase backend):',
                          wishData
                        )
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

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}

export default DealsPage
