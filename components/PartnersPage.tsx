import React from 'react'
import { buildGuidePath } from '../guidePaths'
import JsonLd from './JsonLd'
import Meta from './Meta'
import type { NavigateTo } from '../types'

interface PartnersPageProps {
  navigateTo: NavigateTo
}

const partners = [
  {
    id: 'coolblue',
    name: 'Coolblue',
    tagline: 'Alles voor een glimlach',
    description:
      'Nederlands familiebedrijf met uitstekende service, snelle levering en ruim assortiment tech, huishouden en gadgets. Gratis bezorging vanaf €20 en vaak volgende dag in huis.',
    categories: ['Tech', 'Huishouden', 'Audio', 'Gaming'],
    highlights: ['Gratis bezorging', 'Uitstekende reviews', 'Nederlandse klantenservice'],
    color: 'from-sky-500 to-blue-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-700',
    affiliateUrl:
      'https://www.awin1.com/cread.php?awinmid=85161&awinaffid=2566111&ued=https%3A%2F%2Fwww.coolblue.nl%2Fadvies%2Fcadeaugids',
    guideSlug: 'kerst-tech-onder-100',
    logo: '🧊',
  },
  {
    id: 'holland-barrett',
    name: 'Holland & Barrett',
    tagline: 'Gezond & Natuurlijk',
    description:
      'Specialist in vitamines, supplementen, natuurlijke verzorging en gezonde voeding. Perfect voor wellness cadeaus en bewuste gevers.',
    categories: ['Wellness', 'Vitamines', 'Natuurlijk', 'Beauty'],
    highlights: ['Duurzame producten', 'Expert advies', 'Breed wellness assortiment'],
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    affiliateUrl:
      'https://www.awin1.com/cread.php?awinmid=19652&awinaffid=2566111&ued=https%3A%2F%2Fwww.hollandandbarrett.nl%2F',
    guideSlug: 'holland-barrett-wellness-cadeaus',
    logo: '🌿',
  },
  {
    id: 'slygad',
    name: 'SLYGAD',
    tagline: 'Unieke Gadgets & Lifestyle',
    description:
      'Webshop vol originele gadgets, grappige cadeaus en lifestyle producten. Ideaal voor wie op zoek is naar iets unieks.',
    categories: ['Gadgets', 'Lifestyle', 'Mannen', 'Fun'],
    highlights: ['Originele producten', 'Cadeautips', 'Snelle levering'],
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    affiliateUrl:
      'https://tc.tradetracker.net/?c=40825&m=12&a=498806&u=https%3A%2F%2Fslygad.com%2F',
    guideSlug: 'kerst-voor-hem-onder-150',
    logo: '🎮',
  },
  {
    id: 'partypro',
    name: 'PartyPro.nl',
    tagline: 'Feest & Decoratie',
    description:
      'Alles voor een geslaagd feest: ballonnen, decoratie, thema-artikelen en feestbenodigdheden voor elke gelegenheid.',
    categories: ['Feest', 'Decoratie', 'Ballonnen', 'Thema'],
    highlights: ['Groot assortiment', 'Betaalbaar', 'Snelle levering'],
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-700',
    affiliateUrl:
      'https://www.daisycon.com/nl/click/gifteez?dc_t=partypro&dc_turl=https%3A%2F%2Fwww.partypro.nl%2F',
    guideSlug: null,
    logo: '🎉',
  },
  {
    id: 'amazon',
    name: 'Amazon.nl',
    tagline: 'Alles onder één dak',
    description:
      'Het grootste online warenhuis ter wereld. Van boeken tot elektronica, van speelgoed tot huishouden — met Prime vaak dezelfde dag nog bezorgd.',
    categories: ['Alles', 'Boeken', 'Tech', 'Speelgoed'],
    highlights: ['Prime levering', 'Enorm assortiment', 'Reviews van miljoenen'],
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    affiliateUrl: 'https://www.amazon.nl/?tag=gifteez77-21',
    guideSlug: 'last-minute-kerstcadeaus-vandaag-bezorgd',
    logo: '📦',
  },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Onze Partners — Betrouwbare Winkels voor Jouw Cadeau',
  description:
    'Ontdek de betrouwbare webshops waar Gifteez mee samenwerkt. Van Coolblue tot Amazon — vind het perfecte cadeau bij onze partners.',
  url: 'https://gifteez.nl/deals',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Gifteez Partner Winkels',
    itemListElement: partners.map((partner, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Organization',
        name: partner.name,
        description: partner.description,
        url: partner.affiliateUrl,
      },
    })),
  },
}

const PartnersPage: React.FC<PartnersPageProps> = ({ navigateTo }) => {
  return (
    <>
      <Meta
        title="Onze Partners — Waar te Kopen | Gifteez"
        description="Ontdek de betrouwbare webshops waar Gifteez mee samenwerkt. Van Coolblue tot Holland & Barrett — vind het perfecte cadeau bij onze partners."
        canonical="https://gifteez.nl/deals"
      />
      <JsonLd data={structuredData} id="partners-page-jsonld" />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 lg:py-28">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm font-semibold mb-6">
                🤝 Betrouwbare partners
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6">
                Shop bij onze{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
                  partners
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
                Wij werken samen met de beste Nederlandse en internationale webshops. Zo weet je
                zeker dat je altijd betrouwbaar en voordelig shopt.
              </p>
            </div>
          </div>
        </section>

        {/* Partners Grid */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {partners.map((partner) => (
                <article
                  key={partner.id}
                  className={`group relative rounded-3xl ${partner.bgColor} ${partner.borderColor} border-2 p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
                >
                  {/* Logo & Name */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${partner.color} flex items-center justify-center text-3xl shadow-lg`}
                    >
                      {partner.logo}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{partner.name}</h2>
                      <p className={`text-sm font-medium ${partner.textColor}`}>
                        {partner.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">{partner.description}</p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {partner.categories.map((cat) => (
                      <span
                        key={`${partner.id}-${cat}`}
                        className="px-3 py-1 rounded-full bg-white/80 text-xs font-medium text-gray-700"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-2 mb-8">
                    {partner.highlights.map((highlight) => (
                      <li
                        key={`${partner.id}-${highlight}`}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <svg
                          className={`w-4 h-4 ${partner.textColor}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  {/* CTAs */}
                  <div className="flex flex-col gap-3">
                    <a
                      href={partner.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${partner.color} text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                    >
                      Shop bij {partner.name}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                    {partner.guideSlug && (
                      <a
                        href={buildGuidePath(partner.guideSlug)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
                      >
                        Bekijk cadeaugids
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-rose-500 to-orange-500">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Liever direct een cadeau vinden?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Gebruik onze cadeaugidsen om binnen minuten het perfecte cadeau te vinden — met
              producten van al onze partners.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('cadeausHub')}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-rose-600 font-bold text-lg shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              Bekijk alle cadeaugidsen
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </section>

        {/* Affiliate Disclosure */}
        <section className="py-12 bg-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-sm text-gray-500">
                <strong>Affiliate disclosure:</strong> Gifteez ontvangt een kleine commissie wanneer
                je via onze links koopt. Dit heeft geen invloed op de prijs die je betaalt en helpt
                ons om deze website gratis te houden.{' '}
                <a href="/affiliate-disclosure" className="underline hover:text-gray-700">
                  Meer informatie
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default PartnersPage
