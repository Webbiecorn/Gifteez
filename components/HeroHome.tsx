import React, { useEffect, useState } from 'react'

interface HeroHomeProps {
  onStartQuiz: () => void
  onViewGuides: () => void
}

// Budget opties voor snelle navigatie
const budgetOptions = [
  {
    label: 'Tot €25',
    slug: 'cadeaus-tot-25-euro',
    emoji: '🎁',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    label: '€25 - €50',
    slug: 'cadeaus-25-tot-50-euro',
    emoji: '✨',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    label: '€50 - €100',
    slug: 'cadeaus-50-tot-100-euro',
    emoji: '🌟',
    color: 'from-purple-500 to-pink-500',
  },
  {
    label: '€100+',
    slug: 'cadeaus-boven-100-euro',
    emoji: '💎',
    color: 'from-amber-500 to-orange-500',
  },
]

// Partners
const partners = [
  { name: 'Coolblue', highlight: true },
  { name: 'Holland & Barrett', highlight: false },
  { name: 'SLYGAD', highlight: false },
  { name: 'PartyPro', highlight: false },
  { name: 'Amazon', highlight: false },
]

const HeroHome: React.FC<HeroHomeProps> = ({ onStartQuiz, onViewGuides }) => {
  // Countdown naar Sinterklaas (5 december)
  const [daysToSint, setDaysToSint] = useState<number | null>(null)

  useEffect(() => {
    const now = new Date()
    const sinterklaas = new Date(now.getFullYear(), 11, 5) // 5 december
    if (now > sinterklaas) {
      sinterklaas.setFullYear(sinterklaas.getFullYear() + 1)
    }
    const diff = Math.ceil((sinterklaas.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    setDaysToSint(diff)
  }, [])

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />

      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-rose-500 rounded-full mix-blend-screen filter blur-[120px] animate-blob" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-orange-500 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating gift icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['🎁', '✨', '🎄', '💝', '🎅', '⭐'].map((emoji, i) => (
          <span
            key={i}
            className="absolute text-3xl md:text-5xl opacity-10 animate-float"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-10">
          {/* Urgency Badge */}
          {daysToSint !== null && daysToSint <= 30 && daysToSint > 0 && (
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500/20 to-orange-500/20 backdrop-blur-xl border border-rose-400/30 shadow-lg shadow-rose-500/20 animate-pulse">
              <span className="text-2xl">🎅</span>
              <span className="text-sm sm:text-base font-bold text-white">
                Nog <span className="text-rose-400 font-black">{daysToSint}</span> dagen tot
                Sinterklaas!
              </span>
            </div>
          )}

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black leading-[0.95] tracking-tight">
              <span className="text-white drop-shadow-2xl">Vind het</span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-orange-400 animate-gradient-x">
                  perfecte cadeau
                </span>
                {/* Sparkle decorations */}
                <svg
                  className="absolute -top-4 -right-8 w-8 h-8 text-yellow-400 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
                </svg>
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/70 font-medium max-w-3xl mx-auto leading-relaxed">
              Ontdek <span className="text-white font-bold">20+ cadeaugidsen</span> met meer dan{' '}
              <span className="text-rose-400 font-bold">70.000 producten</span> — voor elk budget,
              elke persoon, elke gelegenheid.
            </p>
          </div>

          {/* Budget Quick Select */}
          <div className="space-y-4">
            <p className="text-white/50 text-sm font-semibold uppercase tracking-widest">
              Kies je budget & start direct
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
              {budgetOptions.map((option) => (
                <a
                  key={option.slug}
                  href={`/cadeaugids/${option.slug}`}
                  className="group relative flex flex-col items-center gap-2 p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/10"
                >
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                  />
                  <span className="text-3xl sm:text-4xl group-hover:scale-125 transition-transform duration-300">
                    {option.emoji}
                  </span>
                  <span className="text-white font-bold text-sm sm:text-base relative z-10">
                    {option.label}
                  </span>
                  <span className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/60 text-xs">
                    →
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <button
              type="button"
              onClick={onViewGuides}
              className="group relative px-10 sm:px-14 py-5 sm:py-6 text-lg sm:text-xl font-black rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white shadow-2xl shadow-rose-500/40 hover:shadow-rose-500/60 hover:-translate-y-1 hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                Bekijk alle cadeaugidsen
                <svg
                  className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </button>

            {/* AI Coach als subtiele link */}
            <button
              type="button"
              onClick={onStartQuiz}
              className="group flex items-center gap-2 text-white/50 hover:text-white/80 text-sm font-medium transition-colors"
            >
              <svg
                className="w-4 h-4 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
              <span>Of probeer de AI Cadeaucoach</span>
              <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto pt-8 border-t border-white/10">
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
                70K+
              </p>
              <p className="text-white/50 text-xs sm:text-sm font-medium mt-1">Producten</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                20+
              </p>
              <p className="text-white/50 text-xs sm:text-sm font-medium mt-1">Cadeaugidsen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                5
              </p>
              <p className="text-white/50 text-xs sm:text-sm font-medium mt-1">Partners</p>
            </div>
          </div>

          {/* Partner Strip */}
          <div className="pt-6">
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-4">
              Producten van betrouwbare webshops
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {partners.map((partner) => (
                <span
                  key={partner.name}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    partner.highlight
                      ? 'bg-gradient-to-r from-blue-500/20 to-blue-400/20 text-blue-300 border border-blue-400/30'
                      : 'bg-white/5 text-white/50 border border-white/10 hover:text-white/70 hover:border-white/20'
                  }`}
                >
                  {partner.name}
                </span>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
            <div className="flex flex-col items-center gap-2 text-white/30">
              <span className="text-xs font-medium">Scroll voor meer</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroHome
