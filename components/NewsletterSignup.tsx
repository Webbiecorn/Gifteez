import React, { useEffect, useState } from 'react'
import { EmailNotificationService } from '../services/emailNotificationService'
import { NewsletterService } from '../services/newsletterService'
import type { ShowToast } from '../types'

interface NewsletterSignupProps {
  variant?: 'inline' | 'modal'
  className?: string
  onSuccess?: () => void
  title?: string
  description?: string
  defaultCategories?: string[]
  defaultFrequency?: 'immediate' | 'daily' | 'weekly'
  showToast?: ShowToast
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  variant = 'inline',
  className = '',
  onSuccess,
  title,
  description,
  defaultCategories,
  defaultFrequency,
  showToast,
}) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState<'immediate' | 'daily' | 'weekly'>(
    defaultFrequency ?? 'weekly'
  )
  const [categories, setCategories] = useState<string[]>(defaultCategories ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setFrequency(defaultFrequency ?? 'weekly')
  }, [defaultFrequency])

  useEffect(() => {
    setCategories(defaultCategories ?? [])
  }, [defaultCategories])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    showToast?.(text, type === 'success' ? 'success' : 'error')
    window.setTimeout(() => setMessage(null), 4000)
  }

  const availableCategories = [
    'Verjaardagen',
    'Kerstmis',
    'Valentijnsdag',
    'Moederdag',
    'Vaderdag',
    'Babyshower',
    'Bruiloft',
    'Afstuderen',
    'Sinterklaas',
    'Lifestyle',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      showMessage('error', 'Vul je e-mailadres in')
      return
    }

    setIsLoading(true)

    try {
      const subscriber = await EmailNotificationService.subscribeToNewsletter(
        email,
        name || undefined,
        { frequency, categories }
      )

      await NewsletterService.addSubscriber(subscriber)

      showMessage('success', 'Je bent succesvol aangemeld voor onze nieuwsbrief! 🎉')

      // Reset form
      setEmail('')
      setName('')
      setFrequency(defaultFrequency ?? 'weekly')
      setCategories(defaultCategories ?? [])
      setIsExpanded(false)

      onSuccess?.()
    } catch (error: any) {
      console.error('Newsletter signup error:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      })

      if (error.message === 'Email is already subscribed') {
        showMessage('error', 'Dit e-mailadres is al aangemeld')
      } else {
        // Toon meer details in development
        const errorMsg = error.message || error.toString()
        showMessage('error', `Er ging iets mis: ${errorMsg}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryToggle = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const containerClasses = {
    inline:
      'relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-white via-muted-rose/40 to-white p-6 shadow-[0_20px_45px_-28px_rgba(244,63,94,0.45)]',
    modal: 'relative bg-white p-6 rounded-2xl shadow-lg max-w-md w-full',
  }

  const isInline = variant === 'inline'

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {isInline && (
        <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top,#fda4af22,transparent_55%)]"></div>
      )}
      {/* Message display */}
      {message && (
        <div
          className={`relative z-10 mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-accent/20 bg-accent/10 text-primary'
              : 'border-highlight/20 bg-highlight/10 text-primary'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="relative z-10 mb-4 text-center">
        <h3 className="font-display text-lg font-semibold uppercase tracking-[0.15em] text-primary mb-2">
          {title ?? '📧 Blijf op de hoogte!'}
        </h3>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-primary/70">
          {description ?? 'Ontvang de nieuwste cadeau-ideeën en blog posts direct in je inbox'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Je e-mailadres"
            className="flex-1 rounded-xl border border-muted-rose/70 bg-white/80 px-4 py-3 text-primary placeholder:text-primary/40 outline-none transition-all focus:border-accent/40 focus:ring-2 focus:ring-accent/40"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-accent to-accent-hover px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white shadow-[0_12px_25px_-12px_rgba(244,63,94,0.65)] transition-all hover:shadow-[0_16px_35px_-18px_rgba(244,63,94,0.75)] focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-white ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}
          >
            {isLoading ? 'Even geduld...' : 'Aanmelden'}
          </button>
        </div>

        {/* Advanced preferences toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
        >
          {isExpanded ? '▼ Minder opties' : '▶ Meer opties'}
        </button>

        {isExpanded && (
          <div className="space-y-4 border-t border-muted-rose/60 pt-4">
            {/* Name field */}
            <div>
              <label className="mb-1 block text-sm font-medium text-primary/80">
                Naam (optioneel)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Je naam"
                className="w-full rounded-xl border border-muted-rose/60 bg-white/80 px-3 py-2 text-primary placeholder:text-primary/40 focus:border-accent/40 focus:ring-2 focus:ring-accent/40"
              />
            </div>

            {/* Frequency selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-primary/80">
                Hoe vaak wil je e-mails ontvangen?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'immediate', label: 'Direct bij nieuwe posts' },
                  { value: 'daily', label: 'Dagelijks overzicht' },
                  { value: 'weekly', label: 'Wekelijks overzicht' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      value={option.value}
                      checked={frequency === option.value}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="mr-2 text-accent focus:ring-accent/40"
                    />
                    <span className="text-sm text-primary/80">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-primary/80">
                Interessante categorieën (laat leeg voor alles)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableCategories.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="mr-2 text-accent focus:ring-accent/40"
                    />
                    <span className="text-sm text-primary/80">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
      <p className="relative z-10 mt-4 text-center text-xs text-primary/60">
        Je kunt je op elk moment uitschrijven via de link in onze e-mails
      </p>
    </div>
  )
}

export default NewsletterSignup
