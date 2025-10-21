import React from 'react'

interface GiftFinderHeroProps {
  image: string // base image (png/jpg)
  imageWebp?: string // optional webp variant
  alt: string
  heading?: string
  tagline?: string
  subheading?: string
  onSelectPersonality?: () => void
  onStart?: () => void
  className?: string
  heightAspect?: string // tailwind aspect utility e.g. 'aspect-[16/9]'
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
  subheading,
  onSelectPersonality,
  onStart,
  className = '',
  heightAspect = 'aspect-[16/9]',
}) => {
  const defaultHeading = 'Vind het perfecte cadeau'
  const headingLines = heading.includes('\n')
    ? heading.split('\n')
    : heading === defaultHeading
      ? ['Vind het', 'perfecte cadeau']
      : [heading]
  const accessibleHeading = headingLines.join(' ')

  return (
    <section
      className={`relative w-full ${heightAspect} max-h-[760px] overflow-hidden bg-gradient-to-br from-secondary-50 to-secondary-100 ${className}`.trim()}
    >
      <picture>
        {imageWebp && <source srcSet={imageWebp} type="image/webp" />}
        <img
          src={image}
          alt={alt}
          className="absolute inset-0 w-full h-full object-contain object-center select-none pointer-events-none animate-subtle-float"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          width={1920}
          height={860}
        />
      </picture>
      
      {/* Gradient fade aan beide zijkanten */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary-100 via-transparent via-50% to-secondary-100" />
      
      {/* Gradient overlay voor tekstcontrast - links donkerder */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/50 via-primary-900/10 via-40% to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-secondary-100/20" />
      
      {/* Decoratieve gloed rond mascotte */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-20">
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          <p className="text-sm sm:text-base font-semibold tracking-wider text-accent-500 drop-shadow-lg">
            {tagline}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-white drop-shadow-2xl">
            {headingLines.map((line, index) => (
              <React.Fragment key={index}>
                <span className="block">
                  {line}
                </span>
              </React.Fragment>
            ))}
          </h1>
          {subheading && (
            <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-xl drop-shadow-lg leading-relaxed">
              {subheading}
            </p>
          )}
          {(onSelectPersonality || onStart) && (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4 sm:pt-6">
              {onSelectPersonality && (
                <button
                  type="button"
                  onClick={onSelectPersonality}
                  className="px-6 py-3 sm:px-7 sm:py-4 rounded-full font-semibold text-sm sm:text-base bg-white/95 hover:bg-white text-primary-800 border-2 border-white/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm"
                  aria-label="Scroll naar formulier voor persoonlijkheid of interesses"
                >
                  Persoonlijkheid kiezen
                </button>
              )}
              {onStart && (
                <button
                  type="button"
                  onClick={onStart}
                  className="px-8 py-3 sm:px-9 sm:py-4 rounded-full font-semibold text-sm sm:text-base bg-accent-500 hover:bg-accent-600 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-300"
                  aria-label="Start de GiftFinder"
                >
                  Start GiftFinder
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default GiftFinderHero
