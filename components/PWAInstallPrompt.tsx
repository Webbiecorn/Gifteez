import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEYS = {
  DISMISSED: 'gifteez_pwa_install_dismissed',
  INSTALLED: 'gifteez_pwa_installed',
  DISMISS_COUNT: 'gifteez_pwa_dismiss_count'
};

const DISMISS_DURATION_DAYS = 30;
const MAX_DISMISSALS = 3; // After 3 dismissals, never show again

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    const isInstalled = localStorage.getItem(STORAGE_KEYS.INSTALLED) === 'true';
    const dismissedUntil = localStorage.getItem(STORAGE_KEYS.DISMISSED);
    const dismissCount = parseInt(localStorage.getItem(STORAGE_KEYS.DISMISS_COUNT) || '0', 10);

    if (isInstalled || dismissCount >= MAX_DISMISSALS) {
      return;
    }

    if (dismissedUntil) {
      const dismissDate = new Date(dismissedUntil);
      if (dismissDate > new Date()) {
        return; // Still within dismissal period
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show prompt after 10 seconds (don't be too aggressive)
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[PWA] Install prompt available');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[PWA] App installed successfully');
      }
      localStorage.setItem(STORAGE_KEYS.INSTALLED, 'true');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      // Show install prompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        if (process.env.NODE_ENV === 'development') {
          console.log('[PWA] User accepted install prompt');
        }
        localStorage.setItem(STORAGE_KEYS.INSTALLED, 'true');
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('[PWA] User dismissed install prompt');
        }
        handleDismiss();
      }
    } catch (error) {
      console.error('[PWA] Install prompt error:', error);
    } finally {
      setIsInstalling(false);
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    // Track dismissal
    const currentCount = parseInt(localStorage.getItem(STORAGE_KEYS.DISMISS_COUNT) || '0', 10);
    const newCount = currentCount + 1;
    localStorage.setItem(STORAGE_KEYS.DISMISS_COUNT, newCount.toString());

    // Set dismiss expiration
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + DISMISS_DURATION_DAYS);
    localStorage.setItem(STORAGE_KEYS.DISMISSED, dismissUntil.toISOString());

    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold text-sm">Installeer Gifteez</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/90 hover:text-white transition-colors"
            aria-label="Sluit installatie prompt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-700 text-sm mb-4">
            Installeer Gifteez als app voor snellere toegang en een betere ervaring. 
            Werkt ook offline!
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInstalling ? 'Bezig met installeren...' : 'Installeer nu'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Later
            </button>
          </div>

          {/* Features */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <ul className="text-xs text-gray-500 space-y-1">
              <li>✓ Snelle toegang vanaf je startscherm</li>
              <li>✓ Werkt ook zonder internet (offline)</li>
              <li>✓ Geen app store nodig</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
