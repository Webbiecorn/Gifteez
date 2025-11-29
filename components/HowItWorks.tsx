import React from 'react'

const steps = [
  {
    id: 1,
    title: 'Kies je gids',
    description: 'Selecteer een cadeaugids op basis van persoon, budget of gelegenheid.',
    icon: '📚',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    id: 2,
    title: 'Filter & vergelijk',
    description: 'Gebruik slimme filters om precies te vinden wat je zoekt.',
    icon: '🔍',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 3,
    title: 'Bestel direct',
    description: 'Klik door naar de webshop en bestel met vertrouwen.',
    icon: '🛒',
    gradient: 'from-orange-500 to-amber-600',
  },
]

const HowItWorks: React.FC = () => {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Zo simpel werkt het
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">
            In 3 stappen naar het
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
              {' '}
              perfecte cadeau
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Geen eindeloos zoeken meer. Onze gidsen brengen je direct naar de beste cadeaus.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="relative group">
              {/* Connector line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-slate-200 to-transparent z-0" />
              )}

              {/* Card */}
              <div className="relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                {/* Step number */}
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                  {step.id}
                </div>

                {/* Icon */}
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-4xl shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                >
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom accent */}
        <div className="mt-16 text-center">
          <p className="inline-flex items-center gap-2 text-sm text-slate-500 font-medium">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Gemiddeld binnen 2 minuten het perfecte cadeau gevonden
          </p>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
