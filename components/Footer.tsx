
import React, { useState, FormEvent } from 'react';
import { Page, NavigateTo } from '../types';
import Button from './Button';
import { InstagramIcon, PinterestIcon, TargetIcon } from './IconComponents';
import { socialLinks } from '../socialLinks';
import CookiePreferencesManager from './CookiePreferencesManager';
import { useCookieConsent } from '../hooks/useCookieConsent';

interface FooterProps {
  navigateTo: NavigateTo;
}

const Footer: React.FC<FooterProps> = ({ navigateTo }) => {
  const [email, setEmail] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const { preferences, updatePreferences } = useCookieConsent();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email && /\S+@\S+\.\S+/.test(email)) {
      // In a real app, this would be sent to a backend service
      console.log('Subscribing email from footer:', email);
      navigateTo('download');
      setEmail(''); // Reset form
    } else {
      // Basic validation feedback
      alert('Voer een geldig e-mailadres in.');
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-primary via-primary to-red-800 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute top-1/4 right-20 w-24 h-24 bg-blue-500 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 bg-blue-500 rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Column 1: Brand & Navigation */}
          <div className="md:col-span-2 lg:col-span-5">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-secondary rounded-lg blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-secondary p-3 rounded-lg shadow-lg">
                  <span className="text-2xl">🎁</span>
                </div>
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold">Gifteez.nl</h3>
                <p className="text-sm text-gray-300">AI Gift Finder</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Vind het perfecte cadeau in 30 seconden met onze AI GiftFinder.
              Persoonlijke cadeau-ideeën voor elke gelegenheid en elk budget.
            </p>

            {/* Quick Navigation */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Ontdek</h4>
                <ul className="space-y-2">
                  <li><button onClick={() => navigateTo('giftFinder')} className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">GiftFinder</button></li>
                  <li><button onClick={() => navigateTo('quiz')} className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Cadeau Quiz</button></li>
                  <li><button onClick={() => navigateTo('deals')} className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Deals</button></li>
                  {/* <li><button onClick={() => navigateTo('shop')} className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Winkel</button></li> */}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Meer</h4>
                <ul className="space-y-2">
                  <li><button onClick={() => navigateTo('blog')} className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Blog</button></li>
                  <li><button onClick={() => navigateTo('about')} className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Over Ons</button></li>
                  <li><button onClick={() => navigateTo('contact')} className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Contact</button></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 2: Newsletter */}
          <div className="md:col-span-2 lg:col-span-3">
            <h3 className="font-display font-bold text-lg mb-4">Blijf Op De Hoogte</h3>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Krijg de beste cadeau-tips en aanbiedingen direct in je inbox.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Jouw e-mailadres"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent bg-white/90 backdrop-blur-sm border border-white/20 placeholder-gray-500"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="accent"
                className="w-full py-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Aanmelden
              </Button>
            </form>
            <p className="text-xs text-gray-400 mt-3">
              Geen spam, alleen waardevolle cadeau-tips.
            </p>
          </div>

          {/* Column 3: Social & Contact */}
          <div className="md:col-span-2 lg:col-span-4">
            <h3 className="font-display font-bold text-lg mb-4">Volg Ons</h3>
            <div className="flex space-x-4 mb-6">
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="group p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-blue-600 transition-all duration-300 hover:scale-110"
              >
                <InstagramIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
              <a
                href={socialLinks.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="group p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-blue-600 transition-all duration-300 hover:scale-110"
              >
                <PinterestIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
            </div>

            <h4 className="font-semibold text-white mb-3">Klantenservice</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigateTo('disclaimer')} className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Disclaimer</button></li>
              <li><button onClick={() => navigateTo('privacy')} className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Privacybeleid</button></li>
              <li><button onClick={() => setShowPreferences(true)} className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2">
                <TargetIcon className="w-4 h-4" />
                Cookie Instellingen
              </button></li>
              <li><button onClick={() => navigateTo('contact')} className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Contact</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1 max-w-2xl">
              <p className="text-gray-300 text-sm mb-2">
                &copy; {new Date().getFullYear()} Gifteez.nl. Alle rechten voorbehouden.
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Als Amazon-partner en partner van Bol.com en andere webshops verdienen wij aan in aanmerking komende aankopen.
                Prijzen en beschikbaarheid kunnen veranderen. Controleer altijd de actuele prijs op de productpagina.
              </p>
            </div>

            <div className="flex items-center justify-center lg:justify-end space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-300 font-medium">Powered by AI</span>
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
