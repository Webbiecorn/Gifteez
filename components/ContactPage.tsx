import React, { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { MailIcon, CheckCircleIcon } from './IconComponents'
import Meta from './Meta'
import type { NavigateTo, ContactMessage, ShowToast } from '../types'

interface ContactPageProps {
  navigateTo: NavigateTo
  showToast?: ShowToast
}

export const ContactPage: React.FC<ContactPageProps> = ({ navigateTo, showToast }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!name.trim()) {
      setError('Vul je naam in')
      setLoading(false)
      return
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Vul een geldig e-mailadres in')
      setLoading(false)
      return
    }

    if (!message.trim() || message.trim().length < 10) {
      setError('Je bericht moet minimaal 10 karakters bevatten')
      setLoading(false)
      return
    }

    try {
      // Save to Firestore (will trigger email via Cloud Function)
      const messageData: Omit<ContactMessage, 'id' | 'createdAt'> & {
        createdAt: ReturnType<typeof serverTimestamp>
      } = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim() || undefined,
        message: message.trim(),
        createdAt: serverTimestamp(),
        read: false,
        replied: false,
      }

      await addDoc(collection(db, 'contact_messages'), messageData)

      setSuccess(true)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')

      showToast?.('Bericht verzonden! 🎉 We nemen snel contact met je op.', 'success')

      // Reset success message after 5 seconds
      window.setTimeout(() => setSuccess(false), 5000)
    } catch (err: unknown) {
      console.error('Contact form error:', err)
      setError('Er ging iets mis. Probeer het opnieuw of stuur een email naar info@gifteez.nl')
      showToast?.('Versturen mislukt. Probeer het opnieuw.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Meta
        title="Contact - Gifteez"
        description="Heb je een vraag of opmerking? Neem contact met ons op. We helpen je graag verder met al je cadeau-vragen!"
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
        {/* Hero Section - Modern Design */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 min-h-[60vh] flex items-center">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating sparkles */}
            <div className="absolute top-[20%] left-[12%] animate-float-slow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                  fill="#a855f7"
                  fillOpacity="0.3"
                />
              </svg>
            </div>
            <div className="absolute top-[15%] right-[18%] animate-float-delayed">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                  fill="#ec4899"
                  fillOpacity="0.35"
                />
              </svg>
            </div>
            <div className="absolute bottom-[25%] left-[15%] animate-float-slow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                  fill="#f43f5e"
                  fillOpacity="0.4"
                />
              </svg>
            </div>
            <div className="absolute top-[35%] right-[10%] animate-float-delayed">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                  fill="#a855f7"
                  fillOpacity="0.35"
                />
              </svg>
            </div>

            {/* Gradient glows */}
            <div className="absolute top-[15%] right-[25%] w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-[20%] left-[20%] w-72 h-72 bg-pink-300/20 rounded-full blur-3xl animate-pulse-slower" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-16 md:py-20 w-full">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white shadow-lg border border-purple-200 px-5 py-2.5 mb-6 animate-fade-in-up">
                <MailIcon className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  We helpen je graag
                </span>
              </div>

              {/* Heading */}
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-up">
                <span className="block text-gray-900 mb-2">Neem contact</span>
                <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                  met ons op
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
                Heb je een vraag, suggestie of opmerking?
                <span className="font-semibold text-purple-600"> We horen graag van je!</span>
              </p>

              {/* Contact cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-4 shadow-lg">
                    <MailIcon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
                  <a
                    href="mailto:info@gifteez.nl"
                    className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                  >
                    info@gifteez.nl
                  </a>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-pink-100 hover:border-pink-300 transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl mb-4 shadow-lg">
                    <span className="text-3xl">⏱️</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Reactietijd</h3>
                  <p className="text-gray-700 font-semibold">Binnen 24 uur</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-rose-100 hover:border-rose-300 transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl mb-4 shadow-lg">
                    <span className="text-3xl">💬</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Support</h3>
                  <p className="text-gray-700 font-semibold">Ma - Vr, 9:00 - 17:00</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {success ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Bericht verzonden! 🎉</h2>
              <p className="text-lg text-gray-600 mb-6">
                Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-rose-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Verstuur nog een bericht
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Naam *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Je volledige naam"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Onderwerp (optioneel)
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Waar gaat je bericht over?"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Bericht *
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Vertel ons wat je op je hart hebt..."
                  rows={6}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                  disabled={loading}
                />
                <p className="mt-2 text-sm text-gray-500">Minimaal 10 karakters</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary to-rose-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MailIcon className="w-5 h-5" />
                {loading ? 'Verzenden...' : 'Verstuur Bericht'}
              </button>

              <p className="mt-4 text-sm text-gray-500 text-center">
                Door te versturen ga je akkoord met onze{' '}
                <button
                  type="button"
                  onClick={() => navigateTo('privacy')}
                  className="underline hover:text-primary transition-colors"
                >
                  privacyverklaring
                </button>
              </p>
            </form>
          )}

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Veelgestelde Vragen
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🎁 Hoe werkt de GiftFinder?
                </h3>
                <p className="text-gray-600 text-sm">
                  Onze AI-aangedreven GiftFinder helpt je in 30 seconden het perfecte cadeau vinden.
                  Vul simpelweg je voorkeuren in en krijg gepersonaliseerde suggesties.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  💰 Zijn jullie producten goedkoper?
                </h3>
                <p className="text-gray-600 text-sm">
                  We tonen producten van diverse retailers inclusief affiliate links. De prijs is
                  hetzelfde, maar wij verdienen een kleine commissie die ons helpt gratis te
                  blijven.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📦 Leveren jullie zelf?
                </h3>
                <p className="text-gray-600 text-sm">
                  Nee, wij zijn een inspiratie platform. Je bestelt direct bij de retailer (zoals
                  Amazon of Coolblue) waar je het product hebt gevonden.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ✉️ Nieuwsbrief aanmelden?
                </h3>
                <p className="text-gray-600 text-sm">
                  Scroll naar de footer en meld je aan voor wekelijkse cadeau-tips, deals en
                  inspiratie direct in je inbox!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactPage
