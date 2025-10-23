import React, { useEffect, useState } from 'react'
import { ClockIcon, FireIcon, UsersIcon, CheckIcon } from './IconComponents'

interface StockCounterProps {
  currentStock: number
  totalStock: number
}

export const StockCounter: React.FC<StockCounterProps> = ({ currentStock, totalStock }) => {
  const percentage = (currentStock / totalStock) * 100
  const isLow = percentage < 30
  const isCritical = percentage < 10

  return (
    <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
      <div className="flex items-center gap-2 mb-2">
        <FireIcon className={`h-5 w-5 ${isCritical ? 'text-red-500' : 'text-amber-500'}`} />
        <span className="font-semibold text-slate-900">
          {isCritical ? '🚨 Laatste kans!' : isLow ? '⚠️ Bijna uitverkocht' : 'Op voorraad'}
        </span>
      </div>
      <div className="space-y-2">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isCritical
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : isLow
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-sm text-slate-600">
          Nog maar <span className="font-bold text-slate-900">{currentStock}</span> stuks op
          voorraad
        </p>
      </div>
    </div>
  )
}

interface CountdownTimerProps {
  endTime: Date
  label?: string
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime,
  label = 'Deal eindigt over:',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime()

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ hours, minutes, seconds })
      } else {
        setTimeLeft(null)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  if (!timeLeft) {
    return null
  }

  return (
    <div className="rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 p-4 text-white">
      <div className="flex items-center gap-2 mb-3">
        <ClockIcon className="h-5 w-5" />
        <span className="font-semibold">{label}</span>
      </div>
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="text-xs uppercase tracking-wide mt-1 opacity-90">Uur</div>
          </div>
        </div>
        <div className="flex items-center text-2xl font-bold">:</div>
        <div className="flex-1 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div className="text-xs uppercase tracking-wide mt-1 opacity-90">Min</div>
          </div>
        </div>
        <div className="flex items-center text-2xl font-bold">:</div>
        <div className="flex-1 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div className="text-xs uppercase tracking-wide mt-1 opacity-90">Sec</div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SocialProofBadgeProps {
  viewCount?: number
  purchaseCount?: number
  recentPurchaseMinutes?: number
}

export const SocialProofBadge: React.FC<SocialProofBadgeProps> = ({
  viewCount,
  purchaseCount,
  recentPurchaseMinutes,
}) => {
  return (
    <div className="space-y-2">
      {viewCount && viewCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm border border-blue-200">
          <UsersIcon className="h-4 w-4 text-blue-600" />
          <span className="text-slate-700">
            <span className="font-bold text-blue-600">{viewCount}</span> mensen bekijken dit nu
          </span>
        </div>
      )}

      {purchaseCount && purchaseCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm border border-emerald-200">
          <CheckIcon className="h-4 w-4 text-emerald-600" />
          <span className="text-slate-700">
            Al <span className="font-bold text-emerald-600">{purchaseCount}x</span> verkocht deze
            maand
          </span>
        </div>
      )}

      {recentPurchaseMinutes && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm border border-amber-200 animate-pulse">
          <FireIcon className="h-4 w-4 text-amber-600" />
          <span className="text-slate-700">
            Recent gekocht {recentPurchaseMinutes} minuten geleden
          </span>
        </div>
      )}
    </div>
  )
}

interface TrustBadgesProps {
  freeShipping?: boolean
  returnGuarantee?: boolean
  secureCheckout?: boolean
  customerSupport?: boolean
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({
  freeShipping = true,
  returnGuarantee = true,
  secureCheckout = true,
  customerSupport = false,
}) => {
  const badges = [
    {
      show: freeShipping,
      icon: '🚚',
      text: 'Gratis verzending',
      subtext: 'Vanaf €20',
    },
    {
      show: returnGuarantee,
      icon: '↩️',
      text: '30 dagen retour',
      subtext: 'Niet goed? Geld terug',
    },
    {
      show: secureCheckout,
      icon: '🔒',
      text: 'Veilig betalen',
      subtext: 'SSL beveiligd',
    },
    {
      show: customerSupport,
      icon: '💬',
      text: 'Klantenservice',
      subtext: 'Direct beschikbaar',
    },
  ].filter((badge) => badge.show)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-50 border border-slate-200"
        >
          <div className="text-2xl mb-1">{badge.icon}</div>
          <div className="font-semibold text-xs text-slate-900">{badge.text}</div>
          <div className="text-xs text-slate-500">{badge.subtext}</div>
        </div>
      ))}
    </div>
  )
}
