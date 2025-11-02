import React from 'react'
import { withAffiliate } from '../services/affiliate'
import { SparklesIcon, TagIcon, StarIcon, BookmarkIcon, CheckIcon } from './IconComponents'
import ImageWithFallback from './ImageWithFallback'
import type { DealCategory, DealItem } from '../types'

interface DealsPreviewSectionsProps {
  dealOfWeek: DealItem | null
  topDeals: DealItem[]
  categories: DealCategory[]
}

const DealsPreviewSections: React.FC<DealsPreviewSectionsProps> = ({
  dealOfWeek,
  topDeals,
  categories,
}) => {
  return (
    <div className="space-y-14">
      {dealOfWeek && (
        <div className="grid gap-6 rounded-3xl border border-rose-100 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 p-6 sm:p-10">
            <ImageWithFallback
              src={dealOfWeek.imageUrl}
              alt={dealOfWeek.name}
              className="w-full max-w-[340px] object-contain"
              fit="contain"
            />
          </div>
          <div className="flex flex-col gap-4 p-6 sm:p-10">
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-rose-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              Deal van de week
            </span>
            <h3 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              {dealOfWeek.name}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed sm:text-base">
              {dealOfWeek.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-base font-semibold text-white">
                <TagIcon className="h-4 w-4" aria-hidden="true" />
                {dealOfWeek.price}
              </span>
              {dealOfWeek.originalPrice && (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
                  <s>{dealOfWeek.originalPrice}</s>
                </span>
              )}
              {dealOfWeek.giftScore && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-600">
                  <CheckIcon className="h-4 w-4" aria-hidden="true" />
                  Cadeauscore {dealOfWeek.giftScore}/10
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={withAffiliate(dealOfWeek.affiliateLink, {
                  pageType: 'home',
                  placement: 'preview-spotlight-cta',
                })}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-3 rounded-lg bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-rose-600"
              >
                Bekijk deal
              </a>
              <span className="text-xs text-slate-400">Link opent in een nieuw tabblad</span>
            </div>
          </div>
        </div>
      )}

      {topDeals.length > 0 && (
        <div>
          <div className="mb-6 text-center">
            <StarIcon className="mx-auto h-10 w-10 text-rose-500" aria-hidden="true" />
            <h3 className="mt-4 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              Top 10 cadeaus
            </h3>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Voorbeeld van de huidige topdeals zoals bezoekers ze zien.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {topDeals.map((deal, index) => (
              <div
                key={deal.id}
                className="relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <span className="absolute -left-3 -top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white shadow">
                  #{index + 1}
                </span>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                    <ImageWithFallback
                      src={deal.imageUrl}
                      alt={deal.name}
                      className="h-40 w-full object-contain"
                      fit="contain"
                    />
                  </div>
                  <div className="space-y-2 text-sm text-slate-700">
                    <h4 className="font-semibold text-slate-900 line-clamp-2">{deal.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-3">{deal.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-500">
                        {deal.price}
                      </span>
                      {deal.giftScore && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                          Score {deal.giftScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="space-y-12">
          {categories.map((category, index) => (
            <div key={`${category.title}-${index}`} className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
                  {category.title}
                </h3>
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
                  <BookmarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {category.items.length} producten
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                      <ImageWithFallback
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-40 w-full object-contain"
                        fit="contain"
                      />
                    </div>
                    <div className="space-y-2 text-sm text-slate-700">
                      <h4 className="font-semibold text-slate-900 line-clamp-2">{item.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-3">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-500">
                          {item.price}
                        </span>
                        {item.giftScore && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                            Score {item.giftScore}
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={withAffiliate(item.affiliateLink, {
                        pageType: 'home',
                        placement: 'preview-card-cta',
                      })}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="inline-flex items-center justify-center rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-600"
                    >
                      Bekijk deal
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DealsPreviewSections
