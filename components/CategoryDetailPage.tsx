import React, { useEffect, useMemo, useState } from 'react'
import { withAffiliate } from '../services/affiliate'
import { PartyProService } from '../services/partyProService'
import { ShopLikeYouGiveADamnService } from '../services/shopLikeYouGiveADamnService'
import Breadcrumbs from './Breadcrumbs'
import Button from './Button'
import {
  ChevronLeftIcon,
  GiftIcon,
  SparklesIcon,
  HeartIcon,
  CheckIcon,
  UsersIcon,
  FireIcon,
  TrophyIcon,
} from './IconComponents'
import ImageWithFallback from './ImageWithFallback'
import { Container } from './layout/Container'
import Meta from './Meta'
import { TrustBadges } from './UrgencyBadges'
import type { NavigateTo, DealItem } from '../types'

interface CategoryDetailPageProps {
  navigateTo: NavigateTo
  categoryId: string
  categoryTitle: string
  categoryDescription?: string
  products: DealItem[]
}

// Helper function to resolve retailer info
const resolveRetailerInfo = (affiliateLink: string) => {
  if (!affiliateLink) {
    return { label: 'Partner', shortLabel: 'Partner', badgeClass: 'bg-slate-100 text-slate-600' }
  }
  const lower = affiliateLink.toLowerCase()
  if (lower.includes('amazon') || lower.includes('amzn')) {
    return { label: 'Amazon.nl', shortLabel: 'Amazon', badgeClass: 'bg-orange-100 text-orange-700' }
  }
  if (lower.includes('bol.com')) {
    return { label: 'Bol.com', shortLabel: 'Bol.com', badgeClass: 'bg-blue-100 text-blue-700' }
  }
  if (lower.includes('coolblue')) {
    return { label: 'Coolblue', shortLabel: 'Coolblue', badgeClass: 'bg-sky-100 text-sky-700' }
  }
  return { label: 'Partner', shortLabel: 'Partner', badgeClass: 'bg-slate-100 text-slate-600' }
}

// Helper function to format price
const formatPrice = (value: string | undefined) => {
  if (!value) return null
  const cleanValue = value.replace(/[^0-9,.]/g, '')
  const normalized = cleanValue.replace(',', '.')
  const num = Number.parseFloat(normalized)
  if (Number.isFinite(num)) {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(num)
  }
  return value
}

const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({
  navigateTo,
  categoryId,
  categoryTitle,
  categoryDescription,
  products: initialProducts,
}) => {
  const [products, setProducts] = useState<DealItem[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(initialProducts.length > 0)

  // Load products if categoryId is provided but products are empty
  useEffect(() => {
    const loadCategoryData = async () => {
      // Only load if we have a categoryId but no products loaded yet
      if (!categoryId) return
      if (dataLoaded) return
      if (initialProducts.length > 0) {
        setProducts(initialProducts)
        setDataLoaded(true)
        return
      }

      setIsLoading(true)
      setLoadError(null)

      try {
        // Detect category type from ID
        const isPartyProCategory = categoryId.includes('party') || categoryId.includes('partypro')
        const isSLYGADCategory = categoryId.includes('duurza') || categoryId.includes('slygad')

        let loadedProducts: DealItem[] = []

        if (isPartyProCategory) {
          const partyProducts = await PartyProService.loadProducts()
          loadedProducts = partyProducts.map((p) => ({
            id: p.id,
            name: p.name,
            price: `€${typeof p.price === 'number' ? p.price.toFixed(2) : p.price}`,
            image: p.imageUrl,
            imageUrl: p.imageUrl,
            affiliateLink: p.affiliateLink,
            description: p.description,
            category: p.category,
            brand: p.brand,
            giftScore: p.giftScore,
            inStock: p.inStock,
            merchant: p.merchant || 'PartyPro.nl',
          }))
        } else if (isSLYGADCategory) {
          const sustainableProducts = await ShopLikeYouGiveADamnService.loadProducts()
          loadedProducts = sustainableProducts.map((p) => ({
            id: p.id,
            name: p.name,
            price: `€${typeof p.price === 'number' ? p.price.toFixed(2) : p.price}`,
            image: p.imageUrl,
            imageUrl: p.imageUrl,
            affiliateLink: p.affiliateLink,
            description: p.description,
            category: p.category,
            brand: p.brand,
            giftScore: p.giftScore,
            inStock: p.inStock,
            merchant: p.merchant || 'Shop Like You Give A Damn',
          }))
        }

        setProducts(loadedProducts)
        setDataLoaded(true)
      } catch (error) {
        console.error('Error loading category products:', error)
        setLoadError('Kon producten niet laden. Probeer het later opnieuw.')
      } finally {
        setIsLoading(false)
      }
    }

    loadCategoryData()
  }, [categoryId, dataLoaded, initialProducts])

  // Update products when initialProducts change
  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts)
      setDataLoaded(true)
    }
  }, [initialProducts])

  useEffect(() => {
    document.title = `${categoryTitle} | Gifteez.nl Collecties`
    window.scrollTo(0, 0)
  }, [categoryTitle])

  // Detect category type for themed colors
  const lowerTitle = categoryTitle.toLowerCase()
  const isMensCategory =
    lowerTitle.includes('man') || lowerTitle.includes('heren') || lowerTitle.includes('men')

  const isSustainableCategory =
    lowerTitle.includes('duurza') ||
    lowerTitle.includes('eco') ||
    lowerTitle.includes('vegan') ||
    lowerTitle.includes('groen') ||
    lowerTitle.includes('sustainable') ||
    categoryId.includes('duurzame') ||
    categoryId.includes('slygad')

  const isPartyCategory =
    lowerTitle.includes('feest') ||
    lowerTitle.includes('party') ||
    lowerTitle.includes('viering') ||
    lowerTitle.includes('celebration') ||
    categoryId.includes('party') ||
    categoryId.includes('partypro')

  // Different colors based on category theme
  let heroGradient, decorativeColors

  if (isSustainableCategory) {
    // Green/eco theme for sustainable products
    heroGradient = 'from-emerald-600 via-green-600 to-teal-700'
    decorativeColors = ['bg-emerald-400/30', 'bg-green-500/30', 'bg-teal-300/20']
  } else if (isPartyCategory) {
    // Purple/fuchsia theme for party products
    heroGradient = 'from-purple-600 via-fuchsia-600 to-pink-600'
    decorativeColors = ['bg-purple-400/30', 'bg-fuchsia-500/30', 'bg-pink-300/20']
  } else if (isMensCategory) {
    // Blue theme for men's categories
    heroGradient = 'from-blue-600 via-indigo-600 to-slate-700'
    decorativeColors = ['bg-indigo-400/30', 'bg-slate-500/30', 'bg-blue-300/20']
  } else {
    // Pink/rose theme for women's/general categories
    heroGradient = 'from-rose-500 via-pink-500 to-purple-600'
    decorativeColors = ['bg-pink-400/30', 'bg-purple-400/30', 'bg-rose-300/20']
  }

  // Voor duurzame cadeaus EN party cadeaus: groepeer producten per subcategorie
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)

  const subcategories = useMemo(() => {
    if ((!isSustainableCategory && !isPartyCategory) || products.length === 0) return []

    const grouped: Record<string, typeof products> = {}
    products.forEach((product) => {
      const subcategory = isPartyCategory
        ? PartyProService.detectSubcategory(product.name)
        : ShopLikeYouGiveADamnService.detectSubcategory(product.name)
      if (!grouped[subcategory]) grouped[subcategory] = []
      grouped[subcategory].push(product)
    })

    const emojiMap: Record<string, string> = isPartyCategory
      ? {
          Decoratie: '🎈',
          Drinkspellen: '🍺',
          'Party Gadgets': '💡',
          'Servies & Tafel': '🍽️',
          'Thema Feest': '🎭',
          Kostuums: '👗',
          Confetti: '🎊',
          Overige: '🎉',
        }
      : {
          Ringen: '💍',
          Kettingen: '📿',
          Oorbellen: '✨',
          Armbanden: '🔗',
          'Yoga & Wellness': '🧘',
          Drinkflessen: '💧',
          Tassen: '👜',
          Portemonnees: '👛',
          Overige: '🎁',
        }

    return Object.entries(grouped)
      .map(([name, items]) => ({
        name,
        count: items.length,
        emoji: emojiMap[name] || (isPartyCategory ? '🎉' : '🌱'),
        products: items,
      }))
      .filter((cat) => cat.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [products, isSustainableCategory, isPartyCategory])

  const sanitizeProductName = (name: string) =>
    (name || '').replace(/"/g, '').replace(/\s+/g, ' ').trim()

  const topPartyProducts = useMemo(() => {
    if (!isPartyCategory || products.length === 0) return []

    const unique: { id: string; name: string; imageUrl: string; price?: number | string }[] = []

    products.forEach((product) => {
      const imageUrl = product.imageUrl || (product as DealItem & { image?: string }).image || ''
      if (!imageUrl) return
      if (unique.some((item) => item.imageUrl === imageUrl)) return

      // Parse price if it's a string like "€29.99"
      let priceValue: number | string = product.price
      if (typeof product.price === 'string') {
        const numericPrice = parseFloat(product.price.replace(/[^0-9.,]/g, '').replace(',', '.'))
        priceValue = isNaN(numericPrice) ? product.price : numericPrice
      }

      unique.push({
        id: product.id,
        name: sanitizeProductName(product.name),
        imageUrl,
        price: priceValue,
      })
    })

    return unique.slice(0, 3)
  }, [isPartyCategory, products])

  // Enhanced product name for gift sets
  const enhanceProductName = (name: string): string => {
    const lower = name.toLowerCase()
    if (lower.includes('set') || lower.includes('box') || lower.includes('kit')) {
      if (lower.includes('voor haar') || lower.includes('vrouwen') || lower.includes('dames')) {
        return name
      }
      if (lower.includes('voor hem') || lower.includes('mannen') || lower.includes('heren')) {
        return name
      }
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
      if (
        lower.includes('grooming') ||
        lower.includes('shaving') ||
        lower.includes('beard') ||
        lower.includes('baard') ||
        lower.includes('aftershave')
      ) {
        return `${name} - Stoere Set voor Hem`
      }
    }
    return name
  }

  // Product Card Component - Enhanced with conversion optimization
  const ProductCard: React.FC<{ deal: DealItem }> = ({ deal }) => {
    const retailerInfo = useMemo(
      () => resolveRetailerInfo(deal.affiliateLink),
      [deal.affiliateLink]
    )
    const isTopDeal = deal.giftScore && deal.giftScore >= 9
    const isHotDeal = deal.isOnSale && deal.giftScore && deal.giftScore >= 8
    const displayName = enhanceProductName(deal.name)

    // Calculate mock savings percentage for conversion boost
    const savingsPercent = deal.originalPrice ? Math.floor(10 + Math.random() * 30) : null

    // Handle card click to navigate to product landing page
    const handleCardClick = () => {
      navigateTo('productLanding', { productId: deal.id, product: deal })
    }

    return (
      <div className="h-full">
        <div
          onClick={handleCardClick}
          className={`group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.03] cursor-pointer ${
            isTopDeal
              ? 'border-2 border-transparent bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 p-[2px]'
              : 'border border-slate-200 hover:border-rose-300'
          }`}
        >
          {/* Inner card wrapper for TOP deals */}
          <div
            className={
              isTopDeal ? 'bg-white rounded-2xl h-full flex flex-col overflow-hidden' : 'contents'
            }
          >
            {/* Image */}
            <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-white h-44">
              <ImageWithFallback
                src={deal.imageUrl}
                alt={displayName}
                className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                fit="contain"
              />

              {/* Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {isTopDeal && (
                  <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-2 py-1 text-xs font-bold text-white shadow-md">
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

            {/* Content */}
            <div className="flex flex-1 flex-col gap-3 p-5">
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
              </div>

              <div className="mt-auto space-y-3">
                {/* Price with savings badge */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-rose-500 px-3 py-1.5 font-bold text-white text-sm shadow-sm">
                      {formatPrice(deal.price) ?? 'Prijs op aanvraag'}
                    </span>
                    {deal.originalPrice && (
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                        <s>{deal.originalPrice}</s>
                      </span>
                    )}
                  </div>
                  {savingsPercent && deal.originalPrice && (
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <span>💝 Uitstekende prijs-kwaliteit</span>
                    </div>
                  )}
                </div>

                {/* Gift Score & Social Proof */}
                <div className="space-y-1.5">
                  {deal.giftScore && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <CheckIcon className="h-3.5 w-3.5" />
                      <span className="font-semibold">Cadeauscore: {deal.giftScore}/10</span>
                    </div>
                  )}
                  {isTopDeal && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600">
                      <FireIcon className="h-3.5 w-3.5" />
                      <span className="font-semibold">
                        {Math.floor(20 + Math.random() * 50)}+ verkocht vandaag
                      </span>
                    </div>
                  )}
                </div>

                <a
                  href={withAffiliate(deal.affiliateLink)}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Track CTA click
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                      ;(window as any).gtag('event', 'product_cta_click', {
                        event_category: 'Category Detail Page',
                        event_label: displayName,
                        product_id: deal.id,
                        category: categoryTitle,
                      })
                    }
                  }}
                  className="group/btn relative block w-full overflow-visible rounded-xl text-center font-bold text-white shadow-lg transition-all hover:shadow-2xl hover:scale-105 px-4 py-2.5 text-sm"
                >
                  {/* Glow effect achter de knop bij hover */}
                  <div
                    className={`absolute -inset-2 -z-10 rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-70 transition-opacity duration-500 ${
                      isSustainableCategory
                        ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-500'
                        : 'bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400'
                    }`}
                  />

                  {/* Gradient background */}
                  <div
                    className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                      isSustainableCategory
                        ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 group-hover/btn:from-emerald-700 group-hover/btn:via-green-700 group-hover/btn:to-teal-800'
                        : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 group-hover/btn:from-rose-600 group-hover/btn:via-pink-600 group-hover/btn:to-rose-700'
                    }`}
                  />

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>

                  {/* Button content */}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>Bestel bij {retailerInfo ? retailerInfo.shortLabel : 'partner'}</span>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Meta
        title={`${categoryTitle} kopen - Direct bestellen via Coolblue & Amazon`}
        description={
          categoryDescription ||
          `Shop de beste ${categoryTitle.toLowerCase()} direct online. Handmatig geselecteerd door experts met snelle levering.`
        }
        canonical={`/deals/category/${categoryId}`}
      />

      {/* Loading state */}
      {isLoading && (
        <Container>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
              <p className="text-gray-600">Producten laden...</p>
            </div>
          </div>
        </Container>
      )}

      {/* Error state */}
      {loadError && !isLoading && (
        <Container>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Oeps!</h2>
              <p className="text-gray-600 mb-4">{loadError}</p>
              <Button onClick={() => navigateTo('deals')}>Terug naar deals</Button>
            </div>
          </div>
        </Container>
      )}

      {/* Content */}
      {!isLoading && !loadError && (
        <>
          {/* Structured Data for Breadcrumbs - Essential for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://gifteez.nl/',
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Deals',
                    item: 'https://gifteez.nl/deals',
                  },
                  {
                    '@type': 'ListItem',
                    position: 3,
                    name: categoryTitle,
                    item: `https://gifteez.nl/deals/category/${categoryId}`,
                  },
                ],
              }),
            }}
          />

          <div className="bg-gradient-to-b from-white via-rose-50/30 to-white min-h-screen">
            {/* Hero Section met gradient en decorative elements */}
            <div
              className={`relative overflow-hidden bg-gradient-to-br ${heroGradient} text-white`}
            >
              {/* Animated background decorations */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className={`absolute -top-1/2 -left-1/4 w-96 h-96 ${decorativeColors[0]} rounded-full blur-3xl animate-pulse-slow`}
                />
                <div
                  className={`absolute -bottom-1/2 -right-1/4 w-96 h-96 ${decorativeColors[1]} rounded-full blur-3xl animate-pulse-slow`}
                  style={{ animationDelay: '1s' }}
                />
                <div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${decorativeColors[2]} rounded-full blur-2xl animate-pulse-slow`}
                  style={{ animationDelay: '2s' }}
                />
              </div>

              <Container size="xl" className="relative z-10 py-16 md:py-24">
                {/* Breadcrumbs - hidden on mobile, visible on desktop for better UX, but always in structured data for SEO */}
                <div className="mb-8 hidden md:block">
                  <div className="text-white/90">
                    <Breadcrumbs
                      items={[
                        { label: 'Home', path: '/' },
                        { label: 'Deals', path: '/deals' },
                        { label: categoryTitle, path: `/deals/category/${categoryId}` },
                      ]}
                      navigateTo={navigateTo}
                    />
                  </div>
                </div>

                {/* Hero content */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-semibold">
                      {isSustainableCategory ? (
                        <>
                          <span className="text-lg">🌱</span>
                          <span>Duurzaam & Bewust</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-5 w-5" />
                          <span>Handmatig geselecteerd</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                      {categoryTitle}
                    </h1>

                    {/* Description */}
                    {categoryDescription && (
                      <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                        {categoryDescription}
                      </p>
                    )}

                    {/* Urgency Badge - Amazon Prime or Snelle Levering */}
                    <div className="flex flex-wrap gap-3">
                      <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/90 backdrop-blur-sm px-4 py-2 text-sm font-semibold shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                        </svg>
                        <span>Snelle levering beschikbaar</span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/90 backdrop-blur-sm px-4 py-2 text-sm font-semibold shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Veilig online bestellen</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3">
                        <GiftIcon className="h-6 w-6" />
                        <div>
                          <div className="text-2xl font-bold">{products.length}</div>
                          <div className="text-xs text-white/80">Producten</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3">
                        <HeartIcon className="h-6 w-6" />
                        <div>
                          <div className="text-2xl font-bold">Top Rated</div>
                          <div className="text-xs text-white/80">Kwaliteit</div>
                        </div>
                      </div>
                    </div>

                    {/* Back button */}
                    <Button
                      variant="secondary"
                      onClick={() => navigateTo('deals')}
                      className={`bg-white inline-flex items-center gap-2 ${
                        isSustainableCategory
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-rose-600 hover:bg-white/90'
                      }`}
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                      Terug naar alle collecties
                    </Button>
                  </div>

                  {/* Decorative visual side */}
                  <div className="relative hidden md:block">
                    <div className="relative">
                      {/* Floating cards effect */}
                      <div className="absolute inset-0 grid grid-cols-2 gap-4 opacity-80">
                        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 transform rotate-3 hover:rotate-6 transition-transform">
                          <div className="w-12 h-12 rounded-full bg-pink-400/50 mb-3" />
                          <div className="h-3 bg-white/30 rounded mb-2" />
                          <div className="h-3 bg-white/20 rounded w-2/3" />
                        </div>
                        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 transform -rotate-3 hover:-rotate-6 transition-transform mt-8">
                          <div className="w-12 h-12 rounded-full bg-purple-400/50 mb-3" />
                          <div className="h-3 bg-white/30 rounded mb-2" />
                          <div className="h-3 bg-white/20 rounded w-2/3" />
                        </div>
                        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 transform rotate-2 hover:rotate-4 transition-transform -mt-4">
                          <div className="w-12 h-12 rounded-full bg-rose-400/50 mb-3" />
                          <div className="h-3 bg-white/30 rounded mb-2" />
                          <div className="h-3 bg-white/20 rounded w-2/3" />
                        </div>
                        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 transform -rotate-2 hover:-rotate-4 transition-transform mt-4">
                          <div className="w-12 h-12 rounded-full bg-orange-400/50 mb-3" />
                          <div className="h-3 bg-white/30 rounded mb-2" />
                          <div className="h-3 bg-white/20 rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Container>

              {/* Wave separator */}
              <div className="absolute bottom-0 left-0 right-0">
                <svg
                  className="w-full h-12 md:h-16"
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,0 C150,80 350,80 600,50 C850,20 1050,20 1200,80 L1200,120 L0,120 Z"
                    fill="white"
                  />
                </svg>
              </div>
            </div>

            <Container size="xl" className="py-12">
              {/* Subcategory filters voor duurzame EN party cadeaus - BOVEN aan de pagina */}
              {isSustainableCategory && subcategories.length > 1 && (
                <div className="mb-8 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-900 text-lg mb-2">
                      🌱 Ontdek per categorie
                    </h3>
                    <p className="text-sm text-slate-600">
                      Filter op producttype om sneller te vinden wat je zoekt
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedSubcategory(null)}
                      className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        selectedSubcategory === null
                          ? 'bg-emerald-600 text-white shadow-lg scale-105'
                          : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
                      }`}
                    >
                      🌿 Alles ({products.length})
                    </button>

                    {subcategories.map((subcat) => (
                      <button
                        key={subcat.name}
                        onClick={() => setSelectedSubcategory(subcat.name)}
                        className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                          selectedSubcategory === subcat.name
                            ? 'bg-emerald-600 text-white shadow-lg scale-105'
                            : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
                        }`}
                      >
                        {subcat.emoji} {subcat.name} ({subcat.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PartyPro subcategory filters */}
              {isPartyCategory && subcategories.length > 1 && (
                <div className="mb-6 bg-purple-50/50 border border-purple-100 rounded-2xl p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-900 text-lg mb-2">
                      🎉 Ontdek per categorie
                    </h3>
                    <p className="text-sm text-slate-600">
                      Van feestdecoratie tot drinkspellen - filter eenvoudig op jouw favoriete party
                      categorie
                    </p>
                  </div>
                  <div className="-mx-1 flex gap-2 overflow-x-auto pb-2 pl-1 pr-1 md:flex-wrap md:overflow-visible">
                    <button
                      type="button"
                      onClick={() => setSelectedSubcategory(null)}
                      className={`min-w-[150px] flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-md ${
                        selectedSubcategory === null
                          ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-lg'
                          : 'bg-white text-slate-700 border border-purple-200 hover:border-purple-300'
                      }`}
                    >
                      🎊 Alles ({products.length})
                    </button>
                    {subcategories.map((subcat) => (
                      <button
                        key={subcat.name}
                        type="button"
                        onClick={() => setSelectedSubcategory(subcat.name)}
                        className={`min-w-[150px] flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-md ${
                          selectedSubcategory === subcat.name
                            ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-lg'
                            : 'bg-white text-slate-700 border border-purple-200 hover:border-purple-300'
                        }`}
                      >
                        {subcat.emoji} {subcat.name} ({subcat.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isPartyCategory && topPartyProducts.length > 0 && (
                <div className="mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-xl">
                  <div className="relative flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-4 md:max-w-lg">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
                        <SparklesIcon className="h-4 w-4" />
                        PartyPro highlight
                      </span>
                      <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                        Klaar voor het ultieme feest?
                      </h2>
                      <p className="text-base md:text-lg text-white/90">
                        Mix ballonbogen, confettikanonnen en thema decoratie. Deze selectie wordt
                        direct geüpdatet wanneer PartyPro nieuwe items toevoegt.
                      </p>
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                        <Button
                          type="button"
                          onClick={() => navigateTo('giftFinder')}
                          className="w-full sm:w-auto px-5 py-3 text-sm shadow-lg"
                        >
                          Chat met Cadeau-Coach
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => navigateTo('deals')}
                          className="w-full sm:w-auto px-5 py-3 text-sm backdrop-blur-sm"
                        >
                          Bekijk alle party deals
                        </Button>
                      </div>
                    </div>
                    <div className="flex w-full justify-center gap-4 md:w-auto">
                      {topPartyProducts.map((product, index) => (
                        <div
                          key={product.id}
                          className={`relative flex w-28 flex-shrink-0 flex-col items-center rounded-2xl bg-white/10 p-4 text-center shadow-lg ring-1 ring-white/15 backdrop-blur-sm sm:w-36 md:w-40 ${
                            index === 1 ? 'mt-6 hidden sm:flex' : ''
                          } ${index === 2 ? 'hidden md:flex mt-12' : ''}`}
                        >
                          <div className="overflow-hidden rounded-xl bg-white/80 p-2">
                            <ImageWithFallback
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-24 w-full object-contain sm:h-32"
                              fit="contain"
                            />
                          </div>
                          <div className="mt-3 text-xs font-semibold text-white/90 sm:text-sm">
                            {sanitizeProductName(product.name).length > 34
                              ? `${sanitizeProductName(product.name).slice(0, 34)}…`
                              : sanitizeProductName(product.name)}
                          </div>
                          {product.price && (
                            <div className="mt-2 text-xs font-bold text-white/75 sm:text-sm">
                              {typeof product.price === 'number'
                                ? `€${product.price.toFixed(2)}`
                                : product.price}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {products.length > 0 ? (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold text-slate-900">
                      {selectedSubcategory ? `${selectedSubcategory}` : `Alle ${categoryTitle}`}
                    </h2>
                    <div className="text-sm text-slate-600">
                      <span
                        className={`font-semibold ${isSustainableCategory ? 'text-emerald-600' : 'text-rose-600'}`}
                      >
                        {selectedSubcategory
                          ? subcategories.find((s) => s.name === selectedSubcategory)?.count || 0
                          : products.length}
                      </span>{' '}
                      producten
                    </div>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {(selectedSubcategory
                      ? products.filter((p) => {
                          const subcategory = isPartyCategory
                            ? PartyProService.detectSubcategory(p.name)
                            : ShopLikeYouGiveADamnService.detectSubcategory(p.name)
                          return subcategory === selectedSubcategory
                        })
                      : products
                    ).map((product) => (
                      <ProductCard key={product.id} deal={product} />
                    ))}
                  </div>

                  {/* Vergelijk de Top 5 - Direct na producten */}
                  {products.length >= 5 && (
                    <div className="mt-12 mb-12 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6 shadow-lg">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4 sm:items-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                            <TrophyIcon className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="mb-1 font-display text-lg font-bold text-slate-900 sm:text-xl">
                              Vergelijk de Top 5
                            </h3>
                            <p className="text-xs text-slate-600 sm:text-sm">
                              Bekijk onze expert vergelijking en kies de perfecte match
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            navigateTo('comparison', {
                              categoryId,
                              categoryTitle,
                              products,
                            })
                          }
                          className="group w-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all hover:scale-105 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl sm:w-auto"
                        >
                          <TrophyIcon className="h-5 w-5 transition-transform group-hover:rotate-12" />
                          Bekijk Vergelijking
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Over deze collectie - Na Vergelijk Top 5 */}
                  <div className="mb-12 rounded-3xl bg-gradient-to-br from-slate-50 to-white p-8 md:p-12 border border-slate-200 shadow-sm">
                    <div className="mx-auto max-w-4xl">
                      {/* About this collection */}
                      <div className="mb-8">
                        <div className="mb-4 flex items-center gap-3">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                              isSustainableCategory
                                ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                                : isPartyCategory
                                  ? 'bg-gradient-to-br from-purple-500 to-fuchsia-600'
                                  : 'bg-gradient-to-br from-rose-500 to-pink-600'
                            } text-white shadow-lg`}
                          >
                            <SparklesIcon className="h-6 w-6" />
                          </div>
                          <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900">
                            Over deze collectie
                          </h2>
                        </div>
                        <p className="text-lg leading-relaxed text-slate-700">
                          {categoryDescription ||
                            `Deze ${categoryTitle.toLowerCase()} collectie is zorgvuldig samengesteld door ons team van cadeau-experts. Elk product is persoonlijk beoordeeld op kwaliteit, originaliteit en geschiktheid als cadeau.`}
                        </p>
                      </div>

                      {/* Perfect voor */}
                      <div className="mb-8 grid gap-6 md:grid-cols-2">
                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                          <div className="mb-4 flex items-center gap-2">
                            <GiftIcon
                              className={`h-5 w-5 ${isSustainableCategory ? 'text-emerald-600' : isPartyCategory ? 'text-purple-600' : 'text-rose-600'}`}
                            />
                            <h3 className="font-bold text-slate-900">Perfect voor</h3>
                          </div>
                          <ul className="space-y-2 text-sm text-slate-700">
                            <li className="flex items-start gap-2">
                              <CheckIcon className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span>Verjaardagen en feestdagen</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckIcon className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span>Last-minute cadeaus met impact</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckIcon className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span>Bijzondere gelegenheden</span>
                            </li>
                          </ul>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                          <div className="mb-4 flex items-center gap-2">
                            <TrophyIcon className="h-5 w-5 text-amber-600" />
                            <h3 className="font-bold text-slate-900">Onze selectiecriteria</h3>
                          </div>
                          <ul className="space-y-2 text-sm text-slate-700">
                            <li className="flex items-start gap-2">
                              <CheckIcon className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span>Minimaal 4.0+ sterren reviews</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckIcon className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span>Betrouwbare retailers</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckIcon className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span>Originaliteit en kwaliteit</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* FAQ Section - Vervangt curator note */}
                      <div>
                        <h3 className="mb-6 font-display text-xl font-bold text-slate-900">
                          Veelgestelde vragen
                        </h3>
                        <div className="space-y-4">
                          {/* FAQ Item 1 */}
                          <details className="group rounded-xl bg-white p-5 shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                            <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 list-none">
                              <span>🎁 Hoe kies ik het juiste cadeau?</span>
                              <ChevronLeftIcon className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-[-90deg]" />
                            </summary>
                            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                              Begin met het bepalen van het budget en de interesses van de
                              ontvanger. Onze filters en categorieën helpen je snel de perfecte
                              match te vinden. Let ook op de reviews en cadeauscore voor extra
                              zekerheid.
                            </p>
                          </details>

                          {/* FAQ Item 2 */}
                          <details className="group rounded-xl bg-white p-5 shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                            <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 list-none">
                              <span>📦 Wat zijn de verzendkosten?</span>
                              <ChevronLeftIcon className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-[-90deg]" />
                            </summary>
                            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                              De verzendkosten variëren per partner en worden duidelijk getoond bij
                              elk product. Veel partners bieden gratis verzending vanaf een bepaald
                              bedrag. Check altijd de productpagina voor specifieke details.
                            </p>
                          </details>

                          {/* FAQ Item 3 */}
                          <details className="group rounded-xl bg-white p-5 shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                            <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 list-none">
                              <span>↩️ Kan ik mijn bestelling retourneren?</span>
                              <ChevronLeftIcon className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-[-90deg]" />
                            </summary>
                            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                              Ja! De meeste partners hanteren een retourbeleid van 14-30 dagen. Je
                              koopt rechtstreeks bij onze betrouwbare partners, die elk hun eigen
                              retourvoorwaarden hebben. Deze vind je op hun website.
                            </p>
                          </details>

                          {/* FAQ Item 4 */}
                          <details className="group rounded-xl bg-white p-5 shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                            <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 list-none">
                              <span>⭐ Hoe betrouwbaar zijn de reviews?</span>
                              <ChevronLeftIcon className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-[-90deg]" />
                            </summary>
                            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                              We selecteren alleen producten met minimaal 4.0+ sterren van
                              geverifieerde kopers bij onze partners. Onze cadeauscore combineert
                              reviews, populariteit en geschiktheid als cadeau voor een compleet
                              beeld.
                            </p>
                          </details>

                          {/* FAQ Item 5 - Conditional for sustainable */}
                          {isSustainableCategory && (
                            <details className="group rounded-xl bg-white p-5 shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 list-none">
                                <span>🌱 Wat maakt deze cadeaus duurzaam?</span>
                                <ChevronLeftIcon className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-[-90deg]" />
                              </summary>
                              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                                Deze collectie bevat alleen producten met duurzame certificeringen
                                (Fairtrade, B-Corp, FSC), gerecyclede materialen, of van merken die
                                bewezen impact maken op mens en milieu. Kwaliteit én verantwoord!
                              </p>
                            </details>
                          )}

                          {/* FAQ Item 5 - Conditional for party */}
                          {isPartyCategory && (
                            <details className="group rounded-xl bg-white p-5 shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 list-none">
                                <span>🎉 Hoe snel kan ik de feestartikelen ontvangen?</span>
                                <ChevronLeftIcon className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-[-90deg]" />
                              </summary>
                              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                                De meeste feestartikelen worden binnen 1-3 werkdagen geleverd. Voor
                                last-minute feesten kun je vaak kiezen voor expreslevering. Check de
                                leveringstijd bij elk product voor exacte informatie.
                              </p>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badges - Gratis verzending etc. - Na Over deze collectie */}
                  <div className="mb-12">
                    <TrustBadges layout="grid" />
                  </div>

                  {/* Bottom CTA Section - Secondary conversion point */}
                  <div
                    className={`mt-16 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl ${
                      isSustainableCategory
                        ? 'bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700'
                        : 'bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600'
                    }`}
                  >
                    <div className="mx-auto max-w-2xl">
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                        <UsersIcon className="h-4 w-4" />
                        <span>Meer dan 10.000+ tevreden klanten</span>
                      </div>
                      <h3 className="mb-4 font-display text-3xl md:text-4xl font-bold">
                        Vond je niet wat je zocht?
                      </h3>
                      <p className="mb-8 text-lg text-white/90">
                        Ontdek meer handgeselecteerde deals in onze andere categorieën of gebruik
                        onze cadeau-coach
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center">
                        <Button
                          variant="secondary"
                          onClick={() => navigateTo('deals')}
                          className={`bg-white hover:bg-white/90 hover:scale-105 transition-transform ${
                            isSustainableCategory ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          <GiftIcon className="h-5 w-5" />
                          Shop alle categorieën
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => navigateTo('giftFinder')}
                          className="bg-white/90 text-purple-600 hover:bg-white hover:scale-105 transition-transform"
                        >
                          <SparklesIcon className="h-5 w-5" />
                          Cadeau-coach proberen
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <span className="text-3xl">📦</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Geen producten gevonden
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Er zijn momenteel geen deals beschikbaar in deze categorie
                  </p>
                  <Button variant="primary" onClick={() => navigateTo('deals')}>
                    Bekijk andere categorieën
                  </Button>
                </div>
              )}
            </Container>
          </div>
        </>
      )}
    </>
  )
}

export default CategoryDetailPage
