import React, { useEffect, useState } from 'react'
import sampleProductsData from '../data/sampleProducts.json'
import { buildGuidePath } from '../guidePaths'
import type { ProgrammaticConfig } from '../data/programmatic'
import type { ProgrammaticIndex, ClassifiedProduct } from '../utils/product-classifier'

interface GuideCardProps {
  config: ProgrammaticConfig
  displayMode?: 'default' | 'sustainable'
}

const GuideCard: React.FC<GuideCardProps> = ({ config, displayMode = 'default' }) => {
  const [products, setProducts] = useState<ClassifiedProduct[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchProducts = async () => {
      try {
        const response = await fetch(`/programmatic/${config.slug}.json`)
        if (response.ok) {
          const data: ProgrammaticIndex = await response.json()
          if (isMounted) {
            // Get top 3 products
            // Prefer featured products, then regular products
            const allProducts = [...(data.featured || []), ...(data.products || [])]
            setProducts(allProducts.slice(0, 3))
          }
        } else {
          throw new Error('Guide data not found')
        }
      } catch {
        if (isMounted) {
          // Fallback logic using sample data
          const budgetValue = config.budgetMax ?? config.filters?.maxPrice ?? null
          const fallback = sampleProductsData
            .filter((p) => {
              if (budgetValue && p.price > budgetValue) return false
              if (displayMode === 'sustainable') {
                const isSustainable =
                  p.tags.some((t) =>
                    ['duurzaam', 'eco', 'vegan', 'fair trade', 'organic'].some((tag) =>
                      t.includes(tag)
                    )
                  ) ||
                  p.description.toLowerCase().includes('duurzaam') ||
                  p.description.toLowerCase().includes('eco')
                if (!isSustainable) return false
              }
              return true
            })
            .sort((a, b) => (b.giftScore || 0) - (a.giftScore || 0))
            .slice(0, 3)

          const normalizedFallback = fallback.map(
            (p) =>
              ({
                id: p.id,
                title: p.name,
                images: [p.image],
                price: p.price,
                currency: 'EUR',
                source: 'manual',
                url: '',
                // Add other required fields with dummy values if needed
              }) as unknown as ClassifiedProduct
          )

          setProducts(normalizedFallback)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchProducts()

    return () => {
      isMounted = false
    }
  }, [config.slug, config.budgetMax, config.filters?.maxPrice, displayMode])

  const budgetValue = config.budgetMax ?? config.filters?.maxPrice ?? null
  const isSustainable = displayMode === 'sustainable'

  // Styles based on mode
  const badgeBg = isSustainable ? 'bg-emerald-50' : 'bg-indigo-50'
  const badgeText = isSustainable ? 'text-emerald-600' : 'text-indigo-600'
  const cardBg = isSustainable ? 'bg-emerald-50/50' : 'bg-indigo-50/50'
  const cardBorder = isSustainable ? 'border-emerald-100' : 'border-indigo-100'
  const highlightText = isSustainable ? 'text-emerald-600' : 'text-indigo-600'
  const highlightIcon = isSustainable ? '🌱' : '🎯'
  const highlightLabel = isSustainable ? 'Eco Highlights' : 'Top 3 Picks'
  const hoverBorder = isSustainable ? 'hover:border-emerald-300' : 'hover:border-indigo-300'
  const priceText = isSustainable ? 'text-emerald-700' : 'text-indigo-700'
  const countText = isSustainable ? 'text-emerald-600' : 'text-indigo-600'

  return (
    <a
      href={buildGuidePath(config.slug)}
      className="group relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
    >
      <span
        className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${badgeBg} ${badgeText}`}
      >
        {isSustainable ? 'Duurzaam' : (config.interest?.toUpperCase() ?? 'Interesse')}
      </span>
      <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-primary transition line-clamp-2 min-h-[3.4rem]">
        {config.title}
      </h3>
      {config.intro && <p className="mt-3 text-sm text-gray-600 line-clamp-2">{config.intro}</p>}

      {/* Mini-preview */}
      {products.length > 0 && (
        <div className={`mt-4 rounded-lg p-3 border ${cardBg} ${cardBorder}`}>
          <p
            className={`text-[10px] font-bold uppercase tracking-wide mb-3 flex items-center gap-1 ${highlightText}`}
          >
            <span>{highlightIcon}</span>
            <span>{highlightLabel}</span>
          </p>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {products.map((product, idx) => (
              <div
                key={product.id || idx}
                className={`relative rounded-md bg-white border overflow-hidden group hover:border-opacity-100 transition-all aspect-square ${cardBorder} ${hoverBorder}`}
              >
                <img
                  src={product.images?.[0] || ''}
                  alt={product.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {budgetValue && (
            <div className={`pt-2 border-t flex items-center justify-between ${cardBorder}`}>
              <span className={`text-[10px] font-semibold ${priceText}`}>
                💰 Tot €{budgetValue}
              </span>
              <span className={`text-[9px] ${countText}`}>
                {config.filters?.maxResults || 24}+ items
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-semibold text-primary">
        Naar gids
        <span aria-hidden>→</span>
      </div>
    </a>
  )
}

export default GuideCard
