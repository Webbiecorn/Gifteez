import React from 'react'
import { FireIcon } from './IconComponents'

// TrendingDownIcon component (not in main IconComponents yet)
const TrendingDownIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
    />
  </svg>
)

interface PriceDropAlertProps {
  productName: string
  oldPrice?: string
  newPrice: string
  percentageOff?: number
  daysAgo?: number
}

const PriceDropAlert: React.FC<PriceDropAlertProps> = ({
  productName,
  oldPrice,
  newPrice,
  percentageOff,
  daysAgo = 3,
}) => {
  // Only show if we have price drop data
  if (!oldPrice && !percentageOff) return null

  const discount = percentageOff || calculateDiscount(oldPrice, newPrice)

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-4 shadow-lg">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-teal-400/10 to-cyan-400/10 animate-pulse" />

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg animate-bounce-slow">
            <TrendingDownIcon className="h-7 w-7" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">
              <FireIcon className="h-3.5 w-3.5" />
              PRIJS GEDAALD
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              {daysAgo} {daysAgo === 1 ? 'dag' : 'dagen'} geleden
            </span>
          </div>

          <h3 className="mb-2 font-display text-lg font-bold text-slate-900">
            Dit product is nu goedkoper!
          </h3>

          <p className="mb-3 text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-900">{productName}</span> is recent{' '}
            <span className="font-bold text-emerald-700">{discount}% goedkoper</span> geworden.
            Grijp deze kans!
          </p>

          {/* Price comparison */}
          <div className="flex flex-wrap items-center gap-3">
            {oldPrice && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Was:</span>
                <span className="rounded-lg bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 line-through">
                  {oldPrice}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700 font-semibold">Nu:</span>
              <span className="rounded-lg bg-emerald-600 px-3 py-1.5 text-base font-bold text-white shadow-md">
                {newPrice}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-400 to-red-500 px-3 py-1 text-sm font-bold text-white shadow-md">
              <span>-{discount}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgency indicator */}
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 backdrop-blur-sm">
        <svg
          className="h-4 w-4 text-orange-600 animate-pulse"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xs font-semibold text-slate-700">
          Prijzen kunnen elk moment weer stijgen
        </span>
      </div>
    </div>
  )
}

// Helper function to calculate discount percentage
function calculateDiscount(oldPrice?: string, newPrice?: string): number {
  if (!oldPrice || !newPrice) return 0

  const oldValue = parseFloat(oldPrice.replace(/[^0-9.]/g, ''))
  const newValue = parseFloat(newPrice.replace(/[^0-9.]/g, ''))

  if (!oldValue || !newValue) return 0

  return Math.round(((oldValue - newValue) / oldValue) * 100)
}

export default PriceDropAlert

// Add to global CSS
/*
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}
*/
