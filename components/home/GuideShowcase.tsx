import React from 'react'
import { buildGuidePath } from '../../guidePaths'

const guideShowcase = [
  {
    slug: 'kerst-voor-haar-onder-50',
    badge: '💝 Onder €50',
    title: 'Warm & persoonlijk voor haar',
    summary: 'Beauty, wellness en designcadeaus die klaarstaan voor Kerst.',
    chips: ['Beauty', 'Wellness', 'Design'],
    gradient: 'from-rose-500 to-pink-600',
    bgGlow: 'bg-rose-500',
  },
  {
    slug: 'kerst-voor-hem-onder-150',
    badge: '🎩 Premium',
    title: 'Voor hem die alles al heeft',
    summary: 'Mix van tech, whisky en ervaringstips tot €150.',
    chips: ['Tech', 'Whisky', 'Ervaring'],
    gradient: 'from-blue-500 to-indigo-600',
    bgGlow: 'bg-blue-500',
  },
  {
    slug: 'duurzamere-cadeaus-onder-50',
    badge: '🌱 Duurzaam',
    title: 'Duurzame cadeaus onder €50',
    summary: 'Keurmerken, lokale makers en herbruikbare materialen.',
    chips: ['Eco', 'Bewust', 'Lokaal'],
    gradient: 'from-emerald-500 to-teal-600',
    bgGlow: 'bg-emerald-500',
  },
  {
    slug: 'last-minute-kerstcadeaus-vandaag-bezorgd',
    badge: '⚡ Last-minute',
    title: 'Vandaag nog bezorgd',
    summary: 'Snelle cadeaus bij Coolblue en Amazon vóór de feestdagen.',
    chips: ['Same-day', 'Gadgets', 'Express'],
    gradient: 'from-orange-500 to-amber-600',
    bgGlow: 'bg-orange-500',
  },
]

interface GuideShowcaseProps {
  onViewAllGuides: () => void
}

const GuideShowcase: React.FC<GuideShowcaseProps> = ({ onViewAllGuides }) => {
  return (
    <section className="relative py-24 bg-slate-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 text-sm font-semibold mb-4">
            🎯 Populairste gidsen
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Begin met onze
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
              {' '}
              topgidsen
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Selecties per budget, persoon en gelegenheid. Klik door en bestel direct.
          </p>
        </div>

        {/* Guide Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto">
          {guideShowcase.map((guide) => (
            <a key={guide.slug} href={buildGuidePath(guide.slug)} className="group relative">
              {/* Glow effect on hover */}
              <div
                className={`absolute -inset-0.5 ${guide.bgGlow} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
              />

              {/* Card */}
              <div className="relative h-full flex flex-col rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 transition-all duration-300 group-hover:border-white/20 group-hover:-translate-y-2 group-hover:bg-white/10">
                {/* Badge */}
                <span
                  className={`inline-flex w-fit items-center rounded-full bg-gradient-to-r ${guide.gradient} px-3 py-1 text-xs font-bold text-white shadow-lg`}
                >
                  {guide.badge}
                </span>

                {/* Title */}
                <h3 className="mt-4 text-xl font-bold text-white group-hover:text-rose-300 transition-colors">
                  {guide.title}
                </h3>

                {/* Summary */}
                <p className="mt-2 text-sm text-white/60 flex-1">{guide.summary}</p>

                {/* Chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {guide.chips.map((chip) => (
                    <span
                      key={`${guide.slug}-${chip}`}
                      className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <span className="mt-6 inline-flex items-center text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                  Bekijk gids
                  <svg
                    className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onViewAllGuides}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            Bekijk alle 20+ cadeaugidsen
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default GuideShowcase
