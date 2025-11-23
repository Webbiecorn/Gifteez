import React from 'react'

interface HeroHomeProps {
  onStartQuiz: () => void
  onViewGuides: () => void
}

const HeroHome: React.FC<HeroHomeProps> = ({ onStartQuiz, onViewGuides }) => {
  // Keyboard event handlers voor accessibility
  const handleQuizKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onStartQuiz()
    }
  }

  const handleGuidesKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onViewGuides()
    }
  }

  return (
    <section className="relative flex items-center overflow-hidden bg-gradient-to-b from-rose-50 via-white to-white sm:min-h-[80vh]">
      {/* Optional background illustration alleen op grotere schermen */}
      <div className="hidden md:block absolute inset-y-0 right-0 w-1/2 pointer-events-none select-none">
        <img
          src="/images/mascotte-hero-new-v4.png"
          alt="Gifteez mascotte illustratie"
          className="h-full w-full object-contain object-center opacity-90 drop-shadow-xl"
          loading="lazy"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 sm:py-16 lg:py-24">
        <div className="max-w-2xl lg:ml-0 text-center lg:text-left space-y-6 sm:space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-rose-100 shadow-sm mx-auto lg:mx-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-rose-600 tracking-wide uppercase">
              Perfect voor Sinterklaas & Kerst
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-900">
            Nooit meer <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-600 to-orange-500">
              cadeau-stress.
            </span>
          </h1>

          {/* Subhead */}
          <div className="space-y-4 max-w-xl mx-auto lg:mx-0">
            <p className="text-xl text-slate-800 font-medium leading-relaxed drop-shadow-sm">
              Laat onze <strong className="text-slate-900">AI Cadeaucoach</strong> je in minder dan
              een minuut helpen aan een shortlist met verrassende cadeau-ideeën – speciaal voor jouw
              relatie, budget en gelegenheid.
            </p>

            {/* How it works bullets */}
            <ul className="text-xs sm:text-sm md:text-base text-slate-700 space-y-1 text-left lg:text-left bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl px-4 py-3 inline-block shadow-sm">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                <span>Beantwoord 5 korte vragen over de ontvanger.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                <span>Krijg direct 10–20 cadeausuggesties op maat.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                <span>
                  Vergelijk prijzen, bewaar favorieten en klik door naar veilige webshops.
                </span>
              </li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 justify-center lg:justify-start pt-4">
            <button
              type="button"
              onClick={onStartQuiz}
              onKeyDown={handleQuizKeyDown}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-2xl shadow-xl shadow-rose-500/20 hover:shadow-rose-500/30 hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-rose-500 to-pink-600 text-white border-none group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              aria-label="Start de AI Cadeaucoach voor persoonlijk advies"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Cadeaucoach
                <svg
                  className="w-5 h-5 transition-transform group-hover:rotate-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </span>
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
            </button>

            <button
              type="button"
              onClick={onViewGuides}
              onKeyDown={handleGuidesKeyDown}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-slate-700 bg-white/80 hover:bg-white border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-lg hover:border-purple-200 flex items-center justify-center gap-2 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Scroll naar beneden om cadeau-gidsen te bekijken"
            >
              Bekijk Cadeau-gidsen
              <svg
                className="w-5 h-5 text-slate-400 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Trust Indicators - Compact voor mobile */}
          <div className="pt-4 sm:pt-6 pb-2 sm:pb-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-slate-600">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-center sm:text-left">
                Gratis & persoonlijk advies in 60 seconden
              </span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-slate-300" aria-hidden="true" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-center sm:text-left">
                Vergelijk prijzen bij betrouwbare webshops
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroHome
