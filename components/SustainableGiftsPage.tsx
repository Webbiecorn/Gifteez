import React, { useEffect, useState } from 'react'
import { withAffiliate } from '../services/affiliate'
import {
  ShopLikeYouGiveADamnService,
  type SLYGADProduct,
} from '../services/shopLikeYouGiveADamnService'
import Breadcrumbs from './Breadcrumbs'
import Button from './Button'
import { ChevronLeftIcon, SparklesIcon } from './IconComponents'
import ImageWithFallback from './ImageWithFallback'
import JsonLd from './JsonLd'
import { Container } from './layout/Container'
import Meta from './Meta'
import { TrustBadges } from './UrgencyBadges'
import type { NavigateTo } from '../types'

interface SustainableGiftsPageProps {
  navigateTo: NavigateTo
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(price)
}

const SustainableGiftsPage: React.FC<SustainableGiftsPageProps> = ({ navigateTo }) => {
  const [products, setProducts] = useState<SLYGADProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Duurzame Cadeaus | Bewuste Geschenken van Shop Like You Give A Damn'
    window.scrollTo(0, 0)

    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await ShopLikeYouGiveADamnService.loadProducts()
        console.log('Loaded SLYGAD products:', data.length)
        if (data && data.length > 0) {
          setProducts(data.filter((p) => p.active !== false).slice(0, 50)) // Limit to 50 products
        } else {
          setProducts([])
          console.warn('No SLYGAD products found')
        }
      } catch (err) {
        console.error('Error loading sustainable products:', err)
        setError('Er ging iets mis bij het laden van de producten. Probeer het later opnieuw.')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const trackProductClick = (product: SLYGADProduct) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'select_item', {
        item_list_id: 'sustainable_gifts',
        item_list_name: 'Duurzame Cadeaus',
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            item_brand: product.brand || 'Shop Like You Give A Damn',
            item_category: 'Duurzaam',
          },
        ],
      })
    }
  }

  // Schema.org structured data for SEO
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Duurzame Cadeaus van Shop Like You Give A Damn',
    description:
      'Bewuste en duurzame cadeaus van Shop Like You Give A Damn. Ecologisch, veganistisch en ethisch verantwoord.',
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        description: product.description || product.shortDescription,
        image: product.imageUrl,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'EUR',
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: product.affiliateLink,
          seller: {
            '@type': 'Organization',
            name: 'Shop Like You Give A Damn',
          },
        },
      },
    })),
  }

  return (
    <>
      <Meta
        title="Duurzame Cadeaus Kopen | Shop Like You Give A Damn | Gifteez"
        description="Shop bewuste en duurzame cadeaus van Shop Like You Give A Damn. Ecologisch, veganistisch en ethisch verantwoord. Perfecte geschenken voor mensen die om de wereld geven. ♻️🌱"
        keywords={[
          'duurzame cadeaus',
          'ecologische geschenken',
          'veganistische cadeaus',
          'bewuste cadeaus',
          'ethische cadeaus',
          'shop like you give a damn',
          'duurzaam cadeau',
          'groene cadeaus',
        ]}
        canonical="/duurzame-cadeaus"
        ogImage="/assets/og-sustainable-gifts.jpg"
      />

      <JsonLd data={itemListSchema} />

      <Container size="xl" className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', onClick: () => navigateTo('home') },
            { label: 'Collecties', onClick: () => navigateTo('deals') },
            { label: 'Duurzame Cadeaus' },
          ]}
        />

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 py-16 md:py-20 px-6 md:px-12 mb-12 shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/30 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute top-1/2 left-1/3 w-48 h-48 bg-emerald-300/20 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: '2s' }}
          />

          <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-5 py-2 mb-6 shadow-lg">
              <span className="text-lg">🌱</span>
              <span className="text-sm font-semibold uppercase tracking-wider">
                ♻️ Duurzaam & Bewust
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
              Duurzame Cadeaus
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl leading-relaxed mb-8 drop-shadow max-w-3xl mx-auto">
              Geef een cadeau met betekenis. Al onze duurzame producten komen van{' '}
              <strong>Shop Like You Give A Damn</strong> - 100% ecologisch, veganistisch en ethisch
              verantwoord. Perfect voor mensen die bewust willen geven.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                { icon: '🌱', text: '100% Veganistisch' },
                { icon: '♻️', text: 'Ecologisch Gemaakt' },
                { icon: '🌍', text: 'Ethisch Verantwoord' },
                { icon: '💚', text: 'Bewust Shoppen' },
              ].map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-sm font-medium shadow-lg"
                >
                  <span className="text-lg">{badge.icon}</span>
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 bg-white text-green-700 font-semibold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>Ontdek {products.length} Duurzame Cadeaus</span>
              </button>
              <button
                onClick={() => navigateTo('deals')}
                className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/30 transition-all duration-200"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                <span>Terug naar Collecties</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges Section */}
        <div className="mb-12">
          <TrustBadges />
        </div>

        {/* Why Sustainable Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 md:p-12 mb-12 border border-green-100">
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-6 text-center">
            🌍 Waarom Duurzaam Cadeau Geven?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: '🌱',
                title: 'Goed voor de Planeet',
                description:
                  'Elk product is gemaakt met respect voor onze aarde. Milieuvriendelijke materialen en productieprocessen.',
              },
              {
                icon: '💚',
                title: 'Verantwoord Shoppen',
                description:
                  'Shop bij merken die transparant zijn over hun impact. Ethisch geproduceerd en eerlijk voor iedereen.',
              },
              {
                icon: '✨',
                title: 'Betekenisvol Geven',
                description:
                  'Geef een cadeau met een verhaal. Toon dat je om de ontvanger én de wereld geeft.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-green-100"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4" />
            <p className="text-gray-600">Duurzame producten laden...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Er ging iets mis</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Probeer opnieuw
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <span className="text-3xl">🌱</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nog geen producten</h3>
            <p className="text-gray-600 mb-6">
              We zijn bezig met het toevoegen van duurzame cadeaus
            </p>
            <Button variant="primary" onClick={() => navigateTo('deals')}>
              Bekijk andere collecties
            </Button>
          </div>
        ) : (
          <>
            {/* Product Count */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">🌿 Alle Duurzame Cadeaus</h2>
                <p className="text-gray-600 mt-1">
                  {products.length} bewuste geschenken · van Shop Like You Give A Damn
                </p>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-green-300 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <ImageWithFallback
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading={index < 8 ? 'eager' : 'lazy'}
                    />
                    {/* Sustainable Badge */}
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <span>🌱</span>
                      Duurzaam
                    </div>
                    {product.giftScore && product.giftScore >= 8 && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 shadow">
                        <span>⭐</span>
                        <span>Top keuze</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Brand */}
                    {product.brand && (
                      <div className="text-xs text-gray-500 mb-1 font-medium">{product.brand}</div>
                    )}

                    {/* Product Name */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Short Description */}
                    {product.shortDescription && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(product.price)}
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-xs text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Buy Button */}
                    <a
                      href={withAffiliate(product.affiliateLink, {
                        pageType: 'sustainable-gifts',
                        placement: 'card-cta',
                      })}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      onClick={() => trackProductClick(product)}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-lg group"
                    >
                      <span>Bestel bij SLYGAD</span>
                      <svg
                        className="h-4 w-4 group-hover:translate-x-1 transition-transform"
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
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTAs */}
            <div className="grid md:grid-cols-2 gap-6 mt-16">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">
                  🌱 Meer Duurzame Keuzes
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Ontdek meer bewuste cadeaus en lees onze blog over duurzaam geven.
                </p>
                <Button variant="primary" onClick={() => navigateTo('blog')}>
                  Lees Onze Blog
                </Button>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">
                  ✨ Hulp Nodig?
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Niet zeker welk duurzaam cadeau past? Probeer onze slimme Cadeau-Coach!
                </p>
                <Button variant="primary" onClick={() => navigateTo('giftFinder')}>
                  Start Cadeau-Coach
                </Button>
              </div>
            </div>
          </>
        )}
      </Container>
    </>
  )
}

export default SustainableGiftsPage
