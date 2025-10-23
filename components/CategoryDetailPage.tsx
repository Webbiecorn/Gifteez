import React, { useEffect, useMemo } from 'react'
import { withAffiliate } from '../services/affiliate'
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
} from './IconComponents'
import ImageWithFallback from './ImageWithFallback'
import { Container } from './layout/Container'
import Meta from './Meta'
import { TrustBadges, SocialProofBadge } from './UrgencyBadges'
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
  products,
}) => {
  useEffect(() => {
    document.title = `${categoryTitle} | Gifteez.nl Deals`
    window.scrollTo(0, 0)
  }, [categoryTitle])

  // Detect if this is a men's category
  const lowerTitle = categoryTitle.toLowerCase()
  const isMensCategory =
    lowerTitle.includes('man') || lowerTitle.includes('heren') || lowerTitle.includes('men')

  // Different colors for men vs women categories
  const heroGradient = isMensCategory
    ? 'from-blue-600 via-indigo-600 to-slate-700'
    : 'from-rose-500 via-pink-500 to-purple-600'

  const decorativeColors = isMensCategory
    ? ['bg-indigo-400/30', 'bg-slate-500/30', 'bg-blue-300/20']
    : ['bg-pink-400/30', 'bg-purple-400/30', 'bg-rose-300/20']

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
                      <span>🎉 Bespaar {savingsPercent}%</span>
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
                  onClick={(e) => e.stopPropagation()}
                  className="group/btn relative block w-full overflow-visible rounded-xl text-center font-bold text-white shadow-lg transition-all hover:shadow-2xl hover:scale-105 px-4 py-2.5 text-sm"
                >
                  {/* Glow effect achter de knop bij hover */}
                  <div className="absolute -inset-2 -z-10 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-70 transition-opacity duration-500" />

                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-xl transition-all duration-300 group-hover/btn:from-rose-600 group-hover/btn:via-pink-600 group-hover/btn:to-rose-700" />

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
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
        title={`${categoryTitle} - Beste Deals & Aanbiedingen`}
        description={
          categoryDescription ||
          `Ontdek de beste deals voor ${categoryTitle}. Handmatig geselecteerd door onze experts.`
        }
        canonical={`/deals/category/${categoryId}`}
      />

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
        <div className={`relative overflow-hidden bg-gradient-to-br ${heroGradient} text-white`}>
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
                  <SparklesIcon className="h-5 w-5" />
                  <span>Handmatig geselecteerd</span>
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
                  className="bg-white text-rose-600 hover:bg-white/90 inline-flex items-center gap-2"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Terug naar alle deals
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
            <svg className="w-full h-12 md:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M0,0 C150,80 350,80 600,50 C850,20 1050,20 1200,80 L1200,120 L0,120 Z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        <Container size="xl" className="py-12">
          {/* Trust Badges Section - Builds confidence */}
          <div className="mb-12">
            <TrustBadges layout="grid" />
          </div>

          {/* Social Proof & Stats Section */}
          <div className="mb-10 grid gap-4 md:grid-cols-3">
            <SocialProofBadge
              type="viewers"
              count={Math.floor(150 + Math.random() * 200)}
              label="Bezoekers vandaag"
            />
            <SocialProofBadge
              type="purchases"
              count={Math.floor(products.length * 15 + Math.random() * 50)}
              label="Verkocht deze maand"
            />
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm border border-emerald-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <FireIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-900">{products.length}</div>
                <div className="text-sm text-emerald-700 font-medium">Exclusieve deals</div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  Alle {categoryTitle}
                </h2>
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-rose-600">{products.length}</span> producten
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} deal={product} />
                ))}
              </div>

              {/* Bottom CTA Section - Secondary conversion point */}
              <div className="mt-16 rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 p-8 md:p-12 text-center text-white shadow-2xl">
                <div className="mx-auto max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                    <UsersIcon className="h-4 w-4" />
                    <span>Meer dan 10.000+ tevreden klanten</span>
                  </div>
                  <h3 className="mb-4 font-display text-3xl md:text-4xl font-bold">
                    Vond je niet wat je zocht?
                  </h3>
                  <p className="mb-8 text-lg text-white/90">
                    Ontdek meer handgeselecteerde deals in onze andere categorieën
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => navigateTo('deals')}
                    className="bg-white text-rose-600 hover:bg-white/90 hover:scale-105 transition-transform"
                  >
                    Bekijk alle categorieën
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Geen producten gevonden</h3>
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
  )
}

export default CategoryDetailPage
