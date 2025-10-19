import React, { useState, useEffect } from 'react'
import { GiftIcon, SparklesIcon, XIcon } from './IconComponents'
import { Button } from './ui/Button'
import type { NavigateTo } from '../types'

interface FloatingCTAProps {
  navigateTo: NavigateTo
}

/**
 * FloatingCTA - Persistent call-to-action that appears at the bottom of content pages
 * Shows after user has clicked 5 times OR after 2 minutes without using GiftFinder
 * Can be dismissed once - never shows again after dismissal
 */
const FloatingCTA: React.FC<FloatingCTAProps> = ({ navigateTo }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Check if user has previously dismissed (permanent)
    const dismissed = localStorage.getItem('floatingCTA_dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
      return
    }

    // Check if already shown once this session
    const alreadyShown = sessionStorage.getItem('floatingCTA_shown')
    if (alreadyShown === 'true') {
      return
    }

    // Check if user has used GiftFinder recently (within last 24h)
    const lastGiftFinderUse = localStorage.getItem('giftFinder_lastUse')
    if (lastGiftFinderUse) {
      const timeSinceUse = Date.now() - parseInt(lastGiftFinderUse, 10)
      const oneDayInMs = 24 * 60 * 60 * 1000
      if (timeSinceUse < oneDayInMs) {
        // User used GiftFinder recently, don't show CTA
        return
      }
    }

    // Track clicks (any click on the page)
    let clickCount = 0
    const handleClick = () => {
      clickCount++
      if (clickCount >= 5) {
        setShouldShow(true)
      }
    }

    // Timer: show after 2 minutes (120 seconds)
    const timer = setTimeout(() => {
      setShouldShow(true)
    }, 120000) // 2 minutes

    document.addEventListener('click', handleClick, { passive: true })

    return () => {
      document.removeEventListener('click', handleClick)
      clearTimeout(timer)
    }
  }, [])

  // Show the CTA when shouldShow becomes true
  useEffect(() => {
    if (shouldShow && !isDismissed) {
      setIsVisible(true)
      sessionStorage.setItem('floatingCTA_shown', 'true')
    }
  }, [shouldShow, isDismissed])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    localStorage.setItem('floatingCTA_dismissed', 'true')
  }

  const handleGiftFinderClick = () => {
    // Track that user used GiftFinder
    localStorage.setItem('giftFinder_lastUse', Date.now().toString())
    navigateTo('giftFinder')
  }

  if (isDismissed || !isVisible) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-80 animate-fade-in-up"
      role="complementary"
      aria-label="Call to action"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 max-w-sm">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 h-8 w-8 flex items-center justify-center rounded-full bg-neutral-700 text-white hover:bg-neutral-800 transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500"
          aria-label="Sluit call-to-action"
        >
          <XIcon className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-glow">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">
                Op zoek naar het perfecte cadeau?
              </h3>
              <p className="text-xs text-neutral-600">
                Laat onze AI je helpen met persoonlijke aanbevelingen!
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="accent"
              size="sm"
              onClick={handleGiftFinderClick}
              leftIcon={<GiftIcon className="w-4 h-4" />}
              fullWidth
              aria-label="Start de GiftFinder"
            >
              Start GiftFinder
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo('categories')}
              leftIcon={<SparklesIcon className="w-4 h-4" />}
              fullWidth
              aria-label="Bekijk categorieën"
            >
              Bekijk Categorieën
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloatingCTA
