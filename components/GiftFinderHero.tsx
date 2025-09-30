import React from 'react';

interface GiftFinderHeroProps {
  image: string; // base image (png/jpg)
  imageWebp?: string; // optional webp variant
  alt: string;
  heading?: string;
  tagline?: string;
  subheading?: string;
  onSelectBudget?: () => void;
  onSelectOccasion?: () => void;
  onSelectPersonality?: () => void;
  onStart?: () => void;
  className?: string;
  heightAspect?: string; // tailwind aspect utility e.g. 'aspect-[16/9]'
}

/**
 * Reusable full-bleed hero for the GiftFinder page.
 * Provides overlay CTA buttons that map to form interactions.
 */
const GiftFinderHero: React.FC<GiftFinderHeroProps> = ({
  image,
  imageWebp,
  alt,
  heading = 'Vind het perfecte cadeau',
  tagline = 'Zoek • Kies • Vieren',
  subheading = 'Zoek op budget, gelegenheid of persoonlijkheid – start nu en krijg direct slimme AI suggesties.',
  onSelectBudget,
  onSelectOccasion,
  onSelectPersonality,
  onStart,
  className = '',
  heightAspect = 'aspect-[16/9]'
}) => {
  return (
    <section className={`relative w-full ${heightAspect} max-h-[760px] overflow-hidden bg-black ${className}`.trim()}>
      <picture>
        {imageWebp && <source srcSet={imageWebp} type="image/webp" />}
        <img
          src={image}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover object-[center_60%] select-none pointer-events-none"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          width={1920}
          height={860}
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/0" />
      <h1 className="sr-only">{heading}</h1>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <div className="space-y-6 max-w-4xl">
          <p className="text-sm sm:text-base font-semibold tracking-wider text-white/80">{tagline}</p>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-xl">
            {heading}
          </p>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              {subheading}
            </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={onSelectBudget}
              className="px-6 py-3 rounded-full font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border border-white/20 shadow transition"
              aria-label="Scroll naar formulier en focus op budget"
            >
              Budget
            </button>
            <button
              type="button"
              onClick={onSelectOccasion}
              className="px-6 py-3 rounded-full font-semibold bg-white/30 hover:bg-white/40 text-white border border-white/30 shadow-lg transition"
              aria-label="Scroll naar formulier voor gelegenheid"
            >
              Gelegenheid
            </button>
            <button
              type="button"
              onClick={onSelectPersonality}
              className="px-6 py-3 rounded-full font-semibold bg-white/30 hover:bg-white/40 text-white border border-white/30 shadow-lg transition"
              aria-label="Scroll naar formulier voor persoonlijkheid / interesses"
            >
              Persoonlijkheid
            </button>
            <button
              type="button"
              onClick={onStart}
              className="px-8 py-3 rounded-full font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-xl transition focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
              aria-label="Start de GiftFinder"
            >
              Start GiftFinder
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiftFinderHero;
