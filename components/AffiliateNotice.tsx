import React from 'react';

interface Props {
  className?: string;
}

const AffiliateNotice: React.FC<Props> = ({ className }) => (
  <div className={`mt-8 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-900 p-4 text-sm ${className ?? ''}`}> 
    Let op: sommige links op deze pagina zijn affiliatelinks. Als je via zo’n link iets koopt, kunnen wij een kleine commissie ontvangen. Dit kost jou niets extra. Prijzen en beschikbaarheid kunnen wijzigen; controleer altijd de actuele productpagina.
  </div>
);

export default AffiliateNotice;
