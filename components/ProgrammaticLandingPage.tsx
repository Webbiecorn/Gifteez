/**
 * ProgrammaticLandingPage - Updated for Classifier System
 * Loads product data from pre-generated JSON files
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PROGRAMMATIC_INDEX, type ProgrammaticConfig } from '../data/programmatic'
import { buildGuidePath, GUIDE_BASE_PATH } from '../guidePaths'
import { withAffiliate } from '../services/affiliate'
import AnalyticsEvents from '../services/analyticsEventService'
import { PerformanceInsightsService } from '../services/performanceInsightsService'
import GuideCard from './GuideCard'
import JsonLd from './JsonLd'
import Container from './layout/Container'
import type { NavigateTo } from '../types'
import type { ProgrammaticIndex, ClassifiedProduct } from '../utils/product-classifier'

interface Props {
  variantSlug: string
  navigateTo: NavigateTo
}

const FALLBACK_ORIGIN = 'https://gifteez.nl'

type InfoBadge = {
  label: string
  value: string
}

type EditorPick = {
  product: ClassifiedProduct
  reason?: string
}

type SortOption = 'featured' | 'price-asc' | 'price-desc'
type PriceFilter = 'all' | 'under-25' | '25-50' | '50-100' | '100+'

type RetailerSpotlightProduct = {
  id: string
  title: string
  price: number
  currency: string
  image?: string
  brand?: string
  merchant?: string
  affiliateLink: string
  description?: string
  category?: string
}

const PRICE_FILTER_LABELS: Record<PriceFilter, string> = {
  all: 'Alle prijzen',
  'under-25': 'Onder €25',
  '25-50': '€25 - €50',
  '50-100': '€50 - €100',
  '100+': '€100+',
}
const normalizeFeedSource = (value?: string | null) => {
  if (!value) return null
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
}

const buildProgrammaticSourceDescriptor = (
  slug: string,
  context: 'grid' | 'editor',
  product: ClassifiedProduct
) => {
  const feed =
    normalizeFeedSource(product.source) ||
    normalizeFeedSource(product.merchant) ||
    normalizeFeedSource(product.id.split(':')[0]) ||
    'unknown'
  return `programmatic:${slug}:${context}:${feed}`
}

const toTitleCase = (value: string) =>
  value
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const formatBadgeValue = (value?: string | null) => {
  if (!value) return ''
  if (value.includes('&')) return value
  return toTitleCase(value)
}

const formatRecipientLabel = (recipient?: string | null) => {
  if (!recipient) return ''
  const normalized = recipient.toLowerCase()
  if (normalized === 'kids' || normalized === 'kinderen') return 'Kinderen'
  if (normalized === 'men' || normalized === 'hem') return 'Voor hem'
  if (normalized === 'women' || normalized === 'haar') return 'Voor haar'
  if (normalized === 'collegas' || normalized === 'collega' || normalized === 'collega’s')
    return 'Collega’s'
  return formatBadgeValue(recipient)
}

const ProgrammaticLandingPage: React.FC<Props> = ({ variantSlug, navigateTo }) => {
  const config: ProgrammaticConfig | undefined = PROGRAMMATIC_INDEX[variantSlug]
  const [index, setIndex] = useState<ProgrammaticIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('featured')
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState(false)
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const retailerSpotlightConfig = config?.retailerSpotlight
  const [retailerSpotlightProducts, setRetailerSpotlightProducts] = useState<
    RetailerSpotlightProduct[]
  >([])
  const [retailerSpotlightLoading, setRetailerSpotlightLoading] = useState(false)
  const [retailerSpotlightError, setRetailerSpotlightError] = useState<string | null>(null)
  const trackedImpressions = useRef<Set<string>>(new Set())
  const trackedEditorImpressions = useRef<Set<string>>(new Set())
  const trackedSpotlightImpressions = useRef<Set<string>>(new Set())
  const analyticsListName = useMemo(() => `programmatic:${variantSlug}`, [variantSlug])
  const retailerSpotlightPerformanceSource = useMemo(() => {
    if (!retailerSpotlightConfig?.feedId) return null
    return `programmatic:${variantSlug}:spotlight:${retailerSpotlightConfig.feedId}`
  }, [retailerSpotlightConfig?.feedId, variantSlug])

  useEffect(() => {
    setLoading(true)
    setError(null)
    setSortOption('featured')
    setFastDeliveryOnly(false)
    setPriceFilter('all')
    trackedImpressions.current.clear()
    trackedEditorImpressions.current.clear()

    // Try to load pre-generated JSON
    fetch(`/programmatic/${variantSlug}.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Guide not available yet`)
        }
        return response.json()
      })
      .then((data: ProgrammaticIndex) => {
        // If config has curatedProducts, replace index.products with them
        if (config?.curatedProducts?.length) {
          const curatedAsClassified: ClassifiedProduct[] = config.curatedProducts.map(
            (product) => ({
              id: product.affiliateLink,
              sku: product.affiliateLink,
              title: product.title,
              price: product.price,
              currency: product.currency || 'EUR',
              image: product.image,
              images: [product.image],
              url: product.affiliateLink,
              merchant: product.merchant,
              inStock: true,
              source: 'amazon' as const,
              facets: {
                audience: ['unisex'],
                category: 'gadgets',
                priceBucket:
                  product.price < 25
                    ? 'under-25'
                    : product.price < 50
                      ? '25-50'
                      : product.price < 100
                        ? '50-100'
                        : product.price < 250
                          ? '100-250'
                          : 'over-250',
                confidence: 1,
                reasons: ['Handmatig toegevoegd'],
                needsReview: false,
                isGiftable: true,
              },
              searchText: `${product.title} ${product.merchant}`.toLowerCase(),
              canonicalKey: product.affiliateLink,
            })
          )
          data = {
            ...data,
            products: curatedAsClassified,
            metadata: {
              ...data.metadata,
              totalProducts: curatedAsClassified.length,
            },
          }
        }
        setIndex(data)
        setLoading(false)
      })
      .catch((err) => {
        console.warn('Pre-generated guide not found, using config:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [variantSlug])

  useEffect(() => {
    trackedSpotlightImpressions.current.clear()

    if (!retailerSpotlightConfig?.feedId) {
      setRetailerSpotlightProducts([])
      setRetailerSpotlightLoading(false)
      setRetailerSpotlightError(null)
      return
    }

    let isCancelled = false

    const fetchSpotlightProducts = async () => {
      setRetailerSpotlightLoading(true)
      setRetailerSpotlightError(null)

      const parsePrice = (value: unknown): number | null => {
        if (typeof value === 'number') return Number.isFinite(value) ? value : null
        if (typeof value === 'string') {
          const parsed = Number(value)
          return Number.isFinite(parsed) ? parsed : null
        }
        return null
      }

      try {
        const resolveShardPath = async (): Promise<string> => {
          try {
            const indexResponse = await fetch('/data/awin-index.json', {
              headers: { 'cache-control': 'no-cache' },
            })
            if (indexResponse.ok) {
              const indexJson = await indexResponse.json()
              const match = Array.isArray(indexJson?.shards)
                ? indexJson.shards.find(
                    (entry: any) => entry?.feedId === retailerSpotlightConfig.feedId
                  )
                : null
              if (match?.shard) {
                const normalizedPath = match.shard.startsWith('/') ? match.shard : `/${match.shard}`
                return normalizedPath
              }
            }
          } catch (err) {
            console.warn('Kon awin-index voor spotlight niet laden', err)
          }
          return `/data/awin-shards/${retailerSpotlightConfig.feedId}.json`
        }

        const shardPath = await resolveShardPath()
        const response = await fetch(shardPath, { headers: { 'cache-control': 'no-cache' } })
        if (!response.ok) {
          throw new Error('Partnerfeed niet beschikbaar')
        }

        const payload = await response.json()
        const rawProducts: any[] = Array.isArray(payload) ? payload : []

        if (!rawProducts.length) {
          if (!isCancelled) {
            setRetailerSpotlightProducts([])
            setRetailerSpotlightError('Geen partnerproducten gevonden in deze feed')
          }
          return
        }

        const filters = retailerSpotlightConfig.cardFilters
        const includeKeywords = (filters?.includeKeywords ?? []).map((keyword) =>
          keyword.toLowerCase().trim()
        )
        const includeBrands = (filters?.includeBrands ?? []).map((brand) =>
          brand.toLowerCase().trim()
        )
        const minPrice = typeof filters?.minPrice === 'number' ? filters.minPrice : null
        const maxPrice = typeof filters?.maxPrice === 'number' ? filters.maxPrice : null

        const filtered = rawProducts
          .map((product, index) => ({
            product,
            price: parsePrice(product?.price),
            index,
          }))
          .filter(({ product, price }) => {
            if (!price || price <= 0) return false
            if (!product?.affiliateLink && !product?.url) return false

            if (minPrice !== null && price < minPrice) return false
            if (maxPrice !== null && price > maxPrice) return false

            if (includeKeywords.length) {
              const haystack = `${product?.name ?? ''} ${product?.description ?? ''}`.toLowerCase()
              const keywordMatch = includeKeywords.some(
                (keyword) => keyword && haystack.includes(keyword)
              )
              if (!keywordMatch) return false
            }

            if (includeBrands.length) {
              const brandValue = (product?.brand ?? '').toLowerCase()
              const brandMatch = includeBrands.some((brand) => brand && brandValue.includes(brand))
              if (!brandMatch) return false
            }

            return true
          })
          .sort((a, b) => {
            if (a.price === null && b.price === null) return 0
            if (a.price === null) return 1
            if (b.price === null) return -1
            return a.price - b.price
          })
          .map(({ product, price }, position) => {
            const affiliateLink = product?.affiliateLink || product?.url
            if (!affiliateLink || !price) return null
            const fallbackId = `${retailerSpotlightConfig.feedId}-${position}`
            return {
              id: String(product?.id ?? fallbackId),
              title: String(product?.name ?? 'Partnerproduct'),
              price,
              currency: typeof product?.currency === 'string' ? product.currency : 'EUR',
              image: product?.image || product?.imageUrl || '',
              brand: product?.brand || '',
              merchant: product?.merchant || retailerSpotlightConfig.partnerName,
              affiliateLink,
              description: typeof product?.description === 'string' ? product.description : '',
              category: product?.category || 'Retailer spotlight',
            } as RetailerSpotlightProduct
          })
          .filter((product): product is RetailerSpotlightProduct => Boolean(product))

        const limit = retailerSpotlightConfig.cardLimit ?? 6
        if (!isCancelled) {
          setRetailerSpotlightProducts(filtered.slice(0, limit))
          if (!filtered.length) {
            setRetailerSpotlightError('Geen partnerproducten voldeden aan de filters')
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('Kon partner spotlight niet laden', err)
          setRetailerSpotlightProducts([])
          setRetailerSpotlightError('Partner spotlight kon niet geladen worden')
        }
      } finally {
        if (!isCancelled) {
          setRetailerSpotlightLoading(false)
        }
      }
    }

    void fetchSpotlightProducts()

    return () => {
      isCancelled = true
    }
  }, [retailerSpotlightConfig])

  const pageTitle = config?.title ?? index?.metadata.title ?? 'Cadeau ideeën'
  const pageIntro = config?.intro ?? index?.metadata.description ?? ''
  const totalProductCount = index?.metadata?.totalProducts ?? index?.products?.length ?? 0

  const infoBadges = useMemo<InfoBadge[]>(() => {
    const badges: InfoBadge[] = []
    if (config?.occasion) {
      badges.push({ label: 'Gelegenheid', value: formatBadgeValue(config.occasion) })
    }
    if (config?.recipient) {
      badges.push({ label: 'Voor wie', value: formatRecipientLabel(config.recipient) })
    }
    if (config?.budgetMax) {
      badges.push({ label: 'Budget', value: `Onder €${config.budgetMax}` })
    }
    if (config?.retailer) {
      badges.push({ label: 'Retailer', value: formatBadgeValue(config.retailer) })
    }
    if (config?.interest) {
      badges.push({ label: 'Interesse', value: formatBadgeValue(config.interest) })
    }
    if (config?.filters?.fastDelivery) {
      badges.push({ label: 'Levering', value: '⚡ Vandaag of morgen' })
    }
    if (config?.filters?.eco) {
      badges.push({ label: 'Duurzaam', value: 'Groene selectie' })
    }
    return badges
  }, [config])

  const schemaData = useMemo(() => {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : FALLBACK_ORIGIN
    const currentUrl =
      typeof window !== 'undefined' && window.location?.href
        ? window.location.href
        : `${origin}${buildGuidePath(variantSlug)}`

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Cadeaugidsen',
          item: `${origin}${GUIDE_BASE_PATH}`,
        },
        { '@type': 'ListItem', position: 3, name: pageTitle, item: currentUrl },
      ],
    }

    const itemList = index?.products?.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: pageTitle,
          itemListElement: index.products.slice(0, 12).map((product, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            item: {
              '@type': 'Product',
              name: product.title,
              description: product.description,
              image: product.images?.[0],
              brand: product.brand,
              offers: {
                '@type': 'Offer',
                priceCurrency: product.currency || 'EUR',
                price: product.price,
                availability: product.inStock
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
                url: withAffiliate(product.url, {
                  retailer: product.merchant?.toLowerCase() || product.source,
                  pageType: 'programmatic-guide',
                  placement: 'schema-item-list',
                  theme: variantSlug,
                  cardIndex: idx + 1,
                }),
              },
            },
          })),
        }
      : null

    const faq = config?.faq?.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: config.faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
        }
      : null

    return { breadcrumb, itemList, faq }
  }, [config?.faq, index, pageTitle, variantSlug])

  const editorPickProducts = useMemo<EditorPick[]>(() => {
    // Priority 1: Use curatedProducts if available (for Amazon/manual products)
    if (config?.curatedProducts?.length) {
      return config.curatedProducts.map((product) => ({
        product: {
          id: product.affiliateLink,
          title: product.title,
          price: product.price,
          currency: product.currency || 'EUR',
          image: product.image,
          images: [product.image],
          url: product.affiliateLink,
          merchant: product.merchant,
          inStock: true,
          source: product.merchant.toLowerCase(),
          facets: {
            audience: ['unisex'],
            category: 'gadgets',
            priceBucket:
              product.price < 25
                ? 'under-25'
                : product.price < 50
                  ? '25-50'
                  : product.price < 100
                    ? '50-100'
                    : product.price < 250
                      ? '100-250'
                      : 'over-250',
            confidence: 1,
            reasons: ['Handmatig toegevoegd'],
            needsReview: false,
            isGiftable: true,
          },
          searchText: `${product.title} ${product.merchant}`.toLowerCase(),
          canonicalKey: product.affiliateLink,
        } as ClassifiedProduct,
        reason: product.reason || 'Handmatig geselecteerd',
      }))
    }

    // Priority 2: Use featured products from index
    if (!index) return []
    if (index.featured?.length) {
      return index.featured.map((product) => ({ product, reason: 'Redactie favoriet' }))
    }

    // Priority 3: Match editorPicks SKUs with index products
    if (!config?.editorPicks?.length) return []
    return config.editorPicks
      .map<EditorPick | null>((pick) => {
        const match =
          index.products.find((product) => product.id === pick.sku || product.sku === pick.sku) ||
          null
        if (!match) return null
        return { product: match, reason: pick.reason }
      })
      .filter((item): item is EditorPick => Boolean(item))
  }, [config?.curatedProducts, config?.editorPicks, index])

  const lastUpdatedLabel = useMemo(() => {
    if (!index?.metadata.generatedAt) return null
    try {
      return new Date(index.metadata.generatedAt).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (err) {
      console.warn('Failed to format generatedAt', err)
      return null
    }
  }, [index?.metadata.generatedAt])

  const showSinterklaasNotice = Boolean(
    variantSlug.includes('sinterklaas') && index?.products.length && index.products.length < 6
  )

  const displayProducts = useMemo(() => {
    if (!index?.products) return []
    let products = [...index.products]
    if (fastDeliveryOnly) {
      products = products.filter(
        (product) => typeof product.deliveryDays === 'number' && product.deliveryDays <= 2
      )
    }

    if (priceFilter !== 'all') {
      products = products.filter((product) => {
        const price = product.price
        switch (priceFilter) {
          case 'under-25':
            return price < 25
          case '25-50':
            return price >= 25 && price < 50
          case '50-100':
            return price >= 50 && price < 100
          case '100+':
            return price >= 100
          default:
            return true
        }
      })
    }

    if (sortOption === 'price-asc') {
      return [...products].sort((a, b) => a.price - b.price)
    }
    if (sortOption === 'price-desc') {
      return [...products].sort((a, b) => b.price - a.price)
    }
    return products
  }, [fastDeliveryOnly, index?.products, sortOption, priceFilter])

  const handleRetailerSpotlightClick = useCallback(
    (product: RetailerSpotlightProduct, position: number, affiliateUrl: string) => {
      AnalyticsEvents.clickAffiliate(
        {
          id: product.id,
          name: product.title,
          title: product.title,
          category: product.category || 'Retailer spotlight',
          price: product.price,
          retailer: product.merchant || retailerSpotlightConfig?.partnerName || 'Retailer',
          affiliateUrl,
        },
        'programmatic-guide',
        'retailer-spotlight',
        position
      )

      if (retailerSpotlightPerformanceSource) {
        void PerformanceInsightsService.trackClick(product.id, retailerSpotlightPerformanceSource)
      }
    },
    [retailerSpotlightConfig?.partnerName, retailerSpotlightPerformanceSource]
  )

  useEffect(() => {
    if (!displayProducts.length) return

    const unseenProducts = displayProducts.filter(
      (product) => !trackedImpressions.current.has(product.id)
    )

    if (unseenProducts.length === 0) return

    const impressionPayload = unseenProducts.map((product) => ({
      id: product.id,
      name: product.title,
      title: product.title,
      category: product.facets.category,
      price: product.price,
      retailer: product.merchant || product.source,
    }))

    AnalyticsEvents.productImpressions(impressionPayload, analyticsListName)

    unseenProducts.forEach((product) => {
      trackedImpressions.current.add(product.id)
      void PerformanceInsightsService.trackImpression(
        product.id,
        buildProgrammaticSourceDescriptor(variantSlug, 'grid', product)
      )
    })
  }, [analyticsListName, displayProducts, variantSlug])

  useEffect(() => {
    if (!editorPickProducts.length) return

    const unseen = editorPickProducts.filter(
      (pick) => !trackedEditorImpressions.current.has(pick.product.id)
    )

    if (unseen.length === 0) return

    const editorListName = `${analyticsListName}:editors`
    const payload = unseen.map(({ product }) => ({
      id: product.id,
      name: product.title,
      title: product.title,
      category: product.facets.category,
      price: product.price,
      retailer: product.merchant || product.source,
    }))

    AnalyticsEvents.productImpressions(payload, editorListName)

    unseen.forEach(({ product }) => {
      trackedEditorImpressions.current.add(product.id)
      void PerformanceInsightsService.trackImpression(
        product.id,
        buildProgrammaticSourceDescriptor(variantSlug, 'editor', product)
      )
    })
  }, [analyticsListName, editorPickProducts, variantSlug])

  useEffect(() => {
    if (!retailerSpotlightConfig || !retailerSpotlightProducts.length) return

    const unseen = retailerSpotlightProducts.filter(
      (product) => !trackedSpotlightImpressions.current.has(product.id)
    )

    if (!unseen.length) return

    const listName = `${analyticsListName}:retailer-spotlight`
    const analyticsPayload = unseen.map((product) => ({
      id: product.id,
      name: product.title,
      title: product.title,
      category: product.category || 'Retailer spotlight',
      price: product.price,
      retailer: product.merchant || retailerSpotlightConfig.partnerName,
      affiliateUrl: product.affiliateLink,
    }))

    AnalyticsEvents.productImpressions(analyticsPayload, listName)

    const descriptor =
      retailerSpotlightPerformanceSource ||
      `programmatic:${variantSlug}:spotlight:${retailerSpotlightConfig.feedId}`

    unseen.forEach((product) => {
      trackedSpotlightImpressions.current.add(product.id)
      if (descriptor) {
        void PerformanceInsightsService.trackImpression(product.id, descriptor)
      }
    })
  }, [
    analyticsListName,
    retailerSpotlightConfig,
    retailerSpotlightPerformanceSource,
    retailerSpotlightProducts,
    variantSlug,
  ])

  if (loading) {
    return (
      <Container>
        <div className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Cadeaugids laden...</p>
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
              onClick={() => navigateTo('cadeausHub')}
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
      <JsonLd data={schemaData.breadcrumb} />
      {schemaData.itemList && <JsonLd data={schemaData.itemList} />}
      {schemaData.faq && <JsonLd data={schemaData.faq} />}

      <div className="py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-10 md:mb-14 rounded-3xl bg-gradient-to-br from-primary/5 via-white to-white p-6 md:p-10 border border-primary/10 shadow-sm">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
                Programmatic cadeaugids
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {pageTitle}
              </h1>
              <p className="text-lg md:text-xl text-gray-700 max-w-4xl">{pageIntro}</p>
            </div>

            {/* Stats Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                {totalProductCount} cadeau ideeën
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
                {index.stats?.uniqueBrands ?? '—'} merken
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-semibold">
                €{index.stats?.priceRange ? Math.round(index.stats.priceRange[0]) : '—'} - €
                {index.stats?.priceRange ? Math.round(index.stats.priceRange[1]) : '—'}
              </span>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4 mt-2">
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Gecheckt op voorraad
              </span>
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Dagelijks geupdate
              </span>
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Veilig betalen bij partner
              </span>
            </div>

            {/* Context badges */}
            {infoBadges.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {infoBadges.map((badge) => (
                  <div
                    key={`${badge.label}-${badge.value}`}
                    className="bg-white/80 rounded-2xl border border-gray-100 px-4 py-3 shadow-sm"
                  >
                    <p className="text-xs uppercase text-gray-500 tracking-wide">{badge.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{badge.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Highlights */}
            {config?.highlights && config.highlights.length > 0 && (
              <ul className="space-y-2">
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

            {showSinterklaasNotice && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 text-amber-900 text-sm font-medium border border-amber-100">
                🎁 Deze Sinterklaas selectie wordt nog aangevuld. Laat ons weten wat je mist!
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <a
                href="#cadeau-grid"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition"
              >
                Bekijk {totalProductCount} cadeau ideeën
              </a>
              <button
                type="button"
                onClick={() => navigateTo('cadeausHub')}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold bg-white hover:bg-gray-50"
              >
                Andere gidsen
              </button>
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title: pageTitle,
                        text: pageIntro,
                        url: window.location.href,
                      })
                      .catch(console.error)
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    window.alert('Link gekopieerd naar klembord!')
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary transition"
                aria-label="Deel deze gids"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            </div>

            {lastUpdatedLabel && (
              <p className="text-sm text-gray-500">Laatste update: {lastUpdatedLabel}</p>
            )}
          </div>
        </div>

        {retailerSpotlightConfig && (
          <section className="mb-12 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-white to-white p-6 md:p-10 shadow-[0_25px_65px_-45px_rgba(15,23,42,0.65)]">
            <div className="flex flex-col gap-8 lg:flex-row">
              <div className="lg:w-5/12 space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {retailerSpotlightConfig.eyebrow || 'Partner spotlight'}
                  </span>
                  {retailerSpotlightConfig.badge && (
                    <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-primary shadow-sm">
                      {retailerSpotlightConfig.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    {retailerSpotlightConfig.partnerName}
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                    {retailerSpotlightConfig.title}
                  </h2>
                </div>
                <p className="text-base text-gray-700">{retailerSpotlightConfig.description}</p>

                {retailerSpotlightConfig.highlights &&
                  retailerSpotlightConfig.highlights.length > 0 && (
                    <ul className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                      {retailerSpotlightConfig.highlights.map((item, index) => (
                        <li key={`retailer-highlight-${index}`} className="flex items-start gap-2">
                          <span className="mt-1 text-primary">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                {retailerSpotlightConfig.metrics && retailerSpotlightConfig.metrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {retailerSpotlightConfig.metrics.map((metric, index) => (
                      <div
                        key={`retailer-metric-${metric.label}-${index}`}
                        className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm"
                      >
                        <p className="text-xs uppercase text-gray-500">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {retailerSpotlightConfig.ctas && retailerSpotlightConfig.ctas.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {retailerSpotlightConfig.ctas.map((cta, index) => (
                      <a
                        key={`retailer-cta-${cta.href}-${index}`}
                        href={cta.href}
                        className={
                          cta.variant === 'secondary'
                            ? 'inline-flex items-center justify-center rounded-full border border-primary/40 px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5'
                            : 'inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5'
                        }
                      >
                        {cta.label}
                      </a>
                    ))}
                  </div>
                )}

                {retailerSpotlightConfig.giftGuides &&
                  retailerSpotlightConfig.giftGuides.length > 0 && (
                    <div className="rounded-2xl border border-primary/10 bg-white/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                        Gekoppelde gidsen
                      </p>
                      <div className="space-y-2">
                        {retailerSpotlightConfig.giftGuides.map((guide, index) => (
                          <a
                            key={`retailer-guide-${guide.href}-${index}`}
                            href={guide.href}
                            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-primary/40 hover:text-primary"
                          >
                            <span>
                              {guide.badge && (
                                <span className="mr-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                  {guide.badge}
                                </span>
                              )}
                              {guide.title}
                            </span>
                            <span aria-hidden className="text-primary">
                              →
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="lg:w-7/12 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Feed {retailerSpotlightConfig.feedId}
                    </p>
                    <p className="text-sm text-gray-700">
                      Dagverse selectie uit AWIN (
                      {retailerSpotlightConfig.cardLimit ?? (retailerSpotlightProducts.length || 0)}
                      {` kaarten maximaal`}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden />
                    Live ingest
                  </div>
                </div>

                {retailerSpotlightLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: retailerSpotlightConfig.cardLimit ?? 4 }).map(
                      (_, index) => (
                        <div
                          key={`retailer-skeleton-${index}`}
                          className="rounded-2xl border border-gray-100 bg-white/70 p-4 animate-pulse"
                        >
                          <div className="mb-4 h-40 rounded-xl bg-gray-100" />
                          <div className="mb-2 h-4 rounded bg-gray-100" />
                          <div className="mb-2 h-4 rounded bg-gray-100 w-2/3" />
                          <div className="h-5 rounded-full bg-gray-100 w-1/2" />
                        </div>
                      )
                    )}
                  </div>
                )}

                {!retailerSpotlightLoading && retailerSpotlightError && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {retailerSpotlightError}
                  </div>
                )}

                {!retailerSpotlightLoading &&
                  !retailerSpotlightError &&
                  retailerSpotlightProducts.length === 0 && (
                    <div className="rounded-2xl border border-gray-100 bg-white/80 p-6 text-sm text-gray-700">
                      Geen partnerproducten matchen de ingestfilters op dit moment.
                    </div>
                  )}

                {!retailerSpotlightLoading && retailerSpotlightProducts.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {retailerSpotlightProducts.map((product, index) => (
                      <RetailerSpotlightCard
                        key={product.id}
                        product={product}
                        variantSlug={variantSlug}
                        position={index + 1}
                        onClick={handleRetailerSpotlightClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {editorPickProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Favorieten van de redactie</h2>
                <p className="text-gray-600">
                  Handgeplukte tips voor dit thema. Perfect als je snel wilt kiezen.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <span
                  className="w-2 h-2 rounded-full bg-primary animate-pulse"
                  aria-hidden="true"
                />
                Verified door Gifteez
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {editorPickProducts.slice(0, 3).map((pick, idx) => (
                <ProductCard
                  key={`${pick.product.id}-editor`}
                  product={pick.product}
                  spotlightReason={pick.reason}
                  variantSlug={variantSlug}
                  position={idx + 1}
                  context="editor"
                />
              ))}
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section className="relative">
          <div className="sticky top-20 z-30 mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-sm backdrop-blur-md transition-all duration-300">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Selectie in deze gids
                </p>
                <p className="text-sm text-gray-700">
                  {displayProducts.length} van {index.products.length} producten zichtbaar
                  {fastDeliveryOnly && ' • gefilterd op snelle levering'}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={fastDeliveryOnly}
                    onChange={(event) => setFastDeliveryOnly(event.target.checked)}
                  />
                  Alleen snelle levering (≤ 2 dagen)
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  Sorteer op
                  <select
                    value={sortOption}
                    onChange={(event) => setSortOption(event.target.value as SortOption)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm focus:border-primary focus:outline-none"
                  >
                    <option value="featured">Uitgelicht</option>
                    <option value="price-asc">Laagste prijs eerst</option>
                    <option value="price-desc">Hoogste prijs eerst</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Price Filters */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              {(Object.keys(PRICE_FILTER_LABELS) as PriceFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPriceFilter(filter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    priceFilter === filter
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {PRICE_FILTER_LABELS[filter]}
                </button>
              ))}
            </div>
          </div>

          {displayProducts.length === 0 ? (
            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-8 text-center">
              <p className="text-lg font-semibold text-amber-900 mb-2">
                Geen producten matchen deze filters
              </p>
              <p className="text-amber-800 mb-4">
                Probeer de filter voor snelle levering uit te zetten of kies een andere sortering.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFastDeliveryOnly(false)
                  setSortOption('featured')
                  setPriceFilter('all')
                }}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary shadow"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div
              id="cadeau-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {displayProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variantSlug={variantSlug}
                  position={index + 1}
                  context="grid"
                />
              ))}
            </div>
          )}
        </section>

        {/* FAQs */}
        {config?.faq && config.faq.length > 0 && (
          <section className="mt-16 rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Nog vragen?
                </p>
                <h2 className="text-2xl font-bold text-gray-900">Veelgestelde vragen</h2>
                <p className="text-sm text-gray-600">
                  Snel antwoord op twijfels over levering, budget of retourbeleid. Cadeaucoach (AI)
                  gebruikt dezelfde informatie om je suggesties slimmer te maken.
                </p>
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                  <p className="text-sm font-semibold text-primary">Extra hulp nodig?</p>
                  <p className="text-sm text-primary/80">
                    Start Cadeaucoach en krijg binnen 30 seconden een shortlist met cadeaus.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo('giftFinder')}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 transition"
                  >
                    Cadeaucoach starten
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {config.faq.map((item, i) => (
                  <details
                    key={i}
                    className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between text-left font-semibold text-gray-900">
                      <span>{item.q}</span>
                      <span
                        aria-hidden
                        className="ml-4 text-primary transition duration-200 group-open:rotate-180"
                      >
                        ⌃
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-gray-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {config?.internalLinks && config.internalLinks.length > 0 && (
          <section className="mt-16">
            <div className="rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm">
              <div className="flex flex-col gap-3 mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Verder browsen
                </p>
                <h2 className="text-2xl font-bold text-gray-900">Andere gidsen bij dit thema</h2>
                <p className="text-sm text-gray-600">
                  Verken aanvullende cadeaulijsten voor ontvangers met vergelijkbaar budget of
                  gelegenheid.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {config.internalLinks.map((link) => {
                  // Try to find the config for this link to show a visual card
                  const slug = link.href.split('/').pop()
                  const linkedConfig = slug ? PROGRAMMATIC_INDEX[slug] : null

                  if (linkedConfig) {
                    return <GuideCard key={link.href} config={linkedConfig} />
                  }

                  // Fallback to text link if no config found
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-primary/40 hover:bg-white hover:text-primary"
                    >
                      {link.label}
                      <span aria-hidden className="transition group-hover:translate-x-1">
                        →
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Mobile Floating Action Button - Cadeaucoach */}
      <button
        onClick={() => navigateTo('giftFinder')}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 transition hover:scale-105 active:scale-95 md:hidden"
      >
        <span className="text-lg">🤖</span>
        <span>Cadeau Hulp?</span>
      </button>
    </Container>
  )
}

// ==================== Retailer Spotlight Card ====================

interface RetailerSpotlightCardProps {
  product: RetailerSpotlightProduct
  variantSlug: string
  position: number
  onClick: (product: RetailerSpotlightProduct, position: number, affiliateUrl: string) => void
}

const RetailerSpotlightCard: React.FC<RetailerSpotlightCardProps> = ({
  product,
  variantSlug,
  position,
  onClick,
}) => {
  const affiliateUrl = withAffiliate(product.affiliateLink, {
    retailer: product.merchant?.toLowerCase() || 'awin',
    pageType: 'programmatic-guide',
    placement: 'retailer-spotlight-card',
    theme: variantSlug,
    cardIndex: position,
  })

  const handleClick = () => {
    onClick(product, position, affiliateUrl)
  }

  const shortDescription = product.description ? `${product.description}`.slice(0, 120) : null

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className="group flex h-full flex-col gap-3 rounded-3xl border border-gray-100 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-2xl"
    >
      <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gray-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-primary shadow">
          Spot
        </span>
      </div>

      {product.brand && (
        <p className="text-xs uppercase tracking-wide text-gray-500">{product.brand}</p>
      )}

      <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-primary">
        {product.title}
      </h3>

      {shortDescription && <p className="text-sm text-gray-500 line-clamp-2">{shortDescription}</p>}

      <div className="mt-auto flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">€{product.price.toFixed(2)}</p>
          <p className="text-xs text-gray-500">{product.currency}</p>
        </div>
        <div className="text-right text-xs font-semibold text-gray-600">
          <p>via {formatMerchantName(product.merchant)}</p>
          <span className="text-primary">→</span>
        </div>
      </div>
    </a>
  )
}

// ==================== Product Card ====================

interface ProductCardProps {
  product: ClassifiedProduct
  spotlightReason?: string
  variantSlug: string
  position: number
  context: 'editor' | 'grid'
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

function ProductCard({
  product,
  spotlightReason,
  variantSlug,
  position,
  context,
}: ProductCardProps) {
  const originalPrice = typeof product.originalPrice === 'number' ? product.originalPrice : null
  const hasDiscount = originalPrice !== null && originalPrice > product.price
  const discountPercentage =
    hasDiscount && originalPrice !== null
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0
  const primaryImage = product.images?.[0]
  const performanceSource = buildProgrammaticSourceDescriptor(variantSlug, context, product)

  // Add affiliate tracking to product URL
  const affiliateUrl = withAffiliate(product.url, {
    retailer: product.merchant?.toLowerCase() || product.source,
    pageType: 'programmatic-guide',
    placement: context === 'editor' ? 'editor-pick-card' : 'product-card',
    theme: variantSlug,
    cardIndex: position,
  })

  const handleAffiliateClick = () => {
    const analyticsProduct = {
      id: product.id,
      name: product.title,
      title: product.title,
      category: product.facets.category,
      price: product.price,
      retailer: product.merchant || product.source,
      affiliateUrl,
    }

    AnalyticsEvents.clickAffiliate(
      analyticsProduct,
      'programmatic-guide',
      context === 'editor' ? 'editor-pick' : 'grid',
      position
    )

    void PerformanceInsightsService.trackClick(product.id, performanceSource)
  }

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleAffiliateClick}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50">
        {primaryImage ? (
          <img
            src={primaryImage}
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

        {spotlightReason && (
          <div className="absolute top-3 left-3 bg-white/90 text-primary px-3 py-1 rounded-full text-xs font-semibold shadow">
            {spotlightReason}
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
          {hasDiscount && originalPrice !== null && (
            <span className="text-sm text-gray-400 line-through">€{originalPrice.toFixed(2)}</span>
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

        {/* Source & CTA */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500 truncate">
            Via {formatMerchantName(product.merchant)}
          </span>
          <span className="shrink-0 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            Bekijk aanbod
          </span>
        </div>
      </div>
    </a>
  )
}

export default ProgrammaticLandingPage
