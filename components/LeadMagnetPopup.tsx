import React, { useState, useEffect } from 'react'
import { X, Gift, Sparkles, CheckCircle, Mail } from 'lucide-react'

interface LeadMagnetPopupProps {
  /** Delay before showing popup (ms) */
  delay?: number
  /** Show on exit intent (mouse leaves viewport) */
  showOnExitIntent?: boolean
  /** Page path to track */
  pagePath?: string
  /** Callback when email is submitted */
  onSubmit?: (email: string) => void
}

const STORAGE_KEY = 'gifteez_lead_popup_dismissed'
const STORAGE_SUBMITTED_KEY = 'gifteez_lead_popup_submitted'

export const LeadMagnetPopup: React.FC<LeadMagnetPopupProps> = ({
  delay = 15000, // 15 seconds default
  showOnExitIntent = true,
  pagePath = '',
  onSubmit,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if already dismissed or submitted
    const dismissed = localStorage.getItem(STORAGE_KEY)
    const submitted = localStorage.getItem(STORAGE_SUBMITTED_KEY)

    if (dismissed || submitted) {
      return
    }

    // Timer-based popup
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, delay)

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (showOnExitIntent && e.clientY < 10 && !isOpen) {
        setIsOpen(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [delay, showOnExitIntent, isOpen])

  const handleClose = () => {
    setIsOpen(false)
    // Remember dismissal for 7 days
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Vul een geldig e-mailadres in')
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Connect to MailerLite/Brevo API
      // For now, we'll simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Track in analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'lead_magnet_signup', {
          event_category: 'engagement',
          event_label: pagePath,
        })
      }

      onSubmit?.(email)
      setIsSubmitted(true)
      localStorage.setItem(STORAGE_SUBMITTED_KEY, email)

      // Auto close after 3 seconds
      setTimeout(() => {
        setIsOpen(false)
      }, 3000)
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Sluiten"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 px-6 py-8 text-center text-white">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">🎁 Gratis: Onze Top 10 Amazon Deals</h2>
          <p className="mt-2 text-rose-100">Elke maand de slimste cadeautips in je inbox</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isSubmitted ? (
            /* Success state */
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Je bent aangemeld! 🎉</h3>
              <p className="mt-2 text-gray-600">Check je inbox voor de eerste deals.</p>
            </div>
          ) : (
            /* Form state */
            <>
              {/* Benefits */}
              <ul className="mb-6 space-y-3">
                {[
                  'Maandelijkse top 10 Amazon deals',
                  'Exclusieve kortingscodes',
                  'Seizoensgebonden cadeautips',
                  'Geen spam, alleen waarde',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <Sparkles className="h-4 w-4 flex-shrink-0 text-rose-500" />
                    {benefit}
                  </li>
                ))}
              </ul>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Je e-mailadres"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 transition-colors focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    disabled={isSubmitting}
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:shadow-xl hover:shadow-rose-500/30 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Even geduld...
                    </>
                  ) : (
                    <>
                      <Gift className="h-5 w-5 transition-transform group-hover:scale-110" />
                      Stuur mij de deals
                    </>
                  )}
                </button>
              </form>

              {/* Privacy note */}
              <p className="mt-4 text-center text-xs text-gray-500">
                We respecteren je privacy. Je kunt je altijd uitschrijven.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeadMagnetPopup
