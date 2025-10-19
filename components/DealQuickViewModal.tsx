import React, { useEffect } from 'react'
import { withAffiliate } from '../services/affiliate'
import { XIcon, CheckIcon, StarIcon } from './IconComponents'
import ImageWithFallback from './ImageWithFallback'
import type { DealItem } from '../types'

interface DealQuickViewModalProps {
  deal: DealItem | null
  isOpen: boolean
  onClose: () => void
}

const DealQuickViewModal: React.FC<DealQuickViewModalProps> = ({ deal, isOpen, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || !deal) return null

  const formatPrice = (value: string | undefined) => {
    if (!value) return null
    const cleaned = value.replace(/[^\d,.-]/g, '')
    const num = parseFloat(cleaned.replace(',', '.'))
    if (isNaN(num)) return value
    return `€${num.toFixed(2).replace('.', ',')}`
  }

  const isTopDeal = deal.giftScore && deal.giftScore >= 9
  const isHotDeal = deal.isOnSale && deal.giftScore && deal.giftScore >= 8

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-600 shadow-lg transition-all hover:bg-white hover:text-slate-900 hover:scale-110"
          aria-label="Sluiten"
        >
          <XIcon className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
          {/* Left: Image */}
          <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 relative">
            <ImageWithFallback
              src={deal.imageUrl}
              alt={deal.name}
              className="w-full max-w-md object-contain"
              fit="contain"
            />

            {/* Quality badges in corner */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {isTopDeal && (
                <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-md animate-pulse">
                  ⭐ TOP DEAL
                </div>
              )}
              {isHotDeal && !isTopDeal && (
                <div className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                  🔥 HOT DEAL
                </div>
              )}
              {deal.isOnSale && !isHotDeal && !isTopDeal && (
                <div className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                  SALE
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-4">
            {/* Category tags */}
            {deal.tags && deal.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {deal.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
              {deal.name}
            </h2>

            {/* Gift Score */}
            {deal.giftScore && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(10)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < deal.giftScore! ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {deal.giftScore}/10 Cadeauscore
                </span>
              </div>
            )}

            {/* Description */}
            {deal.description && (
              <p className="text-base text-slate-600 leading-relaxed">{deal.description}</p>
            )}

            {/* Key features */}
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <h3 className="font-semibold text-slate-900">Waarom deze deal?</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Handmatig geselecteerd door ons team</span>
                </li>
                {deal.giftScore && deal.giftScore >= 8 && (
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Hoge cadeauscore - perfect als geschenk</span>
                  </li>
                )}
                {deal.isOnSale && (
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Momenteel in de aanbieding</span>
                  </li>
                )}
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Betrouwbare retailer met goede service</span>
                </li>
              </ul>
            </div>

            {/* Price section */}
            <div className="mt-auto space-y-4 border-t border-slate-200 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-xl font-bold text-white">
                  {formatPrice(deal.price) ?? 'Prijs op aanvraag'}
                </span>
                {deal.originalPrice && (
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Was</span>
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600 font-semibold">
                      <s>{deal.originalPrice}</s>
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={withAffiliate(deal.affiliateLink)}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="flex-1 rounded-xl bg-accent px-6 py-3.5 text-center text-base font-bold text-white shadow-lg transition-all hover:bg-accent-hover hover:shadow-xl hover:scale-105"
                >
                  Bekijk op retailer →
                </a>
                <button
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-semibold transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  Sluiten
                </button>
              </div>

              {/* Trust indicators */}
              <p className="text-xs text-slate-500 text-center">
                * Je wordt doorgestuurd naar de webshop van de retailer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealQuickViewModal
