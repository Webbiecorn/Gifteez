import React from 'react';
import { socialLinks } from '../socialLinks';

/**
 * Organization Schema Component
 * 
 * Provides structured data for search engines about Gifteez as an organization.
 * Helps with brand recognition, social profile linking, and rich search results.
 * 
 * Place this in the Footer or App root to ensure it appears on every page.
 */
const OrganizationSchema: React.FC = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Gifteez",
    "alternateName": "Gifteez.nl",
    "url": "https://gifteez.nl",
    "logo": "https://gifteez.nl/logo.png",
    "description": "Vind binnen seconden het perfecte cadeau met AI. Gifteez helpt je met gepersonaliseerde cadeau-aanbevelingen op basis van interesses, budget en gelegenheid.",
    "foundingDate": "2024",
    "slogan": "Slimme cadeau-inspiratie voor elk moment",
    "sameAs": [
      socialLinks.instagram,
      socialLinks.pinterest
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "url": "https://gifteez.nl/contact",
      "availableLanguage": ["nl"]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
};

export default OrganizationSchema;
