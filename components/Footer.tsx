
import React, { useState } from 'react';
import { NavigateTo, ShowToast } from '../types';
import { InstagramIcon, PinterestIcon, TargetIcon } from './IconComponents';
import { socialLinks } from '../socialLinks';
import CookiePreferencesManager from './CookiePreferencesManager';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { NewsletterSignup } from './NewsletterSignup';
import Logo from './Logo';
import OrganizationSchema from './OrganizationSchema';

interface FooterProps {
  navigateTo: NavigateTo;
  showToast: ShowToast;
}

const Footer: React.FC<FooterProps> = ({ navigateTo, showToast }) => {
  const [showPreferences, setShowPreferences] = useState(false);
  const { preferences, updatePreferences } = useCookieConsent();

  return (
  <footer className="relative mt-24 overflow-hidden border-t border-muted-rose/70 bg-gradient-to-b from-secondary via-light-bg/60 to-white" role="contentinfo" aria-label="Site footer">
      {/* Organization Schema for SEO */}
      <OrganizationSchema />
      
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
      <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_top_left,#f43f5e22,transparent_60%)]"></div>
      <div className="absolute inset-y-0 right-[-20%] w-2/3 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_top_right,#fb923c1c,transparent_65%)]"></div>
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(140deg,transparent_55%,rgba(148,27,40,0.1)_85%,transparent)]"></div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        {/* Newsletter Section - Full Width */}
        <div className="mb-16 p-8 bg-gradient-to-br from-accent/10 via-primary/5 to-highlight/10 rounded-3xl border border-accent/20 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <NewsletterSignup 
              showToast={showToast}
              variant="inline"
              title="📬 Blijf op de hoogte"
              description="Ontvang exclusieve deals, nieuwe gidsen en cadeau-tips direct in je inbox!"
              defaultFrequency="weekly"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-white/60 backdrop-blur">
              <Logo alt="Gifteez.nl - AI Gift Finder voor het perfecte cadeau" className="h-12 w-auto" priority />
            </div>
            <p className="mt-6 text-primary/75 leading-relaxed mb-6 max-w-md">
              Vind binnen seconden een persoonlijk cadeau-idee met AI. Minder zoeken, meer geven.
            </p>
            
            <div className="flex gap-3 mt-6" role="list" aria-label="Social media links">
              <a
                href={socialLinks.instagram}
                aria-label="Volg ons op Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-xl bg-white/90 shadow-sm ring-1 ring-muted-rose hover:ring-accent/60 hover:bg-white transition-all duration-300"
              >
                <InstagramIcon className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
              </a>
              <a
                href={socialLinks.pinterest}
                aria-label="Volg ons op Pinterest"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-xl bg-white/90 shadow-sm ring-1 ring-muted-rose hover:ring-accent/60 hover:bg-white transition-all duration-300"
              >
                <PinterestIcon className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-semibold text-primary mb-5 text-sm tracking-[0.2em] uppercase">Ontdek</h4>
            <nav aria-label="Footer navigatie">
              <ul className="space-y-3 text-sm text-primary/75">
                {[
                  ['giftFinder','🎯','GiftFinder'],
                  ['quiz','❓','Cadeau Quiz'],
                  ['deals','🔥','Deals'],
                  ['blog','📝','Blog'],
                  ['about','ℹ️','Over Ons'],
                  ['contact','✉️','Contact']
                ].map(([page, icon, label]) => (
                  <li key={page}>
                    <button onClick={() => navigateTo(page as any)} aria-label={`Ga naar ${label}`} className="group flex items-center gap-2 hover:text-accent transition-colors">
                      <span className="text-xs" aria-hidden="true">{icon}</span>
                      <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-accent group-hover:after:w-full after:transition-all">{label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Service */}
          <div>
            <h4 className="font-semibold text-primary mb-5 text-sm tracking-[0.2em] uppercase">Service</h4>
            <nav aria-label="Service links">
              <ul className="space-y-3 text-sm text-primary/75">
                <li>
                  <button onClick={() => navigateTo('disclaimer')} aria-label="Lees onze disclaimer" className="hover:text-accent transition-colors flex items-center gap-2">
                    <span className="text-xs" aria-hidden="true">📄</span> Disclaimer
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('privacy')} aria-label="Lees ons privacybeleid" className="hover:text-accent transition-colors flex items-center gap-2">
                    <span className="text-xs" aria-hidden="true">🔒</span> Privacybeleid
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('affiliateDisclosure')} aria-label="Lees over onze affiliate partnerships" className="hover:text-accent transition-colors flex items-center gap-2">
                    <span className="text-xs" aria-hidden="true">🤝</span> Affiliate Disclosure
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowPreferences(true)} aria-label="Beheer cookie instellingen" className="hover:text-accent transition-colors flex items-center gap-2">
                    <TargetIcon className="w-4 h-4" /> Cookie Instellingen
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom */}
  <div className="mt-12 pt-8 border-t border-muted-rose/60 grid gap-6 text-sm text-primary/70 md:grid-cols-[auto,1fr,auto] md:items-center">
          <p className="order-1">&copy; {new Date().getFullYear()} Gifteez.nl — Alle rechten voorbehouden.</p>
          <p className="order-3 md:order-2 max-w-2xl leading-relaxed md:justify-self-center text-primary/65">
            Als Amazon-partner en partner van andere webshops verdienen wij aan in aanmerking komende aankopen. Prijzen & beschikbaarheid kunnen wijzigen.
          </p>
          <div className="order-2 md:order-3 flex items-center gap-3 justify-start md:justify-end text-accent font-medium">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/70 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-accent" /></span>
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
