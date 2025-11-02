import React, { useEffect, useState } from 'react'
import Button from './Button'
import { XMarkIcon, SparklesIcon, GiftIcon } from './IconComponents'
import type { DealItem } from '../types'

interface ExitIntentPopupProps {
  topProduct?: DealItem
  onClose: () => void
  onProductClick: (product: DealItem) => void
}

const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({
  topProduct,
  onClose,
  onProductClick,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let hasShown = false
    const handleMouseLeave = (e: MouseEvent) => {
      // Detect mouse leaving viewport at top (going to close tab/window)
      if (e.clientY <= 0 && !hasShown) {
        hasShown = true
        setIsVisible(true)

        // Track exit intent
        if (window.gtag) {
          window.gtag('event', 'exit_intent_shown', {
            event_category: 'engagement',
            event_label: topProduct?.name || 'no_product',
          })
        }
      }
    }

    // Only on desktop
    if (window.innerWidth > 768) {
      document.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [topProduct])

  if (!isVisible || !topProduct) return null

  const handleClose = () => {
    setIsVisible(false)
    onClose()
  }

  const handleProductClick = () => {
    if (window.gtag) {
      window.gtag('event', 'exit_intent_conversion', {
        event_category: 'conversion',
        event_label: topProduct.name,
        value: topProduct.price ? parseFloat(topProduct.price.replace(/[^0-9.]/g, '')) : 0,
      })
    }
    onProductClick(topProduct)
    handleClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl pointer-events-auto animate-scale-in overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-lg transition-all hover:bg-white hover:scale-110"
            aria-label="Sluiten"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* Header gradient */}
          <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 px-6 pt-6 pb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <SparklesIcon className="h-6 w-6 text-white" />
              <h3 className="font-display text-2xl font-bold text-white">Wacht even!</h3>
            </div>
            <p className="text-center text-white/90 text-sm">
              Voordat je gaat... bekijk nog even onze #1 aanbeveling
            </p>
          </div>

          {/* Product card */}
          <div className="p-6">
            <div className="mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
              {/* Top pick badge */}
              <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                <SparklesIcon className="h-3.5 w-3.5" />
                <span>Top Keuze</span>
              </div>

              <div className="p-4 flex gap-4">
                {/* Image */}
                <div className="flex-shrink-0">
                  <img
                    src={topProduct.imageUrl}
                    alt={topProduct.name}
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 text-sm mb-2 line-clamp-2">
                    {topProduct.name}
                  </h4>

                  {topProduct.giftScore && (
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < Math.round((topProduct.giftScore || 0) / 2)
                                ? 'text-amber-400 fill-current'
                                : 'text-slate-300 fill-current'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-slate-600 ml-1">
                        {topProduct.giftScore}/10
                      </span>
                    </div>
                  )}

                  <div className="text-xl font-bold text-rose-600">
                    {topProduct.price || 'Prijs op aanvraag'}
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-4 space-y-2">
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <svg
                  className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Meest gekozen in deze categorie</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <svg
                  className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Uitstekende reviews en hoge kwaliteit</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <svg
                  className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Direct online beschikbaar</span>
              </div>
            </div>

            {/* CTA */}
            <Button
              variant="primary"
              onClick={handleProductClick}
              className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 text-white font-bold py-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <GiftIcon className="h-5 w-5" />
              <span>Bekijk dit cadeau</span>
            </Button>

            <button
              onClick={handleClose}
              className="mt-3 w-full text-center text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Nee bedankt, ik blijf zoeken
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default ExitIntentPopup
