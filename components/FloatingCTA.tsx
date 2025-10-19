import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { GiftIcon, SparklesIcon, XIcon } from './IconComponents';
import { NavigateTo } from '../types';

interface FloatingCTAProps {
  navigateTo: NavigateTo;
}

/**
 * FloatingCTA - Persistent call-to-action that appears at the bottom of content pages
 * Shows after user has scrolled 300px down the page
 * Can be dismissed, preference stored in localStorage
 */
const FloatingCTA: React.FC<FloatingCTAProps> = ({ navigateTo }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed
    const dismissed = localStorage.getItem('floatingCTA_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      // Show CTA after scrolling 300px
      const shouldShow = window.scrollY > 300;
      setIsVisible(shouldShow);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('floatingCTA_dismissed', 'true');
  };

  if (isDismissed || !isVisible) return null;

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
              onClick={() => navigateTo('giftFinder')}
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
              aria-label="Bekijk duurzame cadeaus"
            >
              Bekijk Duurzame Cadeaus
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingCTA;
