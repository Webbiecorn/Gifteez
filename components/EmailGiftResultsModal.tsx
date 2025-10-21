import React, { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { db } from '../services/firebase'
import { XIcon, MailIcon, CheckCircleIcon } from './IconComponents'

interface EmailGiftResultsModalProps {
  isOpen: boolean
  onClose: () => void
  gifts: Array<{
    title: string
    price: string
    imageUrl: string
    affiliateLink: string
    description?: string
  }>
  searchParams: {
    recipient?: string
    occasion?: string
    budget?: string
  }
}

export const EmailGiftResultsModal: React.FC<EmailGiftResultsModalProps> = ({
  isOpen,
  onClose,
  gifts,
  searchParams,
}) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Vul een geldig e-mailadres in')
      setLoading(false)
      return
    }

    if (!name.trim()) {
      setError('Vul je naam in')
      setLoading(false)
      return
    }

    try {
      const functions = getFunctions()
      const sendGiftFinderResults = httpsCallable(functions, 'sendGiftFinderResults')

      // Prepare gift data
      const giftData = gifts.slice(0, 5).map((gift) => ({
        title: gift.title,
        price: gift.price,
        imageUrl: gift.imageUrl,
        link: gift.affiliateLink,
        description: gift.description,
      }))

      // Send email via Cloud Function
      await sendGiftFinderResults({
        email: email.trim(),
        name: name.trim(),
        recipient: searchParams.recipient || 'je ontvanger',
        occasion: searchParams.occasion || 'deze gelegenheid',
        budget: searchParams.budget || 'jouw budget',
        gifts: giftData,
        subscribeNewsletter,
      })

      // If opted in for newsletter, add to subscribers
      if (subscribeNewsletter) {
        try {
          await addDoc(collection(db, 'newsletter_subscribers'), {
            email: email.toLowerCase().trim(),
            name: name.trim(),
            subscribedAt: serverTimestamp(),
            status: 'active',
            source: 'giftfinder',
            preferences: {
              deals: true,
              blog: true,
              tips: true,
            },
          })
        } catch (err) {
          // Silently fail if already subscribed
          console.log('Newsletter signup skipped (may already exist)')
        }
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setEmail('')
        setName('')
      }, 3000)
    } catch (err: any) {
      console.error('Error sending gift results:', err)
      setError('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          aria-label="Sluiten"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {success ? (
          // Success state
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Email verzonden! 🎉</h3>
            <p className="text-gray-600">Check je inbox voor je persoonlijke cadeau-suggesties.</p>
          </div>
        ) : (
          // Form state
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary to-rose-600 rounded-lg">
                  <MailIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Email deze suggesties</h3>
                  <p className="text-sm text-gray-600">Ontvang je resultaten direct in je inbox</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Naam *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Je naam"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  E-mailadres *
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jouw@email.nl"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  disabled={loading}
                />
              </div>

              {/* Newsletter opt-in */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary/5 to-rose-50 rounded-lg border border-primary/20">
                <input
                  id="newsletter"
                  type="checkbox"
                  checked={subscribeNewsletter}
                  onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  disabled={loading}
                />
                <label htmlFor="newsletter" className="text-sm text-gray-700 cursor-pointer flex-1">
                  <span className="font-semibold">Schrijf me ook in voor de nieuwsbrief</span>
                  <span className="block text-xs text-gray-600 mt-1">
                    Ontvang wekelijks cadeau-tips, deals en inspiratie
                  </span>
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-rose-600 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MailIcon className="w-4 h-4" />
                  {loading ? 'Versturen...' : 'Verstuur Email'}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center pt-2">
                Door te versturen ga je akkoord met onze{' '}
                <a href="/privacy" className="underline hover:text-primary">
                  privacyverklaring
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default EmailGiftResultsModal
