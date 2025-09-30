import React, { useState, useEffect } from 'react';
import { CheckIcon, XIcon } from './IconComponents';

interface CookieBannerProps {
  onAccept: (preferences: CookiePreferences) => void;
  onDecline: () => void;
}

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieBanner: React.FC<CookieBannerProps> = ({ onAccept, onDecline }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Altijd waar, kan niet worden uitgeschakeld
    analytics: false,
    marketing: false,
  });

  const handleAcceptAll = () => {
    const allPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allPreferences);
    onAccept(allPreferences);
  };

  const handleAcceptSelected = () => {
    onAccept(preferences);
  };

  const handleDecline = () => {
    const minimalPreferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(minimalPreferences);
    onDecline();
  };

  const updatePreference = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'necessary') return; // Necessary cookies kunnen niet worden uitgeschakeld
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-primary shadow-2xl">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-2xl">🍪</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cookie Voorkeuren</h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Wij gebruiken cookies om uw ervaring te verbeteren en onze website te analyseren.
              U kunt kiezen welke soorten cookies u wilt accepteren.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={handleAcceptAll}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary via-accent to-accent-hover text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <CheckIcon className="w-4 h-4" />
                Alles Accepteren
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-full hover:bg-gray-300 transition-colors duration-300"
              >
                Voorkeuren Aanpassen
              </button>
              <button
                onClick={handleDecline}
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 font-semibold px-6 py-2 rounded-full hover:bg-gray-200 transition-colors duration-300"
              >
                Alleen Noodzakelijk
              </button>
            </div>

            {/* Detailed Preferences */}
            {showDetails && (
              <div className="bg-secondary rounded-lg p-4 mb-4 border border-muted-rose/60">
                <h4 className="font-semibold text-gray-900 mb-3">Cookie Categorieën</h4>

                {/* Necessary Cookies */}
                <div className="flex items-start gap-3 mb-3 p-3 bg-muted-rose rounded-lg border border-muted-rose/80">
                  <div className="flex-shrink-0 w-5 h-5 bg-accent rounded-full flex items-center justify-center mt-0.5">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900">Noodzakelijke Cookies</h5>
                      <span className="text-xs bg-light-bg text-accent px-2 py-1 rounded-full">Altijd actief</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Deze cookies zijn essentieel voor de werking van de website en kunnen niet worden uitgeschakeld.
                    </p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="analytics"
                    checked={preferences.analytics}
                    onChange={(e) => updatePreference('analytics', e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <div className="flex-grow">
                    <label htmlFor="analytics" className="cursor-pointer">
                      <h5 className="font-medium text-gray-900">Analytische Cookies</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Helpen ons te begrijpen hoe bezoekers de website gebruiken, zodat we de ervaring kunnen verbeteren.
                      </p>
                    </label>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={preferences.marketing}
                    onChange={(e) => updatePreference('marketing', e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <div className="flex-grow">
                    <label htmlFor="marketing" className="cursor-pointer">
                      <h5 className="font-medium text-gray-900">Marketing Cookies</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Gebruikt voor het tonen van relevante advertenties en het meten van marketing effectiviteit.
                      </p>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleAcceptSelected}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary via-accent to-accent-hover text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Voorkeuren Opslaan
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-full hover:bg-gray-300 transition-colors duration-300"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="/privacy" className="text-primary hover:text-accent underline">
                Privacybeleid
              </a>
              <a href="/disclaimer" className="text-primary hover:text-accent underline">
                Disclaimer
              </a>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDecline}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
            aria-label="Cookie banner sluiten"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
