import React from 'react'
import { withAffiliate } from '../services/affiliate'
import ImageWithFallback from './ImageWithFallback'

type AmazonTeaserProps = {
  items: Array<{
    title: string
    imageUrl: string
    affiliateUrl: string // Use Amazon Associate SiteStripe or generated affiliate URLs
  }>
  note?: string
  fallbackImageSrc?: string // local placeholder fallback
}

const AmazonTeaser: React.FC<AmazonTeaserProps> = ({
  items,
  note,
  fallbackImageSrc = '/images/amazon-placeholder.png',
}) => {
  return (
    <section className="animate-fade-in">
      <h2 className="font-display text-3xl font-bold text-primary mb-6">Amazon cadeautips</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((it, idx) => {
          const href = withAffiliate(it.affiliateUrl, {
            pageType: 'home',
            placement: 'amazon-teaser-cta',
            cardIndex: idx,
          })
          return (
            <a
              key={idx}
              href={href}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              aria-label={`Bekijk ${it.title} op Amazon (opent in nieuw tab)`}
              className="group focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 rounded-lg transition-shadow duration-300"
            >
              <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                <div className="overflow-hidden aspect-square flex items-center justify-center bg-white">
                  <ImageWithFallback
                    src={it.imageUrl}
                    fallbackSrc={fallbackImageSrc}
                    alt={it.title}
                    className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                    fit="contain"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-display text-lg font-bold text-primary flex-grow line-clamp-3">
                    {it.title}
                  </h3>
                  <span className="mt-4 inline-block bg-primary text-white rounded-md px-4 py-2 text-center font-semibold group-hover:bg-accent transition-colors duration-300">
                    Bekijk op Amazon →
                  </span>
                </div>
              </div>
            </a>
          )
        })}
      </div>
      <p className="text-sm text-gray-500 mt-4">
        {note ||
          'Tip: Prijzen en beschikbaarheid kunnen wijzigen. Bekijk altijd de actuele prijs op Amazon.'}
      </p>
    </section>
  )
}

export default AmazonTeaser
