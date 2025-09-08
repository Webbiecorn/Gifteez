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
  fallbackImageSrc?: string; // local placeholder fallback
};

const AmazonTeaser: React.FC<AmazonTeaserProps> = ({ items, note, fallbackImageSrc = '/images/amazon-placeholder.png' }) => {
  return (
    <section className="animate-fade-in">
      <h2 className="font-display text-3xl font-bold text-primary mb-6">Amazon cadeautips</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((it, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group">
            <div className="overflow-hidden aspect-square flex items-center justify-center bg-white">
              {/* Force the wrapper produced by ImageWithFallback to fill the square so the image can scale correctly */}
              <ImageWithFallback
                src={it.imageUrl}
                fallbackSrc={fallbackImageSrc}
                alt={it.title}
                className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                fit="contain"
              />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-display text-lg font-bold text-primary flex-grow">{it.title}</h3>
              <a href={withAffiliate(it.affiliateUrl)} target="_blank" rel="noopener noreferrer sponsored nofollow" className="mt-4 inline-block bg-primary text-white rounded-md px-4 py-2 text-center font-semibold">
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
