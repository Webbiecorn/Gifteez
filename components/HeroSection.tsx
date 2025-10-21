import React from 'react'

const HERO_SRC = '/images/hero-giftfinder-afb9.png'

interface HeroSectionProps {
  onCtaClick?: () => void
}

/**
 * Modern hero with floating sparkles and clean design
 * No text overlap with mascot, professional layout
 */
const HeroSection: React.FC<HeroSectionProps> = ({ onCtaClick }) => {
  return (
    <section
      className="
        relative isolate overflow-hidden
        bg-gradient-to-br from-[#fff7ed] via-[#ffe8d1] to-[#ffd4b8]
        min-h-[92vh] w-full flex items-center
      "
    >
      {/* Animated floating sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Sparkle 1 - Top Left */}
        <div className="absolute top-[15%] left-[8%] animate-float-slow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#fb923c" fillOpacity="0.4"/>
          </svg>
        </div>
        
        {/* Sparkle 2 - Top Right */}
        <div className="absolute top-[25%] right-[12%] animate-float-delayed">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#f43f5e" fillOpacity="0.3"/>
          </svg>
        </div>
        
        {/* Sparkle 3 - Bottom Left */}
        <div className="absolute bottom-[20%] left-[15%] animate-float-slow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#fbbf24" fillOpacity="0.5"/>
          </svg>
        </div>
        
        {/* Sparkle 4 - Mid Right */}
        <div className="absolute top-[45%] right-[8%] animate-float-delayed">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#fb923c" fillOpacity="0.35"/>
          </svg>
        </div>

        {/* Sparkle 5 - Top Center */}
        <div className="absolute top-[10%] left-[45%] animate-float-slow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#f43f5e" fillOpacity="0.4"/>
          </svg>
        </div>

        {/* Subtle glow effects */}
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-rose-300/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[15%] right-[15%] w-80 h-80 bg-orange-300/10 rounded-full blur-3xl animate-pulse-slower" />
      </div>

      {/* Mascot Image - Full background */}
      <img
        src={HERO_SRC}
        alt="Gifteez mascotte - vrolijke cadeaudoos met zwevende cadeautjes"
        loading="eager"
        decoding="async"
        className="
          absolute inset-0 w-full h-full
          object-cover
          select-none pointer-events-none
          animate-float-gentle
        "
        style={{
          objectPosition: 'center center',
        }}
      />

      {/* Text Content Overlay */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full md:w-[40%] lg:w-[38%] space-y-6 md:space-y-8 animate-fade-in-up">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-rose-100">
            <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-rose-600 uppercase tracking-wider">
              AI-Powered Gift Discovery
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">
              <span className="block text-rose-600 mb-2">Vind het perfecte</span>
              <span className="block bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                cadeau
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-xl">
            Beantwoord een paar vragen en onze AI vindt binnen 30 seconden het perfecte cadeau, 
            <span className="font-semibold text-rose-600"> speciaal voor jou</span>.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-orange-100">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Gratis te gebruiken</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-rose-100">
              <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Binnen 30 seconden</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={onCtaClick}
              className="
                group relative inline-flex items-center gap-3
                px-8 py-4 md:px-10 md:py-5
                rounded-full font-bold text-lg
                bg-gradient-to-r from-rose-500 to-pink-500
                text-white shadow-xl
                hover:shadow-2xl hover:scale-105
                active:scale-95
                transition-all duration-300
                focus:outline-none focus:ring-4 focus:ring-rose-300
              "
            >
              <span>Start GiftFinder</span>
              <svg 
                className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              
              {/* Button glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
            </button>
            
            {/* Trust indicator */}
            <p className="mt-4 text-sm text-gray-600 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Vertrouwd door <strong>10.000+</strong> cadeaugevers</span>
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}

export default HeroSection
