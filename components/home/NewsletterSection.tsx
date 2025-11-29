import React, { useState } from 'react'
import type { FormEvent } from 'react'

interface NewsletterSectionProps {
  onSubmit: (email: string) => void
}

const NewsletterSection: React.FC<NewsletterSectionProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (email && /\S+@\S+\.\S+/.test(email)) {
      onSubmit(email)
    }
  }

  return (
    <section className="relative py-24 bg-slate-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/20 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left side - Content */}
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl mb-6 shadow-lg">
                  <span className="text-3xl">📅</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4">
                  Gratis Cadeau Planner
                </h2>

                <p className="text-white/70 leading-relaxed mb-6">
                  Meld je aan voor onze nieuwsbrief en ontvang direct de{' '}
                  <strong className="text-white">Ultieme Cadeau Planner</strong>. Mis nooit meer een
                  verjaardag!
                </p>

                <ul className="space-y-3 text-sm text-white/60">
                  <li className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-green-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    365 cadeau-ideeën voor het hele jaar
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-green-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Herinneringen voor belangrijke data
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-green-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Exclusieve tips & deals
                  </li>
                </ul>
              </div>

              {/* Right side - Form */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="newsletter-email"
                      className="block text-sm font-medium text-white/80 mb-2"
                    >
                      E-mailadres
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jouw@email.nl"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Download Gratis Planner →
                  </button>
                </form>

                <p className="mt-4 text-xs text-white/40 text-center">
                  Geen spam. Je kunt je altijd uitschrijven.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NewsletterSection
