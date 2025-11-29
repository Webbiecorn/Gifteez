import React from 'react'

interface DealsSectionProps {
  onViewDeals: () => void
}

const features = [
  {
    title: 'Expert Selectie',
    description: 'Elk product getest op kwaliteit, originaliteit en cadeauwaarde.',
    icon: '✨',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    title: 'Betrouwbare Partners',
    description: 'We werken met Coolblue, Holland & Barrett, Amazon en meer.',
    icon: '🤝',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Snelle Levering',
    description: 'Filter op levertijd en ontvang je cadeau op tijd.',
    icon: '🚀',
    gradient: 'from-orange-500 to-amber-600',
  },
]

const stats = [
  { value: '70K+', label: 'Producten' },
  { value: '20+', label: 'Gidsen' },
  { value: '5', label: 'Partners' },
  { value: '24/7', label: 'Toegang' },
]

const DealsSection: React.FC<DealsSectionProps> = ({ onViewDeals }) => {
  return (
    <section className="relative py-24 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-600 text-sm font-semibold mb-4">
            🤝 Betrouwbaar shoppen
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">
            Waarom kiezen voor
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
              {' '}
              Gifteez?
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Wij doen het zoekwerk, jij plukt de vruchten. Shop bij betrouwbare partners.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
                    {stat.value}
                  </p>
                  <p className="text-white/60 text-sm font-medium mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            type="button"
            onClick={onViewDeals}
            className="group relative px-10 py-5 text-lg font-bold rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-1 hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              🤝 Bekijk onze Partners
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </button>

          <p className="mt-4 text-sm text-slate-500">
            We werken met affiliate-partners. Jij betaalt niets extra.
          </p>
        </div>
      </div>
    </section>
  )
}

export default DealsSection
