
import React, { useState } from 'react';
import { NavigateTo } from '../types';
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
    <footer className="relative border-t border-emerald-100 bg-gradient-to-b from-white via-emerald-50/40 to-white mt-24">
      <div className="absolute inset-0 pointer-events-none opacity-[0.35] bg-[radial-gradient(circle_at_30%_30%,#10b98122,transparent_70%)]"></div>
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,transparent,rgba(16,185,129,0.05),transparent)]"></div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/images/gifteez-logo.svg" alt="Gifteez.nl" className="h-12 w-auto" />
            </div>
            <p className="text-slate-600 leading-relaxed mb-6 max-w-md">
              Vind binnen seconden een persoonlijk cadeau-idee met AI. Minder zoeken, meer geven.
            </p>
            <div className="flex gap-3">
              <a
                href={socialLinks.instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-xl bg-white shadow-sm ring-1 ring-emerald-100 hover:ring-emerald-300 hover:shadow-md transition-all duration-300"
              >
                <InstagramIcon className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href={socialLinks.pinterest}
                aria-label="Pinterest"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-xl bg-white shadow-sm ring-1 ring-emerald-100 hover:ring-emerald-300 hover:shadow-md transition-all duration-300"
              >
                <PinterestIcon className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-5 text-sm tracking-wide uppercase">Ontdek</h4>
            <ul className="space-y-3 text-sm">
              {[
                ['giftFinder','🎯','GiftFinder'],
                ['quiz','❓','Cadeau Quiz'],
                ['deals','🔥','Deals'],
                ['blog','📝','Blog'],
                ['about','ℹ️','Over Ons'],
                ['contact','✉️','Contact']
              ].map(([page, icon, label]) => (
                <li key={page}>
                  <button onClick={() => navigateTo(page as any)} className="group flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition-colors">
                    <span className="text-xs" aria-hidden="true">{icon}</span>
                    <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-emerald-600 group-hover:after:w-full after:transition-all">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Service */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-5 text-sm tracking-wide uppercase">Service</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => navigateTo('disclaimer')} className="hover:text-emerald-700 text-slate-600 transition-colors flex items-center gap-2">
                  <span className="text-xs" aria-hidden="true">📄</span> Disclaimer
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('privacy')} className="hover:text-emerald-700 text-slate-600 transition-colors flex items-center gap-2">
                  <span className="text-xs" aria-hidden="true">🔒</span> Privacybeleid
                </button>
              </li>
              <li>
                <button onClick={() => setShowPreferences(true)} className="hover:text-emerald-700 text-slate-600 transition-colors flex items-center gap-2">
                  <TargetIcon className="w-4 h-4" /> Cookie Instellingen
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold text-slate-900 mb-4 text-sm tracking-wide uppercase">Blijf op de hoogte</h4>
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-emerald-100 p-5">
              <NewsletterSignup variant="footer" />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-emerald-100 flex flex-col md:flex-row gap-8 md:items-center justify-between text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Gifteez.nl — Alle rechten voorbehouden.</p>
          <p className="max-w-xl leading-relaxed">
            Als Amazon-partner en partner van andere webshops verdienen wij aan in aanmerking komende aankopen. Prijzen & beschikbaarheid kunnen wijzigen.
          </p>
          <div className="flex items-center gap-2 text-emerald-600 font-medium">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
            <span>Powered by AI</span>
          </div>
        </div>
      </div>

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
