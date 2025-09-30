import React, { useEffect } from 'react';
import { NavigateTo } from '../types';

interface DisclaimerPageProps {
  navigateTo: NavigateTo;
}

const DisclaimerPage: React.FC<DisclaimerPageProps> = ({ navigateTo }) => {
  useEffect(() => {
    document.title = 'Disclaimer — Gifteez.nl';
    const ensure = (selector: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) { el = create(); document.head.appendChild(el); }
      return el;
    };
    const metaDesc = ensure('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }));
    metaDesc.setAttribute('content', 'Disclaimer en juridische voorwaarden van Gifteez.nl - Lees onze algemene voorwaarden en aansprakelijkheid.');
    const canonical = ensure('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l; });
    canonical.setAttribute('href', window.location.origin + '/disclaimer');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/20">
      {/* Hero Section */}
  <section className="relative bg-gradient-to-r from-primary via-accent to-accent-hover text-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-1/4 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full opacity-5"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <span className="text-3xl">⚖️</span>
            </div>
            <h1 className="typo-h1 mb-6 leading-tight text-white">
              Disclaimer
            </h1>
            <p className="typo-lead text-white/90 max-w-3xl mx-auto">
              Algemene voorwaarden en juridische informatie
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="prose prose-lg lg:prose-xl max-w-none text-gray-700">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Laatst bijgewerkt:</strong> {new Date().toLocaleDateString('nl-NL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>

              <h2>1. Algemene Informatie</h2>
              <p>
                Gifteez.nl is een website die cadeautips en cadeau-ideeën aanbiedt met behulp van kunstmatige intelligentie.
                Wij streven ernaar accurate en nuttige informatie te verstrekken, maar kunnen geen garantie geven voor
                de volledigheid of juistheid van de informatie.
              </p>

              <h2>2. Gebruik van de Website</h2>
              <p>
                Door gebruik te maken van Gifteez.nl gaat u akkoord met deze disclaimer. Het gebruik van onze website
                is geheel op eigen risico. Wij zijn niet verantwoordelijk voor eventuele schade die voortvloeit uit
                het gebruik van onze website of de informatie die daarop wordt verstrekt.
              </p>

              <h2>3. Productinformatie en Prijzen</h2>
              <p>
                Gifteez.nl fungeert als Amazon-partner en partner van andere webshops. Productinformatie, prijzen en
                beschikbaarheid kunnen zonder voorafgaande kennisgeving veranderen. Wij raden u aan altijd de actuele
                informatie te controleren op de website van de betreffende verkoper voordat u een aankoop doet.
              </p>

              <h2>4. Affiliate Links</h2>
              <p>
                Sommige links op onze website zijn affiliate links. Wanneer u via deze links een aankoop doet,
                ontvangen wij mogelijk een commissie. Dit heeft geen invloed op de prijs die u betaalt, maar helpt
                ons om de website gratis aan te bieden en te verbeteren.
              </p>

              <h2>5. AI-Generated Content</h2>
              <p>
                De cadeau-aanbevelingen op Gifteez.nl worden gegenereerd met behulp van kunstmatige intelligentie.
                Hoewel wij ons best doen om accurate en relevante suggesties te geven, zijn deze aanbevelingen
                niet gegarandeerd en dienen uitsluitend als inspiratie.
              </p>

              <h2>6. Aansprakelijkheid</h2>
              <p>
                Gifteez.nl en haar eigenaren, medewerkers en partners zijn niet aansprakelijk voor:
              </p>
              <ul>
                <li>Directe of indirecte schade voortvloeiend uit het gebruik van onze website</li>
                <li>Onjuiste of onvolledige informatie</li>
                <li>Problemen met externe websites waarnaar wordt gelinkt</li>
                <li>Gevolgschade door aankopen gedaan via onze affiliate links</li>
                <li>Technische problemen of storingen van de website</li>
              </ul>

              <h2>7. Intellectueel Eigendom</h2>
              <p>
                Alle content op Gifteez.nl, inclusief teksten, afbeeldingen, logo's en software, is beschermd door
                intellectuele eigendomsrechten. Het is niet toegestaan om deze content te kopiëren, verspreiden of
                gebruiken zonder voorafgaande schriftelijke toestemming.
              </p>

              <h2>8. Privacy en Cookies</h2>
              <p>
                Wij respecteren uw privacy en hanteren een strikt privacybeleid. Lees ons
                <button
                  onClick={() => navigateTo('privacy')}
                  className="text-primary hover:text-accent underline ml-1"
                >
                  privacybeleid
                </button>
                voor meer informatie over hoe wij omgaan met uw persoonsgegevens.
              </p>

              <h2>9. Wijzigingen</h2>
              <p>
                Gifteez.nl behoudt zich het recht voor om deze disclaimer op elk moment te wijzigen.
                De meest recente versie is altijd beschikbaar op deze pagina.
              </p>

              <h2>10. Contact</h2>
              <p>
                Heeft u vragen over deze disclaimer of onze diensten? Neem dan
                <button
                  onClick={() => navigateTo('contact')}
                  className="text-primary hover:text-accent underline ml-1"
                >
                  contact
                </button>
                met ons op.
              </p>

              <div className="mt-12 p-6 bg-secondary rounded-2xl border border-muted-rose">
                <h3 className="text-lg font-semibold text-primary mb-2">Belangrijke Opmerking</h3>
                <p className="text-accent">
                  Deze disclaimer is bedoeld om onze rechten en plichten duidelijk te maken. Het gebruik van Gifteez.nl
                  blijft volledig op eigen risico. Bij twijfel over juridische zaken raden wij u aan professioneel
                  advies in te winnen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
