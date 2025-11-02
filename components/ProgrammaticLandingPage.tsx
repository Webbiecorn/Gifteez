import React, { useEffect, useMemo, useState } from 'react'
import { PROGRAMMATIC_INDEX, type ProgrammaticConfig } from '../data/programmatic'
import { withAffiliate } from '../services/affiliate'
import { DynamicProductService } from '../services/dynamicProductService'
import JsonLd from './JsonLd'
import Container from './layout/Container'
import type { DealItem, NavigateTo } from '../types'

interface Props {
  variantSlug: string
  navigateTo: NavigateTo
}

const ProgrammaticLandingPage: React.FC<Props> = ({ variantSlug }) => {
  const config: ProgrammaticConfig | undefined = PROGRAMMATIC_INDEX[variantSlug]
  const [items, setItems] = useState<DealItem[]>([])

  const pageTitle = config?.title ?? 'Cadeau ideeën — Programmatic'
  const pageIntro = config?.intro ?? ''

  useEffect(() => {
    const run = async () => {
      const filters: NonNullable<ProgrammaticConfig['filters']> = {
        ...(config?.filters ?? {}),
      }
      const maxPrice = filters.maxPrice ?? config?.budgetMax
      const keywordList = (filters.keywords ?? [])
        .concat([config?.occasion ?? '', config?.recipient ?? '', config?.interest ?? ''])
        .filter(Boolean)
        .map((k) => k.toLowerCase())
      const boostKeywords = (filters.boostKeywords ?? []).map((k) => k.toLowerCase())
      const excludeKeywords = (filters.excludeKeywords ?? []).map((k) => k.toLowerCase())
      const excludeMerchants = (filters.excludeMerchants ?? [])
        .map((m) => m.trim().toLowerCase())
        .filter(Boolean)
      const preferredMerchants = (filters.preferredMerchants ?? [])
        .map((m) => m.trim().toLowerCase())
        .filter(Boolean)

      let results: DealItem[] = []
      try {
        if (typeof maxPrice === 'number' && !isNaN(maxPrice)) {
          // Haal een ruimer aanbod op en scoor daarna op relevantie i.p.v. hard filteren
          const priced = await DynamicProductService.getProductsByPriceRange(0, maxPrice, 120)

          // Filter duplicaten op basis van productnaam (case-insensitive)
          const seenNames = new Set<string>()
          const unique = priced.filter((p) => {
            const normalized = p.name.toLowerCase().trim()
            if (seenNames.has(normalized)) return false
            seenNames.add(normalized)
            return true
          })

          const scored = unique
            .map((p) => {
              const base = p.giftScore ?? 7
              const hay =
                `${p.name} ${p.description} ${(p.tags || []).join(' ')} ${p.merchant ?? ''} ${p.brand ?? ''}`.toLowerCase()
              let bonus = 0

              const merchantName = (p.merchant || p.brand || '').toLowerCase()

              if (excludeMerchants.length && merchantName) {
                const isExcluded = excludeMerchants.some(
                  (term) => merchantName === term || merchantName.includes(term)
                )
                if (isExcluded) {
                  return { p, score: -999 }
                }
              }

              if (excludeKeywords.length) {
                const hasExcludedKeyword = excludeKeywords.some((kw) => kw && hay.includes(kw))
                if (hasExcludedKeyword) {
                  return { p, score: -999 }
                }
              }

              // Exclude obvious men's products when searching for "haar"
              const isMensProduct =
                hay.includes('mannen') ||
                hay.includes('heren') ||
                hay.includes('voor hem') ||
                hay.includes("men's") ||
                hay.includes('man ') ||
                (hay.includes('riem') && hay.includes('jeans')) // Belt specific

              if (keywordList.length) {
                for (const kw of keywordList) {
                  if (!kw) continue

                  // Special handling voor 'haar' (her/woman, not hair)
                  if (kw === 'haar') {
                    // Skip men's products entirely
                    if (isMensProduct) {
                      return { p, score: -999 } // Exclude completely
                    }

                    // Boost women's products
                    if (
                      hay.includes('vrouw') ||
                      hay.includes('woman') ||
                      hay.includes('dames') ||
                      hay.includes('ladies') ||
                      hay.includes('voor haar') ||
                      hay.includes('girl')
                    ) {
                      bonus += 3
                    }

                    // Penalty voor haarproducten als we zoeken naar "voor haar"
                    if (
                      hay.includes('shampoo') ||
                      hay.includes('conditioner') ||
                      hay.includes('haarverzorging') ||
                      hay.includes('hair care')
                    ) {
                      bonus -= 2
                    }
                  } else if (hay.includes(kw)) {
                    bonus += 1
                  }
                }
              }

              if (boostKeywords.length) {
                for (const kw of boostKeywords) {
                  if (kw && hay.includes(kw)) {
                    bonus += 1.5
                  }
                }
              }

              if (preferredMerchants.length && merchantName) {
                if (
                  preferredMerchants.some(
                    (term) => merchantName === term || merchantName.includes(term)
                  )
                ) {
                  bonus += 2
                }
              }

              // Specifieke boosts
              if (hay.includes('kerst') || hay.includes('christmas')) bonus += 1
              if (
                hay.includes('man') ||
                hay.includes('heren') ||
                hay.includes('mannen') ||
                hay.includes('men ') ||
                hay.includes('voor hem') ||
                hay.includes('his')
              )
                bonus += 1
              if (p.isOnSale) bonus += 0.5

              return { p, score: base + bonus }
            })
            .filter(({ score }) => score > 0) // Remove excluded products
            .sort((a, b) => b.score - a.score)
            .slice(0, 48)
            .map(({ p }) => p)

          results = scored
        } else if (keywordList.length) {
          const joined = keywordList.join(' ')
          results = await DynamicProductService.searchProducts(joined, 48)
        } else {
          results = await DynamicProductService.getTopDeals(20)
        }
      } catch {
        results = []
      }

      if (excludeMerchants.length) {
        results = results.filter((item) => {
          const merchantName = (item.merchant || item.brand || '').toLowerCase()
          if (!merchantName) return true
          return !excludeMerchants.some(
            (term) => merchantName === term || merchantName.includes(term)
          )
        })
      }

      if (excludeKeywords.length) {
        results = results.filter((item) => {
          const hay =
            `${item.name} ${item.description} ${(item.tags || []).join(' ')} ${item.merchant ?? ''} ${item.brand ?? ''}`.toLowerCase()
          return !excludeKeywords.some((kw) => kw && hay.includes(kw))
        })
      }

      if (preferredMerchants.length) {
        const preferred: DealItem[] = []
        const others: DealItem[] = []
        results.forEach((item) => {
          const merchantName = (item.merchant || item.brand || '').toLowerCase()
          if (
            merchantName &&
            preferredMerchants.some((term) => merchantName === term || merchantName.includes(term))
          ) {
            preferred.push(item)
          } else {
            others.push(item)
          }
        })
        results = [...preferred, ...others]
      }

      setItems(results)
    }
    run()
  }, [
    variantSlug,
    config?.filters,
    config?.budgetMax,
    config?.occasion,
    config?.recipient,
    config?.interest,
  ])

  // JSON-LD: ItemList + FAQ + Breadcrumbs
  const itemListSchema = useMemo(() => {
    if (!items?.length) return null
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gifteez.nl'
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: pageTitle,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: items.slice(0, 24).map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${baseUrl}/product/${p.id ?? idx}`,
        item: {
          '@type': 'Product',
          name: p.name,
          image: p.image,
          description: p.description,
          brand: p.brand ?? p.merchant ?? 'Partner',
          offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price: (() => {
              const num = parseFloat(
                String(p.price)
                  .replace(/[^0-9,.]/g, '')
                  .replace(',', '.')
              )
              return isNaN(num) ? undefined : num
            })(),
            url: withAffiliate(p.affiliateLink ?? '#', {
              pageType: 'programmatic',
              placement: 'schema',
              abVariant: variantSlug,
            }),
            availability:
              p.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          },
        },
      })),
    }
  }, [items, pageTitle, variantSlug])

  const faqSchema = useMemo(() => {
    if (!config?.faq?.length) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: config.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    }
  }, [config?.faq])

  const breadcrumbSchema = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gifteez.nl'
    const items: { '@type': 'ListItem'; position: number; name: string; item: string }[] = [
      { '@type': 'ListItem', position: 1, name: 'Cadeaus', item: `${baseUrl}/cadeaus` },
    ]
    if (config?.occasion) {
      items.push({
        '@type': 'ListItem',
        position: 2,
        name: config.occasion,
        item: `${baseUrl}/cadeaus/${config.occasion}`,
      })
    }
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: pageTitle,
      item: `${baseUrl}${window.location.pathname}`,
    })
    return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items }
  }, [config?.occasion, pageTitle])

  return (
    <Container>
      <div className="py-8 md:py-12">
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900">
          {pageTitle}
        </h1>
        {pageIntro && (
          <p className="mt-3 md:mt-4 text-base md:text-lg text-gray-600 max-w-3xl">{pageIntro}</p>
        )}

        {config?.highlights?.length ? (
          <ul className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
            {config.highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                >
                  +
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Editor's Picks (optional) */}
        {config?.editorPicks && config.editorPicks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-3">Red Hot Picks</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.editorPicks.map((p, i) => (
                <li
                  key={p.sku + i}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-sm text-gray-700"
                >
                  <div className="font-semibold">{p.sku}</div>
                  {p.reason && <div className="text-gray-500">{p.reason}</div>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Results */}
        <div className="mt-10">
          <h2 className="sr-only">Resultaten</h2>
          {items.length === 0 ? (
            <div className="text-gray-600">We verzamelen geschikte cadeaus…</div>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((deal, index) => (
                <li key={deal.id ?? index} className="h-full">
                  <a
                    href={withAffiliate(deal.affiliateLink ?? '#', {
                      pageType: 'programmatic',
                      placement: 'card-cta',
                      abVariant: variantSlug,
                      cardIndex: index,
                    })}
                    rel="noopener noreferrer sponsored nofollow"
                    target="_blank"
                    className="block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-full"
                  >
                    <div className="aspect-square bg-gray-50 overflow-hidden">
                      <img
                        src={deal.imageUrl || deal.image || '/images/placeholder.png'}
                        alt={deal.name}
                        loading="lazy"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-sm text-gray-500">
                        {deal.merchant ?? deal.brand ?? 'Partner'}
                      </div>
                      <div className="font-semibold text-gray-900 line-clamp-2 min-h-[3.4rem]">
                        {deal.name}
                      </div>
                      <div className="mt-1 text-accent font-bold">
                        {deal.price ?? 'Bekijk prijs'}
                      </div>
                      <div className="mt-2 text-primary text-sm font-semibold">
                        Bekijk bij partner →
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* JSON-LD */}
      {itemListSchema && <JsonLd id={`jsonld-itemlist-${variantSlug}`} data={itemListSchema} />}
      {faqSchema && <JsonLd id={`jsonld-faq-${variantSlug}`} data={faqSchema} />}
      {breadcrumbSchema && (
        <JsonLd id={`jsonld-breadcrumbs-${variantSlug}`} data={breadcrumbSchema} />
      )}
    </Container>
  )
}

export default ProgrammaticLandingPage
