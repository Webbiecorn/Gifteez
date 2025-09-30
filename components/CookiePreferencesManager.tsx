import React, { useState } from 'react';
import { CheckIcon, XIcon, TargetIcon } from './IconComponents';
import { CookiePreferences } from './CookieBanner';

interface CookiePreferencesManagerProps {
  currentPreferences: CookiePreferences;
  onUpdatePreferences: (preferences: CookiePreferences) => void;
  onClose: () => void;
}

const CookiePreferencesManager: React.FC<CookiePreferencesManagerProps> = ({
  currentPreferences,
  onUpdatePreferences,
  onClose,
}) => {
  const [preferences, setPreferences] = useState<CookiePreferences>(currentPreferences);

  const handleSave = () => {
    onUpdatePreferences(preferences);
    onClose();
  };

  const updatePreference = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'necessary') return; // Necessary cookies kunnen niet worden uitgeschakeld
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <TargetIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Cookie Voorkeuren</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
              aria-label="Sluiten"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Hier kunt u uw cookie voorkeuren aanpassen. Sommige cookies zijn noodzakelijk voor de werking van de website
            en kunnen niet worden uitgeschakeld.
          </p>

          {/* Cookie Categories */}
          <div className="space-y-6">
            {/* Necessary Cookies */}
            <div className="bg-muted-rose rounded-lg p-4 border border-muted-rose/80">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center mt-1">
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Noodzakelijke Cookies</h3>
                    <span className="text-sm bg-light-bg text-accent px-3 py-1 rounded-full">Altijd actief</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Deze cookies zijn essentieel voor de basisfunctionaliteit van de website, zoals navigatie,
                    beveiliging en het onthouden van uw cookie voorkeuren. Ze kunnen niet worden uitgeschakeld.
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    id="analytics-pref"
                    checked={preferences.analytics}
                    onChange={(e) => updatePreference('analytics', e.target.checked)}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </div>
                <div className="flex-grow">
                  <label htmlFor="analytics-pref" className="cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytische Cookies</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Deze cookies helpen ons te begrijpen hoe bezoekers de website gebruiken, zodat we de
                      ervaring kunnen verbeteren. We gebruiken Firebase Analytics om anonieme statistieken te verzamelen.
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    id="marketing-pref"
                    checked={preferences.marketing}
                    onChange={(e) => updatePreference('marketing', e.target.checked)}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </div>
                <div className="flex-grow">
                  <label htmlFor="marketing-pref" className="cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Deze cookies worden gebruikt om relevante advertenties te tonen en de effectiviteit van
                      marketing campagnes te meten. Ze kunnen afkomstig zijn van derde partijen.
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-primary via-accent to-accent-hover text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Voorkeuren Opslaan
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-full hover:bg-gray-300 transition-colors duration-300"
            >
              Annuleren
            </button>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 mt-6 pt-6 border-t border-gray-200">
            <a href="/privacy" className="text-primary hover:text-accent underline text-sm">
              Privacybeleid
            </a>
            <a href="/disclaimer" className="text-primary hover:text-accent underline text-sm">
              Disclaimer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePreferencesManager;
