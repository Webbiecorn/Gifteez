import React, { useEffect, useMemo, useState } from 'react'
import Container from './layout/Container'
import JsonLd from './JsonLd'
import { DynamicProductService } from '../services/dynamicProductService'
import { withAffiliate } from '../services/affiliate'
import type { DealItem, NavigateTo } from '../types'
import { PROGRAMMATIC_INDEX, type ProgrammaticConfig } from '../data/programmatic'

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
      const maxPrice = config?.filters?.maxPrice ?? config?.budgetMax
      const keywordList = (config?.filters?.keywords ?? [])
        .concat([config?.occasion ?? '', config?.recipient ?? '', config?.interest ?? ''])
        .filter(Boolean)
        .map((k) => k.toLowerCase())

      let results: DealItem[] = []
      try {
        if (typeof maxPrice === 'number' && !isNaN(maxPrice)) {
          // Haal een ruimer aanbod op en scoor daarna op relevantie i.p.v. hard filteren
          const priced = await DynamicProductService.getProductsByPriceRange(0, maxPrice, 120)

          const scored = priced
            .map((p) => {
              const base = p.giftScore ?? 7
              const hay = `${p.name} ${p.description} ${(p.tags || []).join(' ')}`.toLowerCase()
              let bonus = 0
              if (keywordList.length) {
                for (const kw of keywordList) {
                  if (kw && hay.includes(kw)) bonus += 1
                }
              }
              // Specifieke boosts voor kerst/hem
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
    }      setItems(results)
    }
    run()
  }, [variantSlug, config?.filters?.maxPrice, config?.budgetMax, config?.filters?.keywords, config?.occasion, config?.recipient, config?.interest])

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
              const num = parseFloat(String(p.price).replace(/[^0-9,.]/g, '').replace(',', '.'))
              return isNaN(num) ? undefined : num
            })(),
            url: withAffiliate(p.affiliateLink ?? '#', {
              pageType: 'programmatic',
              placement: 'schema',
              abVariant: variantSlug,
            }),
            availability: p.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
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
      items.push({ '@type': 'ListItem', position: 2, name: config.occasion, item: `${baseUrl}/cadeaus/${config.occasion}` })
    }
    items.push({ '@type': 'ListItem', position: items.length + 1, name: pageTitle, item: `${baseUrl}${window.location.pathname}` })
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

        {/* Editor's Picks (optional) */}
        {config?.editorPicks && config.editorPicks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-3">Red Hot Picks</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.editorPicks.map((p, i) => (
                <li key={p.sku + i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-sm text-gray-700">
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
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-sm text-gray-500">{deal.merchant ?? deal.brand ?? 'Partner'}</div>
                    <div className="font-semibold text-gray-900 line-clamp-2 min-h-[3.4rem]">{deal.name}</div>
                    <div className="mt-1 text-accent font-bold">{deal.price ?? 'Bekijk prijs'}</div>
                    <div className="mt-2 text-primary text-sm font-semibold">Bekijk bij partner →</div>
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
