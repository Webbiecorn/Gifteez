import { useState, useEffect } from 'react'
import { initializeAnalyticsWithConsent } from '../services/firebase'
import type { CookiePreferences } from '../components/CookieBanner'

// Extend window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

const COOKIE_CONSENT_KEY = 'gifteez_cookie_consent'
const COOKIE_CONSENT_VERSION = '1.0'

export const useCookieConsent = () => {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null)
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  // Check existing consent on mount
  useEffect(() => {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)

    if (storedConsent) {
      try {
        const consentData = JSON.parse(storedConsent)

        if (consentData.version === COOKIE_CONSENT_VERSION) {
          setPreferences(consentData.preferences)
          setConsentGiven(true)
          setShowBanner(false)
        } else {
          // Version mismatch, show banner again
          setShowBanner(true)
        }
      } catch (error) {
        console.error('Error parsing cookie consent:', error)
        setShowBanner(true)
      }
    } else {
      setShowBanner(true)
    }
  }, [])

  // Initialize Firebase Analytics if consent given
  useEffect(() => {
    if (consentGiven && preferences?.analytics) {
      initializeAnalytics()
    }
  }, [consentGiven, preferences])

  const acceptCookies = (newPreferences: CookiePreferences) => {
    const consentData = {
      version: COOKIE_CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      preferences: newPreferences,
    }

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData))
    setPreferences(newPreferences)
    setConsentGiven(true)
    setShowBanner(false)

    // Track consent event if analytics enabled
    if (newPreferences.analytics) {
      initializeAnalytics()
    }
  }

  const declineCookies = () => {
    const minimalPreferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    }

    const consentData = {
      version: COOKIE_CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      preferences: minimalPreferences,
    }

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData))
    setPreferences(minimalPreferences)
    setConsentGiven(false)
    setShowBanner(false)
  }

  const updatePreferences = (newPreferences: CookiePreferences) => {
    if (!consentGiven) return

    const consentData = {
      version: COOKIE_CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      preferences: newPreferences,
    }

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData))
    setPreferences(newPreferences)

    // Handle analytics based on new preferences
    if (newPreferences.analytics && !preferences?.analytics) {
      initializeAnalytics()
    } else if (!newPreferences.analytics && preferences?.analytics) {
      // Note: Firebase Analytics cannot be easily disabled once initialized
      // In a production app, you might want to reload the page or use gtag
      console.warn(
        'Analytics preference changed to false, but Firebase Analytics cannot be disabled without page reload'
      )
    }
  }

  return {
    consentGiven,
    preferences,
    showBanner,
    acceptCookies,
    declineCookies,
    updatePreferences,
  }
}

// Initialize Firebase Analytics
const initializeAnalytics = async () => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    await initializeAnalyticsWithConsent()
  } catch (error) {
    console.error('Failed to initialize analytics:', error)
  }
}
