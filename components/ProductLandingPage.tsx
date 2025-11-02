import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { withAffiliate } from '../services/affiliate'
import Breadcrumbs from './Breadcrumbs'
import Button from './Button'
import FAQSection from './FAQSection'
import {
  HeartIcon,
  HeartIconFilled,
  CheckIcon,
  StarIcon,
  ChevronLeftIcon,
  GiftIcon,
  ShareIcon,
} from './IconComponents'
import ImageWithFallback from './ImageWithFallback'
import { Container } from './layout/Container'
import Meta from './Meta'
import JsonLd from './JsonLd'
import { SocialShare } from './SocialShare'
import StickyAffiliateBar from './StickyAffiliateBar'
import { CountdownTimer, SocialProofBadge, TrustBadges } from './UrgencyBadges'
import type { NavigateTo, DealItem, Gift } from '../types'

interface ProductLandingPageProps {
  navigateTo: NavigateTo
  product: DealItem
  relatedProducts?: DealItem[]
}

// Helper to get retailer info
const getRetailerInfo = (affiliateLink: string) => {
  const lower = affiliateLink.toLowerCase()
  if (lower.includes('amazon')) {
    return {
      name: 'Amazon.nl',
      shortName: 'Amazon',
      badgeClass: 'bg-orange-100 text-orange-700 border-orange-300',
      buttonGradient: 'from-orange-400 via-amber-500 to-orange-600',
    }
  }
  if (lower.includes('coolblue')) {
    return {
      name: 'Coolblue',
      shortName: 'Coolblue',
      badgeClass: 'bg-sky-100 text-sky-700 border-sky-300',
      buttonGradient: 'from-sky-400 via-blue-500 to-sky-600',
    }
  }
  if (lower.includes('bol.com')) {
    return {
      name: 'Bol.com',
      shortName: 'Bol.com',
      badgeClass: 'bg-blue-100 text-blue-700 border-blue-300',
      buttonGradient: 'from-blue-400 via-blue-500 to-blue-600',
    }
  }
  return {
    name: 'Partner',
    shortName: 'Partner',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    buttonGradient: 'from-slate-400 via-slate-500 to-slate-600',
  }
}

// Format price helper
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

// Calculate savings
const calculateSavings = (price: string | undefined, originalPrice: string | undefined) => {
  if (!price || !originalPrice) return null
  const currentPrice = Number.parseFloat(price.replace(/[^0-9,.]/g, '').replace(',', '.'))
  const oldPrice = Number.parseFloat(originalPrice.replace(/[^0-9,.]/g, '').replace(',', '.'))
  if (Number.isFinite(currentPrice) && Number.isFinite(oldPrice) && oldPrice > currentPrice) {
    const savings = oldPrice - currentPrice
    const percentage = Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
    return { amount: savings, percentage }
  }
  return null
}

const ProductLandingPage: React.FC<ProductLandingPageProps> = ({
  navigateTo,
  product,
  relatedProducts = [],
}) => {
  const auth = useContext(AuthContext)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoritePulse, setFavoritePulse] = useState(false)
  const favoritePulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  const retailer = useMemo(() => getRetailerInfo(product.affiliateLink), [product.affiliateLink])
  const savings = useMemo(
    () => calculateSavings(product.price, product.originalPrice),
    [product.price, product.originalPrice]
  )

  // Convert to Gift format for favorites
  const productAsGift = useMemo<Gift>(() => {
    const formattedPrice = formatPrice(product.price) || product.price || ''
    return {
      productName: product.name,
      description: product.description || '',
      priceRange: formattedPrice,
      retailers: [
        {
          name: retailer.name,
          affiliateLink: product.affiliateLink,
        },
      ],
      imageUrl: product.imageUrl,
      category: product.category,
      tags: product.tags,
      availability: product.inStock === false ? 'out-of-stock' : 'in-stock',
      matchReason: product.description,
    }
  }, [product, retailer])

  // Check favorite status
  useEffect(() => {
    if (auth?.currentUser) {
      setIsFavorite(auth.isFavorite(productAsGift))
    } else {
      try {
        const favorites: Gift[] = JSON.parse(localStorage.getItem('gifteezFavorites') || '[]')
        setIsFavorite(favorites.some((fav: Gift) => fav.productName === product.name))
      } catch (e) {
        console.error('Failed to parse guest favorites', e)
      }
    }
  }, [product.name, auth, productAsGift])

  // Cleanup
  useEffect(
    () => () => {
      if (favoritePulseTimeoutRef.current) {
        clearTimeout(favoritePulseTimeoutRef.current)
        favoritePulseTimeoutRef.current = null
      }
    },
    []
  )

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [product.id])

  const handleToggleFavorite = () => {
    let isNowFavorite: boolean

    if (auth?.currentUser) {
      auth.toggleFavorite(productAsGift)
      isNowFavorite = !auth.isFavorite(productAsGift)
    } else {
      try {
        const favorites: Gift[] = JSON.parse(localStorage.getItem('gifteezFavorites') || '[]')
        const isCurrentlyFavorite = favorites.some((fav) => fav.productName === product.name)

        let updatedFavorites: Gift[]
        if (isCurrentlyFavorite) {
          updatedFavorites = favorites.filter((fav) => fav.productName !== product.name)
        } else {
          updatedFavorites = [...favorites, productAsGift]
        }
        localStorage.setItem('gifteezFavorites', JSON.stringify(updatedFavorites))
        isNowFavorite = !isCurrentlyFavorite
      } catch (e) {
        console.error('Failed to update guest favorites', e)
        return
      }
            <JsonLd id={`ld-product-${product.id}`} data={productSchema} />
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

  const scrollToCTA = () => {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const numericPrice = useMemo(() => {
    if (!product.price) return undefined
    const clean = product.price.replace(/[^0-9,.]/g, '').replace(',', '.')
    return clean || undefined
  }, [product.price])

  const productSchema = useMemo(() => {
    const retailerBrand = retailer.shortName || 'Partner'
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.imageUrl,
      description: product.description || product.name,
      brand: { '@type': 'Brand', name: retailerBrand },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: numericPrice,
        url: withAffiliate(product.affiliateLink, { pageType: 'product-landing', placement: 'schema' }),
        availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      },
      ...(product.giftScore && product.giftScore >= 8
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: product.giftScore,
              bestRating: '10',
              ratingCount: '100',
            },
          }
        : {}),
    }
  }, [product.name, product.imageUrl, product.description, product.affiliateLink, product.inStock, product.giftScore, retailer.shortName, numericPrice])

  // Generate mock review rating (in production, would come from data)
  const mockRating = product.giftScore ? product.giftScore / 2 : 4.5
  const mockReviewCount = Math.floor(Math.random() * 3000) + 500

  // Generate mock FAQ based on product
  const faqItems = [
    {
      question: 'Voor wie is dit product geschikt?',
      answer: product.description
        ? `${product.description}. Perfect als cadeau voor vrienden, familie of jezelf!`
        : 'Dit product is perfect als cadeau voor vrienden, familie of jezelf. Geschikt voor alle gelegenheden.',
    },
    {
      question: 'Wat zit er in de box?',
      answer:
        'Alle producten worden compleet geleverd zoals beschreven door de verkoper. Check de productpagina bij de winkel voor exacte specificaties.',
    },
    {
      question: 'Hoe lang duurt de verzending?',
      answer: `Bij ${retailer.name} worden bestellingen snel verwerkt. Gratis verzending vanaf €20. Levertijd varieert, maar meestal binnen 1-3 werkdagen.`,
    },
    {
      question: 'Kan ik het product retourneren?',
      answer: `Ja! ${retailer.name} biedt een 30 dagen retourgarantie. Niet tevreden? Geld terug, geen vragen gesteld.`,
    },
    {
      question: 'Is dit een veilige aankoop?',
      answer: `Absoluut! Je koopt rechtstreeks via ${retailer.name}, een betrouwbare partner. Betalen gaat via veilige, SSL-beveiligde verbindingen.`,
    },
  ]

  // Mock urgency data (in production, would come from API)
  const mockViewers = Math.floor(Math.random() * 150) + 20
  const mockSoldThisMonth = Math.floor(Math.random() * 500) + 100
  const dealEndTime = new Date(Date.now() + 1000 * 60 * 60 * 12) // 12 hours from now

  return (
    <>
      <Meta
        title={`${product.name} - Beste Deal | Gifteez.nl`}
        description={
          product.description ||
          `Ontdek ${product.name} met de beste prijs. Handmatig geselecteerd door onze experts. ${savings ? `Bespaar ${savings.percentage}%!` : ''}`
        }
        ogImage={product.imageUrl}
        canonical={`/product/${product.id}`}
      />

      {/* Structured Data - Product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.imageUrl,
            description: product.description || product.name,
            offers: {
              '@type': 'Offer',
              price: product.price?.replace(/[^0-9,.]/g, '').replace(',', '.'),
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock',
              url: product.affiliateLink,
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: mockRating.toFixed(1),
              reviewCount: mockReviewCount,
            },
          }),
        }}
      />

      <div className="bg-gradient-to-b from-white via-rose-50/20 to-white min-h-screen">
        <Container size="xl" className="py-6">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Deals', href: '/deals' },
                { label: product.name, href: `/product/${product.id}` },
              ]}
            />
          </div>

          {/* Back Button */}
          <Button
            variant="secondary"
            onClick={() => navigateTo('deals')}
            className="mb-6 inline-flex items-center gap-2"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Terug naar deals
          </Button>

          {/* Main Product Section */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Left: Image */}
            <div className="space-y-6">
              <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {product.giftScore && product.giftScore >= 9 && (
                    <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg animate-pulse">
                      ⭐ TOP DEAL
                    </div>
                  )}
                  {product.isOnSale && (
                    <div className="rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                      🔥 SALE
                    </div>
                  )}
                  {savings && (
                    <div className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                      -{savings.percentage}%
                    </div>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={handleToggleFavorite}
                  className={`absolute top-4 right-4 z-10 rounded-full bg-white p-3 shadow-lg transition-all hover:scale-110 ${
                    favoritePulse ? 'animate-pulse' : ''
                  }`}
                  aria-label={isFavorite ? 'Verwijder van favorieten' : 'Voeg toe aan favorieten'}
                >
                  {isFavorite ? (
                    <HeartIconFilled className="h-6 w-6 text-rose-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-slate-400 hover:text-rose-500" />
                  )}
                </button>

                <div className="aspect-square p-8">
                  <ImageWithFallback
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-contain"
                    fit="contain"
                  />
                </div>
              </div>

              {/* Trust Badges */}
              <TrustBadges />
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Retailer Badge */}
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${retailer.badgeClass}`}
              >
                <GiftIcon className="h-4 w-4" />
                Verkrijgbaar bij {retailer.name}
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(mockRating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-slate-600 text-sm">
                  {mockRating.toFixed(1)} ({mockReviewCount.toLocaleString('nl-NL')} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-emerald-600">
                    {formatPrice(product.price) || 'Prijs op aanvraag'}
                  </span>
                  {product.originalPrice && savings && (
                    <span className="text-xl text-slate-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                {savings && (
                  <p className="text-emerald-600 font-semibold">
                    💰 Je bespaart €{savings.amount.toFixed(2)} ({savings.percentage}%)
                  </p>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="rounded-lg bg-slate-50 p-5 border border-slate-200">
                  <p className="text-slate-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Gift Score */}
              {product.giftScore && (
                <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 border border-emerald-200">
                  <CheckIcon className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-emerald-900">
                      Gifteez Cadeauscore: {product.giftScore}/10
                    </div>
                    <div className="text-sm text-emerald-700">
                      Door onze experts als topcadeau beoordeeld
                    </div>
                  </div>
                </div>
              )}

              {/* Social Proof */}
              <SocialProofBadge
                viewCount={mockViewers}
                purchaseCount={mockSoldThisMonth}
                recentPurchaseMinutes={Math.floor(Math.random() * 45) + 5}
              />

              {/* Countdown Timer */}
              {product.isOnSale && <CountdownTimer endTime={dealEndTime} />}

              {/* Main CTA */}
              <div ref={ctaRef} className="space-y-3">
                <a
                  href={withAffiliate(product.affiliateLink, {
                    pageType: 'product-landing',
                    placement: 'product-landing-cta',
                  })}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="group relative block w-full overflow-hidden rounded-2xl text-center font-bold text-white shadow-2xl transition-all hover:scale-105 px-8 py-5 text-lg"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${retailer.buttonGradient} transition-all duration-300`}
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <span>🎁 Bekijk deal op {retailer.shortName}</span>
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
                <p className="text-center text-xs text-slate-500">
                  Je wordt doorgestuurd naar {retailer.name} om de aankoop af te ronden
                </p>
              </div>

              {/* Share */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <ShareIcon className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-600">
                    Deel dit product met vrienden
                  </span>
                </div>
                <SocialShare item={productAsGift} type="gift" variant="compact" />
              </div>
            </div>
          </div>

          {/* Why This Product Section */}
          <div className="mb-12 rounded-2xl bg-gradient-to-br from-slate-50 to-white p-8 md:p-12 border border-slate-200">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-6">
              ✨ Waarom dit product?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-3xl">🎯</div>
                <h3 className="font-bold text-slate-900">Perfect Cadeau</h3>
                <p className="text-slate-600 text-sm">
                  Handmatig geselecteerd door onze cadeau-experts voor maximale impact
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">⭐</div>
                <h3 className="font-bold text-slate-900">Top Kwaliteit</h3>
                <p className="text-slate-600 text-sm">
                  Alleen producten met uitstekende reviews en hoge klanttevredenheid
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">💝</div>
                <h3 className="font-bold text-slate-900">Altijd Raak</h3>
                <p className="text-slate-600 text-sm">
                  Bewezen succesvol als cadeau - duizenden tevreden ontvangers
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <FAQSection items={faqItems} />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                🎁 Vergelijkbare producten
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map((related) => (
                  <button
                    key={related.id}
                    onClick={() =>
                      navigateTo('productLanding', { productId: related.id, product: related })
                    }
                    className="group text-left bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="aspect-square bg-slate-50 p-4">
                      <ImageWithFallback
                        src={related.imageUrl}
                        alt={related.name}
                        className="h-full w-full object-contain transition-transform group-hover:scale-110"
                        fit="contain"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm">
                        {related.name}
                      </h3>
                      <p className="text-emerald-600 font-bold">
                        {formatPrice(related.price) || 'Bekijk prijs'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="text-center space-y-4 py-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900">
              Klaar om te bestellen?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Duizenden tevreden klanten gingen je voor. Mis deze deal niet!
            </p>
            <Button
              variant="primary"
              size="large"
              onClick={scrollToCTA}
              className="inline-flex items-center gap-2 px-8 py-4 text-lg"
            >
              <span>🎉 Ja, ik wil deze deal!</span>
            </Button>
          </div>
        </Container>

        {/* Sticky Affiliate Bar for Mobile */}
        <StickyAffiliateBar
          product={product}
          retailerName={retailer.shortName}
          onCtaClick={() => {
            if (window.gtag) {
              window.gtag('event', 'sticky_bar_conversion', {
                event_category: 'affiliate',
                event_label: product.name,
                retailer: retailer.name,
              })
            }
          }}
        />
      </div>
    </>
  )
}

export default ProductLandingPage
