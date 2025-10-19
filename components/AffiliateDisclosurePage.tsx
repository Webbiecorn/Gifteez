import React, { useEffect } from 'react'
import type { NavigateTo } from '../types'

interface AffiliateDisclosurePageProps {
  navigateTo: NavigateTo
}

const AffiliateDisclosurePage: React.FC<AffiliateDisclosurePageProps> = ({ navigateTo }) => {
  useEffect(() => {
    document.title = 'Affiliate Disclosure — Gifteez.nl'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-bg via-white to-light-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Affiliate Disclosure</h1>
          <p className="text-lg text-primary/70">
            Transparantie over onze partnerships en hoe Gifteez.nl werkt
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 space-y-8">
          {/* Intro */}
          <section>
            <p className="text-lg text-primary/80 leading-relaxed">
              Bij <strong>Gifteez.nl</strong> geloven we in volledige transparantie. Deze pagina
              legt uit hoe wij geld verdienen en waarom dit belangrijk is voor jou als bezoeker.
            </p>
          </section>

          {/* Wat zijn affiliate links */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
              <span className="text-3xl">🔗</span>
              Wat zijn affiliate links?
            </h2>
            <p className="text-primary/80 leading-relaxed mb-4">
              Gifteez.nl werkt samen met verschillende online retailers zoals{' '}
              <strong>Amazon</strong>, <strong>Coolblue</strong>,<strong>bol.com</strong> en andere
              webshops via zogenaamde <em>affiliate programma's</em>. Dit betekent dat wij een
              kleine commissie ontvangen wanneer je via onze links een product koopt.
            </p>
            <div className="bg-accent/5 border-l-4 border-accent p-4 rounded-lg">
              <p className="text-sm text-primary/75">
                <strong>Belangrijk:</strong> Dit kost jou niets extra! De prijs die je betaalt is
                exact hetzelfde als wanneer je rechtstreeks naar de webshop zou gaan. Het enige
                verschil is dat wij een kleine commissie ontvangen van de retailer.
              </p>
            </div>
          </section>

          {/* Onze partners */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
              <span className="text-3xl">🤝</span>
              Onze affiliate partners
            </h2>
            <p className="text-primary/80 leading-relaxed mb-4">
              Gifteez.nl is aangesloten bij de volgende affiliate netwerken en partners:
            </p>
            <ul className="space-y-3 text-primary/80">
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">▪</span>
                <div>
                  <strong>Amazon Associates</strong> — Als Amazon Partner verdienen wij aan
                  gekwalificeerde aankopen via onze Amazon-links.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">▪</span>
                <div>
                  <strong>Awin</strong> — Via het Awin netwerk werken we samen met retailers zoals
                  Coolblue, bol.com en anderen.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">▪</span>
                <div>
                  <strong>Andere partnerships</strong> — We werken met geselecteerde merken en
                  webshops die aansluiten bij onze missie: betekenisvolle cadeaus vinden.
                </div>
              </li>
            </ul>
          </section>

          {/* Hoe we producten selecteren */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
              <span className="text-3xl">✨</span>
              Hoe we producten selecteren
            </h2>
            <p className="text-primary/80 leading-relaxed mb-4">
              We raden <strong>alleen producten aan die we zelf goed vinden</strong>. Onze
              commissies hebben <em>geen invloed</em>
              op welke producten we tonen of aanbevelen. Ons doel is simpel:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gradient-to-br from-accent/10 to-highlight/10 p-5 rounded-xl border border-accent/20">
                <h3 className="font-semibold text-primary mb-2">🎯 Kwaliteit eerst</h3>
                <p className="text-sm text-primary/75">
                  We selecteren producten op basis van reviews, populariteit en relevantie — niet op
                  commissiepercentages.
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-5 rounded-xl border border-primary/20">
                <h3 className="font-semibold text-primary mb-2">💡 Eerlijke AI</h3>
                <p className="text-sm text-primary/75">
                  Onze AI Gift Finder gebruikt geen commerciële bias. De aanbevelingen zijn
                  gebaseerd op jouw voorkeuren.
                </p>
              </div>
            </div>
          </section>

          {/* Prijzen en beschikbaarheid */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
              <span className="text-3xl">💰</span>
              Prijzen en beschikbaarheid
            </h2>
            <p className="text-primary/80 leading-relaxed">
              We doen ons best om actuele prijzen en productinformatie te tonen. Echter,{' '}
              <strong>prijzen kunnen wijzigen</strong>
              en producten kunnen uitverkocht raken. De definitieve prijs en beschikbaarheid zie je
              altijd op de website van de retailer zelf. Wij zijn niet verantwoordelijk voor
              eventuele prijsverschillen of voorraadproblemen.
            </p>
          </section>

          {/* Jouw support */}
          <section className="bg-gradient-to-r from-accent/5 via-primary/5 to-highlight/5 rounded-2xl p-6 border border-accent/20">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
              <span className="text-3xl">❤️</span>
              Jouw support betekent veel
            </h2>
            <p className="text-primary/80 leading-relaxed mb-4">
              Door via onze links te shoppen, help je Gifteez.nl gratis en toegankelijk te houden
              voor iedereen. De commissies die we ontvangen gebruiken we om:
            </p>
            <ul className="space-y-2 text-primary/75">
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span> Onze AI Gift Finder te verbeteren
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span> Nieuwe cadeaugidsen en blogs te schrijven
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span> De website te onderhouden en te optimaliseren
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span> Gratis tools te blijven aanbieden
                (GiftFinder, Cadeau Quiz, etc.)
              </li>
            </ul>
          </section>

          {/* Vragen */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
              <span className="text-3xl">💬</span>
              Vragen?
            </h2>
            <p className="text-primary/80 leading-relaxed mb-4">
              Heb je vragen over onze affiliate partnerships of hoe we werken? Neem gerust contact
              op!
            </p>
            <button
              onClick={() => navigateTo('contact')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-xl 
                       hover:bg-accent-dark transition-colors shadow-md hover:shadow-lg"
            >
              <span>✉️</span>
              Contact opnemen
            </button>
          </section>

          {/* Footer note */}
          <section className="pt-6 border-t border-primary/10">
            <p className="text-sm text-primary/60 leading-relaxed">
              <strong>Laatste update:</strong> 19 oktober 2025
              <br />
              Deze affiliate disclosure voldoet aan de richtlijnen van de FTC (Federal Trade
              Commission) en Nederlandse wetgeving omtrent transparantie in online marketing.
            </p>
          </section>
        </div>

        {/* Back button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigateTo('home')}
            className="text-accent hover:text-accent-dark font-medium transition-colors"
          >
            ← Terug naar home
          </button>
        </div>
      </div>
    </div>
  )
}

export default AffiliateDisclosurePage
