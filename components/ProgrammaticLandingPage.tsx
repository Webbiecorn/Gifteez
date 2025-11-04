/**
 * ProgrammaticLandingPage - Updated for Classifier System
 * Loads product data from pre-generated JSON files
 */

import React, { useEffect, useState } from 'react'
import { PROGRAMMATIC_INDEX, type ProgrammaticConfig } from '../data/programmatic'
import { withAffiliate } from '../services/affiliate'
import JsonLd from './JsonLd'
import Container from './layout/Container'
import type { NavigateTo } from '../types'
import type { ProgrammaticIndex, ClassifiedProduct } from '../utils/product-classifier'

interface Props {
  variantSlug: string
  navigateTo: NavigateTo
}

const ProgrammaticLandingPage: React.FC<Props> = ({ variantSlug, navigateTo }) => {
  const config: ProgrammaticConfig | undefined = PROGRAMMATIC_INDEX[variantSlug]
  const [index, setIndex] = useState<ProgrammaticIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    // Try to load pre-generated JSON
    fetch(`/programmatic/${variantSlug}.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Guide not available yet`)
        }
        return response.json()
      })
      .then((data: ProgrammaticIndex) => {
        setIndex(data)
        setLoading(false)
      })
      .catch((err) => {
        console.warn('Pre-generated guide not found, using config:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [variantSlug])

  const pageTitle = config?.title ?? index?.metadata.title ?? 'Cadeau ideeën'
  const pageIntro = config?.intro ?? index?.metadata.description ?? ''

  // Schema for SEO
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Cadeaus',
        item: `${window.location.origin}/cadeaus`,
      },
      { '@type': 'ListItem', position: 3, name: pageTitle, item: window.location.href },
    ],
  }

  if (loading) {
    return (
      <Container>
        <div className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Cadeaus laden...</p>
          </div>
        </div>
      </Container>
    )
  }

  if (error && !index) {
    return (
      <Container>
        <div className="py-12">
          <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-2">Gids nog niet beschikbaar</h2>
            <p className="text-amber-700 mb-4">
              Deze cadeaugids wordt momenteel gevuld met producten. Kom later terug!
            </p>
            <button
              onClick={() => navigateTo('categories')}
              className="text-primary hover:underline font-semibold"
            >
              ← Bekijk andere gidsen
            </button>
          </div>
        </div>
      </Container>
    )
  }

  if (!index || !index.products || index.products.length === 0) {
    return (
      <Container>
        <div className="py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{pageTitle}</h1>
            <p className="text-gray-600 mb-6">{pageIntro}</p>
            <p className="text-amber-600">Geen producten beschikbaar voor deze gids.</p>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <JsonLd data={breadcrumbSchema} />

      <div className="py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {pageTitle}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl">{pageIntro}</p>

          {/* Stats Badges */}
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
              {index.metadata.totalProducts} producten
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
              {index.stats.uniqueBrands} merken
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold">
              €{Math.round(index.stats.priceRange[0])} - €{Math.round(index.stats.priceRange[1])}
            </span>
          </div>

          {/* Highlights */}
          {config?.highlights && config.highlights.length > 0 && (
            <ul className="mt-6 space-y-2">
              {config.highlights.map((highlight, i) => (
                <li key={i} className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {highlight}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Products Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {index.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* FAQs */}
        {config?.faq && config.faq.length > 0 && (
          <section className="mt-16 max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Veelgestelde vragen</h2>
            <div className="space-y-4">
              {config.faq.map((item, i) => (
                <details key={i} className="bg-gray-50 rounded-lg p-4">
                  <summary className="font-semibold text-gray-900 cursor-pointer">{item.q}</summary>
                  <p className="mt-2 text-gray-600">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </Container>
  )
}

// ==================== Product Card ====================

interface ProductCardProps {
  product: ClassifiedProduct
}

/**
 * Format merchant name for display
 * "Coolblue NL" → "Coolblue"
 * "Shop Like You Give A Damn - NL & BE" → "Shop Like You Give A Damn"
 */
function formatMerchantName(merchant?: string): string {
  if (!merchant) return 'onze partner'

  // Remove country suffixes and regional indicators
  return merchant
    .replace(/\s*-\s*(NL|BE|NL\s*&\s*BE)$/i, '')
    .replace(/\s+NL$/i, '')
    .replace(/\s+BE$/i, '')
    .trim()
}

function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  // Add affiliate tracking to product URL
  const affiliateUrl = withAffiliate(product.url, {
    retailer: product.merchant?.toLowerCase() || product.source,
    pageType: 'programmatic-guide',
    placement: 'product-card',
  })

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            -{discountPercentage}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1 font-semibold">
            {product.brand}
          </p>
        )}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem]">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-gray-900">€{product.price.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              €{product.originalPrice!.toFixed(2)}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {product.facets.category && (
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
              {product.facets.category}
            </span>
          )}
          {product.deliveryDays && product.deliveryDays <= 2 && (
            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
              ⚡ Snel
            </span>
          )}
          {product.facets.interests?.includes('duurzaam') && (
            <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">
              🌱 Duurzaam
            </span>
          )}
        </div>

        {/* Source */}
        <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
          Via {formatMerchantName(product.merchant)}
        </div>
      </div>
    </a>
  )
}

export default ProgrammaticLandingPage
