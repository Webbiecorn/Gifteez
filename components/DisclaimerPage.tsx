import React from 'react';

const DisclaimerPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">Disclaimer & Affiliate Disclosure</h1>
      <div className="prose max-w-none text-gray-700">
        <p>
          Gifteez.nl biedt cadeau-inspiratie en verwijst naar webshops via affiliatelinks. Wanneer je via zo’n link een aankoop doet, kunnen wij een commissie ontvangen. Dit kost jou niets extra en helpt ons om de site te onderhouden.
        </p>
        <h2>Geen aansprakelijkheid voor prijzen of beschikbaarheid</h2>
        <p>
          Prijzen, levertijden en beschikbaarheid veranderen regelmatig. Controleer altijd de actuele gegevens op de productpagina van de webshop. Aan informatie op Gifteez.nl kunnen geen rechten worden ontleend.
        </p>
        <h2>Onafhankelijkheid</h2>
        <p>
          Aanbevelingen zijn redactioneel en bedoeld om je te helpen. Affiliate-vergoedingen beïnvloeden onze selectie of beoordeling niet.
        </p>
        <h2>Merken en beeldmateriaal</h2>
        <p>
          Alle merknamen en logo’s behoren toe aan hun respectievelijke eigenaren. We gebruiken geen materiaal dat inbreuk maakt op rechten voorbehouden.
        </p>
        <h2>Contact</h2>
        <p>
          Vragen? Neem contact op via onze contactpagina.
        </p>
      </div>
    </div>
  );
};

export default DisclaimerPage;
