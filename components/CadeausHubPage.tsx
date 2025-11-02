import React, { useMemo } from 'react'
import Container from './layout/Container'
import JsonLd from './JsonLd'
import type { NavigateTo } from '../types'
import { PROGRAMMATIC_INDEX } from '../data/programmatic'

const CadeausHubPage: React.FC<{ navigateTo: NavigateTo }> = () => {
  const variants = useMemo(() => Object.values(PROGRAMMATIC_INDEX), [])

  const breadcrumbSchema = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gifteez.nl'
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Cadeaus', item: `${baseUrl}/cadeaus` },
      ],
    }
  }, [])

  const itemListSchema = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gifteez.nl'
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Cadeaus voor elk Moment',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: variants.map((v, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${baseUrl}/cadeaus/${v.slug}`,
        item: { '@type': 'WebPage', name: v.title, url: `${baseUrl}/cadeaus/${v.slug}` },
      })),
    }
  }, [variants])

  return (
    <Container>
      <div className="py-8 md:py-12">
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900">
          Cadeaus voor elk Moment
        </h1>
        <p className="mt-3 md:mt-4 text-base md:text-lg text-gray-600 max-w-3xl">
          Van Kerst tot verjaardag, van onder €20 tot luxe geschenken. Kies je moment en ontdek
          direct shoppable cadeaus met filters op budget, snelle levering en duurzaamheid.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {variants.map((v) => (
            <a
              key={v.slug}
              href={`/cadeaus/${v.slug}`}
              className="group block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
              aria-label={`Open ${v.title}`}
            >
              <div className="p-4">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                  {v.occasion || v.interest || 'Thema'}
                </div>
                <div className="font-semibold text-gray-900 group-hover:text-primary transition line-clamp-2 min-h-[3.4rem]">
                  {v.title}
                </div>
                {v.intro && <div className="mt-2 text-sm text-gray-600 line-clamp-3">{v.intro}</div>}
                <div className="mt-3 text-sm font-semibold text-primary">Bekijk pagina →</div>
              </div>
            </a>
          ))}
        </div>

        {/* Productsecties zijn bewust niet zichtbaar op de hub; hier alleen thematische ingangen. */}
      </div>

      <JsonLd id="jsonld-breadcrumbs-cadeaus" data={breadcrumbSchema} />
      <JsonLd id="jsonld-itemlist-cadeaus" data={itemListSchema} />
    </Container>
  )
}

export default CadeausHubPage
