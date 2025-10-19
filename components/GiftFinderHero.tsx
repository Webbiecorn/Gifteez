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
      className={`relative w-full ${heightAspect} max-h-[760px] overflow-hidden bg-black ${className}`.trim()}
    >
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
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <div className="space-y-4 sm:space-y-6 max-w-4xl">
          <p className="text-sm sm:text-base font-semibold tracking-wider text-white/80">
            {tagline}
          </p>
          <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-xl">
            {headingLines.map((line, index) => (
              <React.Fragment key={index}>
                <span className={headingLines.length > 1 ? 'block sm:inline' : undefined}>
                  {line}
                </span>
                {headingLines.length > 1 && index < headingLines.length - 1 && (
                  <span className="hidden sm:inline">&nbsp;</span>
                )}
              </React.Fragment>
            ))}
          </h1>
          {subheading && (
            <p className="hidden sm:block text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              {subheading}
            </p>
          )}
          {(onSelectPersonality || onStart) && (
            <div className="hidden sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-4 pt-6 w-full max-w-2xl mx-auto">
              {onSelectPersonality && (
                <button
                  type="button"
                  onClick={onSelectPersonality}
                  className="px-6 py-3 rounded-full font-semibold bg-white/30 hover:bg-white/40 text-white border border-white/30 shadow-lg transition"
                  aria-label="Scroll naar formulier voor persoonlijkheid of interesses"
                >
                  Persoonlijkheid kiezen
                </button>
              )}
              {onStart && (
                <button
                  type="button"
                  onClick={onStart}
                  className="px-8 py-3 rounded-full font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-xl transition focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
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
