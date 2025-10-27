import React, { useState, useEffect } from 'react'
import { SparklesIcon, XIcon } from './IconComponents'
import type { NavigateTo } from '../types'
/* eslint-disable @typescript-eslint/no-explicit-any */

interface FloatingCadeauCoachButtonProps {
  navigateTo: NavigateTo
}

const FloatingCadeauCoachButton: React.FC<FloatingCadeauCoachButtonProps> = ({ navigateTo }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Show button after user scrolls down a bit
    const handleScroll = () => {
      const scrolled = window.scrollY > 400
      setIsVisible(scrolled && !isDismissed)
    }

    // Check if user dismissed it in this session
    const dismissed = sessionStorage.getItem('cadeau_coach_dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDismissed])

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDismissed(true)
    sessionStorage.setItem('cadeau_coach_dismissed', 'true')
  }

  const handleClick = () => {
    // Track click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'floating_coach_click', {
        event_category: 'Cadeau Coach',
        event_label: 'Floating Button',
      })
    }
    navigateTo('giftFinder')
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      {/* Floating Button with pulse animation */}
      <div className="relative">
        {/* Pulsing ring effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 animate-ping opacity-20" />
        
        {/* Main button */}
        <button
          onClick={handleClick}
          className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 pl-5 pr-6 py-4 text-white shadow-2xl transition-all duration-300 hover:shadow-rose-500/50 hover:scale-105 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 focus:outline-none focus:ring-4 focus:ring-rose-300"
          aria-label="Open Cadeau-Coach"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          </div>

          {/* Icon */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <SparklesIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          </div>

          {/* Text */}
          <div className="relative text-left">
            <div className="text-sm font-bold leading-tight">Cadeau-Coach</div>
            <div className="text-xs opacity-90 leading-tight">Hulp nodig?</div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-white shadow-lg transition-transform hover:scale-110 hover:bg-slate-800 focus:outline-none"
            aria-label="Verberg Cadeau-Coach button"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </button>

        {/* Tooltip hint (shows on first appearance) */}
        <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block animate-fade-in">
          <div className="relative rounded-lg bg-slate-900 px-4 py-2 text-xs text-white shadow-xl whitespace-nowrap">
            <div className="font-semibold">Niet zeker welk cadeau?</div>
            <div className="opacity-90">Laat onze coach je helpen! 🎁</div>
            {/* Arrow */}
            <div className="absolute top-full right-8 -mt-px">
              <div className="border-8 border-transparent border-t-slate-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloatingCadeauCoachButton
