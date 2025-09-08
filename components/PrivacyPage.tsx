import React, { useEffect } from 'react';
import { NavigateTo } from '../types';

interface PrivacyPageProps {
  navigateTo: NavigateTo;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ navigateTo }) => {
  useEffect(() => {
    document.title = 'Privacybeleid — Gifteez.nl';
    const ensure = (selector: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) { el = create(); document.head.appendChild(el); }
      return el;
    };
    const metaDesc = ensure('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }));
    metaDesc.setAttribute('content', 'Privacybeleid van Gifteez.nl - Lees hoe wij omgaan met uw persoonsgegevens en cookies.');
    const canonical = ensure('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l; });
    canonical.setAttribute('href', window.location.origin + '/privacy');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary via-blue-500 to-indigo-600 text-white overflow-hidden">
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
              <span className="text-3xl">🔒</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Privacybeleid
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Hoe wij omgaan met uw persoonsgegevens
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

              <h2>1. Inleiding</h2>
              <p>
                Bij Gifteez.nl hechten wij veel waarde aan uw privacy. Dit privacybeleid legt uit hoe wij
                persoonsgegevens verzamelen, gebruiken, beschermen en beheren wanneer u onze website bezoekt
                of gebruikt.
              </p>

              <h2>2. Verantwoordelijke</h2>
              <p>
                Gifteez.nl wordt beheerd door:
                <br />
                <strong>Gifteez.nl</strong>
                <br />
                Email: <a href="mailto:info@gifteez.nl" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline">info@gifteez.nl</a>
                <br />
                Website: <a href="https://gifteez.nl" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline">https://gifteez.nl</a>
              </p>

              <h2>3. Welke Gegevens Verzamelen Wij?</h2>
              <h3>3.1 Automatisch Verzamelde Gegevens</h3>
              <ul>
                <li><strong>Technische informatie:</strong> IP-adres, browsertype, besturingssysteem, schermresolutie</li>
                <li><strong>Gebruiksgegevens:</strong> Bezochte pagina's, tijd besteed op de website, klikgedrag</li>
                <li><strong>Cookies:</strong> Zie onze cookieverklaring hieronder</li>
              </ul>

              <h3>3.2 Door U Verstrekte Gegevens</h3>
              <ul>
                <li><strong>Contactformulier:</strong> Naam, emailadres, bericht</li>
                <li><strong>Newsletter:</strong> Emailadres voor inschrijving</li>
                <li><strong>Account:</strong> Gebruikersnaam, emailadres, wachtwoord (gehasht)</li>
              </ul>

              <h2>4. Cookies en Tracking</h2>
              <p>Wij gebruiken de volgende soorten cookies:</p>

              <h3>4.1 Functionele Cookies</h3>
              <p>
                Noodzakelijk voor de basisfunctionaliteit van de website, zoals navigatie en formulierinzendingen.
              </p>

              <h3>4.2 Analytische Cookies</h3>
              <p>
                Helpen ons te begrijpen hoe bezoekers de website gebruiken, zodat we de gebruikerservaring kunnen verbeteren.
                Wij gebruiken Google Analytics voor deze doeleinden.
              </p>

              <h3>4.3 Marketing Cookies</h3>
              <p>
                Gebruikt voor het tonen van relevante advertenties en het meten van de effectiviteit van marketingcampagnes.
              </p>

              <h3>4.4 Cookie Voorkeuren</h3>
              <p>
                U kunt uw cookievoorkeuren aanpassen via de cookiebanner die verschijnt bij uw eerste bezoek.
                U kunt cookies ook uitschakelen via uw browserinstellingen.
              </p>

              <h2>5. Hoe Gebruiken Wij Uw Gegevens?</h2>
              <ul>
                <li><strong>Website functionaliteit:</strong> Om de website correct te laten werken</li>
                <li><strong>Communicatie:</strong> Om te reageren op uw berichten en vragen</li>
                <li><strong>Verbetering:</strong> Om onze diensten te optimaliseren</li>
                <li><strong>Marketing:</strong> Om relevante informatie en aanbiedingen te sturen (alleen met toestemming)</li>
                <li><strong>Wettelijke verplichtingen:</strong> Om te voldoen aan toepasselijke wet- en regelgeving</li>
              </ul>

              <h2>6. Gegevens Delen met Derden</h2>
              <p>Wij delen uw persoonsgegevens alleen in de volgende gevallen:</p>

              <h3>6.1 Dienstverleners</h3>
              <p>
                Wij werken samen met vertrouwde dienstverleners die ons helpen bij het beheer van de website,
                emailverzending en analyse. Deze partijen hebben alleen toegang tot de gegevens die nodig zijn
                voor hun diensten en zijn contractueel verplicht om de privacy te respecteren.
              </p>

              <h3>6.2 Wettelijke Verplichtingen</h3>
              <p>
                Wanneer dit wettelijk vereist is, kunnen wij persoonsgegevens delen met autoriteiten
                of andere partijen om te voldoen aan juridische verplichtingen.
              </p>

              <h3>6.3 Bedrijfsveranderingen</h3>
              <p>
                Bij een fusie, overname of verkoop van activa kunnen persoonsgegevens worden overgedragen
                aan de nieuwe eigenaar, mits de privacybescherming gegarandeerd blijft.
              </p>

              <h2>7. Gegevens Beveiliging</h2>
              <p>
                Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen
                tegen verlies, misbruik, ongeautoriseerde toegang en andere vormen van onrechtmatige verwerking.
                Dit omvat:
              </p>
              <ul>
                <li>SSL/TLS encryptie voor gegevensoverdracht</li>
                <li>Beveiligde opslag van gevoelige gegevens</li>
                <li>Regelmatige beveiligingsaudits</li>
                <li>Toegangsbeperkingen voor medewerkers</li>
              </ul>

              <h2>8. Bewaartermijnen</h2>
              <p>
                Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk voor de doeleinden waarvoor ze zijn verzameld:
              </p>
              <ul>
                <li><strong>Contactformulier:</strong> 2 jaar na laatste contact</li>
                <li><strong>Newsletter:</strong> Tot uitschrijving</li>
                <li><strong>Analytische gegevens:</strong> 26 maanden (Google Analytics standaard)</li>
                <li><strong>Accountgegevens:</strong> Tot accountverwijdering of 7 jaar inactiviteit</li>
              </ul>

              <h2>9. Uw Rechten</h2>
              <p>Onder de AVG heeft u de volgende rechten:</p>

              <h3>9.1 Recht op Informatie</h3>
              <p>U heeft recht om te weten welke persoonsgegevens wij van u verwerken.</p>

              <h3>9.2 Recht op Rectificatie</h3>
              <p>U kunt verzoeken om onjuiste gegevens te corrigeren.</p>

              <h3>9.3 Recht op Wissing</h3>
              <p>U kunt verzoeken om uw gegevens te verwijderen (onder voorwaarden).</p>

              <h3>9.4 Recht op Beperking</h3>
              <p>U kunt de verwerking van uw gegevens laten beperken.</p>

              <h3>9.5 Recht op Bezwaar</h3>
              <p>U kunt bezwaar maken tegen bepaalde vormen van verwerking.</p>

              <h3>9.6 Recht op Gegevensoverdraagbaarheid</h3>
              <p>U kunt uw gegevens in een gestructureerde vorm opvragen.</p>

              <h2>10. Contact</h2>
              <p>
                Voor vragen over dit privacybeleid of uw rechten kunt u
                <button
                  onClick={() => navigateTo('contact')}
                  className="text-primary hover:text-blue-600 underline ml-1"
                >
                  contact
                </button>
                met ons opnemen.
              </p>

              <h2>11. Klachten</h2>
              <p>
                Als u een klacht heeft over de verwerking van uw persoonsgegevens, kunt u deze indienen bij:
                <br />
                <strong>Autoriteit Persoonsgegevens</strong>
                <br />
                Postbus 93374
                <br />
                2509 AJ Den Haag
                <br />
                Website: <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-blue-600">autoriteitpersoonsgegevens.nl</a>
              </p>

              <h2>12. Wijzigingen</h2>
              <p>
                Dit privacybeleid kan worden aangepast. Bij belangrijke wijzigingen zullen wij u hierover informeren
                via onze website of per email. De meest recente versie is altijd beschikbaar op deze pagina.
              </p>

              <div className="mt-12 p-6 bg-green-50 rounded-2xl border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Uw Privacy is Belangrijk</h3>
                <p className="text-green-800">
                  Wij streven ernaar transparant te zijn over hoe wij omgaan met uw gegevens. Als u vragen heeft
                  over dit privacybeleid, aarzel dan niet om contact met ons op te nemen. Wij helpen u graag verder!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
