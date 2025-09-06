import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">Privacybeleid</h1>
      <div className="prose max-w-none text-gray-700">
        <p>
          We hechten veel waarde aan jouw privacy. Op deze pagina lichten we toe welke gegevens we (kunnen) verwerken en waarom.
        </p>
        <h2>Welke gegevens</h2>
        <ul>
          <li>Functionele gegevens (bijv. favorieten die je zelf opslaat).</li>
          <li>Optioneel: analytische gegevens (alleen als je hiervoor toestemming geeft).</li>
          <li>Affiliate tracking: de webshops kunnen een verwijzingsparameter registreren als je via onze link doorklikt.</li>
        </ul>
        <h2>Cookies en toestemming</h2>
        <p>
          We plaatsen uitsluitend noodzakelijke cookies standaard. Analytische of marketing cookies worden alleen geplaatst na jouw toestemming.
        </p>
        <h2>Derden</h2>
        <p>
          Bij het bezoeken van een webshop via een affiliatelink geldt het privacybeleid van die webshop. Raadpleeg hun beleid voor details over cookies en gegevensverwerking.
        </p>
        <h2>Contact en inzage</h2>
        <p>
          Voor inzage, correctie of verwijdering van je gegevens kun je contact opnemen via onze contactpagina.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
