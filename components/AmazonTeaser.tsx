import React from 'react';

type AmazonTeaserProps = {
  items: Array<{
    title: string;
    imageUrl: string;
    affiliateUrl: string; // Use Amazon Associate SiteStripe or generated affiliate URLs
  }>;
  note?: string;
};

const AmazonTeaser: React.FC<AmazonTeaserProps> = ({ items, note }) => {
  return (
    <section className="animate-fade-in">
      <h2 className="font-display text-3xl font-bold text-primary mb-6">Amazon cadeautips</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((it, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group">
            <div className="overflow-hidden">
              <img src={it.imageUrl} alt={it.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-display text-lg font-bold text-primary flex-grow">{it.title}</h3>
              <a href={it.affiliateUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block bg-primary text-white rounded-md px-4 py-2 text-center font-semibold">
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
