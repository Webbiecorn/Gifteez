
import React, { useState, FormEvent } from 'react';
import { Page, NavigateTo } from '../types';
import Button from './Button';
import { InstagramIcon, PinterestIcon, TargetIcon } from './IconComponents';
import { socialLinks } from '../socialLinks';
import CookiePreferencesManager from './CookiePreferencesManager';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { NewsletterSignup } from './NewsletterSignup';

interface FooterProps {
  navigateTo: NavigateTo;
}

const Footer: React.FC<FooterProps> = ({ navigateTo }) => {
  const [showPreferences, setShowPreferences] = useState(false);
  const { preferences, updatePreferences } = useCookieConsent();

  return (
    <footer className="relative bg-gradient-to-br from-primary via-blue-700 to-indigo-800 text-white overflow-hidden">
      {/* Enhanced Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-xl"></div>
        <div className="absolute top-1/4 right-20 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-md"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full opacity-30 blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-xl shadow-2xl border border-white/20">
                  <span className="text-3xl">🎁</span>
                </div>
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Gifteez.nl</h3>
                <p className="text-blue-200 font-medium">AI Gift Finder</p>
              </div>
            </div>

            <p className="text-blue-100 mb-6 leading-relaxed text-base">
              Vind het perfecte cadeau in 30 seconden met onze AI GiftFinder. 
              Persoonlijke cadeau-ideeën voor elke gelegenheid en elk budget.
            </p>
          </div>

          {/* Column 2: Navigation - Ontdek */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              Ontdek
            </h4>
            <ul className="space-y-3">
              <li><button onClick={() => navigateTo('giftFinder')} className="text-blue-200 hover:text-white transition-all duration-300 text-base hover:translate-x-1 flex items-center gap-2">
                <span className="text-xs">🎯</span> GiftFinder
              </button></li>
              <li><button onClick={() => navigateTo('quiz')} className="text-blue-200 hover:text-white transition-all duration-300 text-base hover:translate-x-1 flex items-center gap-2">
                <span className="text-xs">❓</span> Cadeau Quiz
              </button></li>
              <li><button onClick={() => navigateTo('deals')} className="text-blue-200 hover:text-white transition-all duration-300 text-base hover:translate-x-1 flex items-center gap-2">
                <span className="text-xs">🔥</span> Deals
              </button></li>
              <li><button onClick={() => navigateTo('blog')} className="text-blue-200 hover:text-white transition-all duration-300 text-base hover:translate-x-1 flex items-center gap-2">
                <span className="text-xs">📝</span> Blog
              </button></li>
              <li><button onClick={() => navigateTo('about')} className="text-blue-200 hover:text-white transition-all duration-300 text-base hover:translate-x-1 flex items-center gap-2">
                <span className="text-xs">ℹ️</span> Over Ons
              </button></li>
              <li><button onClick={() => navigateTo('contact')} className="text-blue-200 hover:text-white transition-all duration-300 text-base hover:translate-x-1 flex items-center gap-2">
                <span className="text-xs">✉️</span> Contact
              </button></li>
            </ul>
          </div>

          {/* Column 3: Customer Service & Social */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Klantenservice
            </h4>
            <ul className="space-y-3">
              <li><button onClick={() => navigateTo('disclaimer')} className="text-blue-200 hover:text-white transition-all duration-300 text-base hover:translate-x-1 flex items-center gap-2">
                <span className="text-xs">📄</span> Disclaimer
              </button></li>
              <li><button onClick={() => navigateTo('privacy')} className="text-blue-200 hover:text-white transition-all duration-300 text-base hover:translate-x-1 flex items-center gap-2">
                <span className="text-xs">🔒</span> Privacybeleid
              </button></li>
              <li><button onClick={() => setShowPreferences(true)} className="text-blue-200 hover:text-white transition-all duration-300 text-base hover:translate-x-1 flex items-center gap-2">
                <TargetIcon className="w-4 h-4" />
                Cookie Instellingen
              </button></li>
            </ul>

            {/* Social Media */}
            <div className="mt-8">
              <h4 className="font-bold text-white mb-4 text-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                Volg Ons
              </h4>
              <div className="flex space-x-3">
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="group p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all duration-300 hover:scale-110 hover:shadow-2xl border border-white/20"
                >
                  <InstagramIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a
                  href={socialLinks.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  className="group p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-xl hover:from-red-500 hover:to-pink-500 transition-all duration-300 hover:scale-110 hover:shadow-2xl border border-white/20"
                >
                  <PinterestIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl h-fit">
              <NewsletterSignup 
                variant="footer"
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-10 border-t border-white/30">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1 max-w-3xl">
              <p className="text-blue-100 text-base mb-3 font-medium">
                &copy; {new Date().getFullYear()} Gifteez.nl. Alle rechten voorbehouden.
              </p>
              <p className="text-sm text-blue-200 leading-relaxed">
                Als Amazon-partner en partner van Coolblue en andere webshops verdienen wij aan in aanmerking komende aankopen.
                Prijzen en beschikbaarheid kunnen veranderen. Controleer altijd de actuele prijs op de productpagina.
              </p>
            </div>

            <div className="flex items-center justify-center lg:justify-end space-x-8">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-100 font-semibold">Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Preferences Manager */}
      {showPreferences && (
        <CookiePreferencesManager
          currentPreferences={preferences}
          onUpdatePreferences={updatePreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </footer>
  );
};

export default Footer;
