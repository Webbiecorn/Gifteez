import React from 'react';
import { withAffiliate } from '../services/affiliate';
import ImageWithFallback from './ImageWithFallback';

type AmazonTeaserProps = {
  items: Array<{
    title: string;
    imageUrl: string;
    affiliateUrl: string; // Use Amazon Associate SiteStripe or generated affiliate URLs
  }>;
  note?: string;
  /**
   * default: responsive grid (1 col on mobile, 2 on sm, 4 on lg) for main content sections
   * sidebar: single column optimized for narrow sidebars
   */
  variant?: 'default' | 'sidebar';
};

const AmazonTeaser: React.FC<AmazonTeaserProps> = ({ items, note, variant = 'default' }) => {
  const gridClasses =
    variant === 'sidebar'
      ? 'grid grid-cols-1 gap-4'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
  const imageWrapClasses =
    variant === 'sidebar'
      ? 'relative overflow-hidden h-40 flex items-center justify-center bg-white'
      : 'relative overflow-hidden h-48 flex items-center justify-center bg-white';
  return (
    <section className="animate-fade-in">
      <h2 className={`font-display font-bold text-primary mb-6 ${variant === 'sidebar' ? 'text-2xl' : 'text-3xl'}`}>Amazon cadeautips</h2>
      <div className={gridClasses}>
        {items.map((it, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl opacity-0 animate-card-pop"
            style={{ animationDelay: `${100 * idx}ms` }}
          >
            <div className={imageWrapClasses}>
              <ImageWithFallback
                src={it.imageUrl}
                alt={it.title}
                className="max-h-full max-w-full object-contain transform-gpu transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1"
              />
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/25 blur-md transform-gpu -skew-x-12 opacity-0 group-hover:opacity-100 animate-shine" style={{ animationDelay: `${150 * idx}ms` }} />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-display text-lg font-bold text-primary flex-grow">{it.title}</h3>
              <a
                href={withAffiliate(it.affiliateUrl)}
                target="_blank"
                rel="noopener noreferrer sponsored nofollow"
                className="mt-4 inline-block bg-primary text-white rounded-md px-4 py-2 text-center font-semibold transform-gpu transition-transform duration-200 hover:scale-105 active:scale-95 animate-cta-pulse"
                style={{ animationDelay: `${400 + 100 * idx}ms` }}
              >
                Bekijk op Amazon
              </a>
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-4">{note || 'Tip: Prijzen en beschikbaarheid kunnen wijzigen. Bekijk altijd de actuele prijs op Amazon.'}</p>
    </section>
  );
};

export default AmazonTeaser;
