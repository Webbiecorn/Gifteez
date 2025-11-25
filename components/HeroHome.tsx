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
    <section className="relative flex items-center overflow-hidden bg-gradient-to-br from-rose-50 via-purple-50/30 to-orange-50/20 sm:min-h-[85vh]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Optional background illustration alleen op grotere schermen */}
      <div className="hidden md:block absolute inset-y-0 right-0 w-1/2 pointer-events-none select-none">
        <img
          src="/images/mascotte-hero-new-v4.png"
          alt="Gifteez mascotte illustratie"
          className="h-full w-full object-contain object-center opacity-95 drop-shadow-2xl animate-float"
          loading="lazy"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-20 lg:py-28">
        <div className="max-w-2xl lg:ml-0 text-center lg:text-left space-y-6 sm:space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-white/90 to-rose-50/90 backdrop-blur-xl border border-rose-200/50 shadow-lg shadow-rose-500/10 mx-auto lg:mx-0 hover:scale-105 transition-transform duration-300">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r from-rose-500 to-pink-500 shadow-sm"></span>
            </span>
            <span className="text-xs sm:text-sm font-extrabold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent tracking-wide uppercase">
              Perfect voor Sinterklaas & Kerst
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight text-slate-900 drop-shadow-sm">
            Nooit meer <br />
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-600 to-orange-500 animate-gradient-x">
                cadeau-stress.
              </span>
              {/* Decorative underline */}
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-rose-500/30"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0,7 Q50,1 100,7 T200,7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subhead */}
          <div className="space-y-5 max-w-xl mx-auto lg:mx-0">
            <p className="text-lg sm:text-xl text-slate-700 font-medium leading-relaxed">
              Laat onze{' '}
              <strong className="font-extrabold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                AI Cadeaucoach
              </strong>{' '}
              je in minder dan een minuut helpen aan een shortlist met verrassende cadeau-ideeën –
              speciaal voor jouw relatie, budget en gelegenheid.
            </p>

            {/* How it works bullets */}
            <ul className="text-sm md:text-base text-slate-700 space-y-2.5 text-left lg:text-left bg-gradient-to-br from-white/95 to-rose-50/50 backdrop-blur-xl border border-rose-100/50 rounded-3xl px-5 py-4 inline-block shadow-xl shadow-rose-500/5 hover:shadow-rose-500/10 transition-shadow duration-300">
              <li className="flex items-start gap-3 group">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 shadow-sm group-hover:scale-125 transition-transform duration-300" />
                <span className="flex-1">Beantwoord 5 korte vragen over de ontvanger.</span>
              </li>
              <li className="flex items-start gap-3 group">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm group-hover:scale-125 transition-transform duration-300" />
                <span className="flex-1">Krijg direct 10–20 cadeausuggesties op maat.</span>
              </li>
              <li className="flex items-start gap-3 group">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 shadow-sm group-hover:scale-125 transition-transform duration-300" />
                <span className="flex-1">
                  Vergelijk prijzen, bewaar favorieten en klik door naar veilige webshops.
                </span>
              </li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-center lg:justify-start pt-6">
            <button
              type="button"
              onClick={onStartQuiz}
              onKeyDown={handleQuizKeyDown}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-extrabold rounded-2xl shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-1 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white border-none group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-rose-500/50 focus:ring-offset-2"
              aria-label="Start de AI Cadeaucoach voor persoonlijk advies"
            >
              <span className="relative z-10 flex items-center justify-center gap-2.5">
                🎁 Start Cadeaucoach
                <svg
                  className="w-5 h-5 transition-transform group-hover:rotate-12 group-hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0" />
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
            </button>

            <button
              type="button"
              onClick={onViewGuides}
              onKeyDown={handleGuidesKeyDown}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-slate-700 bg-white/90 hover:bg-white border-2 border-slate-200 hover:border-purple-300 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 flex items-center justify-center gap-2.5 backdrop-blur-xl group focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2"
              aria-label="Scroll naar beneden om cadeau-gidsen te bekijken"
            >
              <span>Bekijk Cadeau-gidsen</span>
              <svg
                className="w-5 h-5 text-purple-500 group-hover:animate-bounce transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Trust Indicators - Enhanced styling */}
          <div className="pt-6 sm:pt-8 pb-2 sm:pb-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-5 text-xs sm:text-sm font-semibold text-slate-600">
            <div className="flex items-center gap-2 sm:gap-2.5 group hover:scale-105 transition-transform duration-200">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-center sm:text-left text-slate-700">
                Gratis & persoonlijk advies in 60 sec
              </span>
            </div>
            <div
              className="hidden sm:block h-5 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent"
              aria-hidden="true"
            />
            <div className="flex items-center gap-2 sm:gap-2.5 group hover:scale-105 transition-transform duration-200">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white flex-shrink-0"
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
              </div>
              <span className="text-center sm:text-left text-slate-700">
                Vergelijk prijzen bij betrouwbare shops
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroHome
