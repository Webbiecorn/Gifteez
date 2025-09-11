import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  structuredData?: any;
}

export const useSEO = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  twitterTitle,
  twitterDescription,
  structuredData
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper function to update or create meta tags
    const updateMetaTag = (selector: string, content: string, attribute: string = 'content') => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('property=')) {
          const property = selector.match(/property="([^"]+)"/)?.[1];
          if (property) element.setAttribute('property', property);
        } else if (selector.includes('name=')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, content);
    };

    // Update meta description
    if (description) {
      updateMetaTag('meta[name="description"]', description);
    }

    // Update keywords
    if (keywords) {
      updateMetaTag('meta[name="keywords"]', keywords);
    }

    // Update canonical URL
    if (canonical) {
      let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalElement) {
        canonicalElement = document.createElement('link');
        canonicalElement.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalElement);
      }
      canonicalElement.setAttribute('href', canonical);
    }

    // Update Open Graph tags
    if (ogTitle) {
      updateMetaTag('meta[property="og:title"]', ogTitle);
    }
    if (ogDescription) {
      updateMetaTag('meta[property="og:description"]', ogDescription);
    }
    if (ogImage) {
      updateMetaTag('meta[property="og:image"]', ogImage);
    }

    // Update Twitter tags
    if (twitterTitle) {
      updateMetaTag('meta[name="twitter:title"]', twitterTitle);
    }
    if (twitterDescription) {
      updateMetaTag('meta[name="twitter:description"]', twitterDescription);
    }

    // Add structured data
    if (structuredData) {
      const scriptId = 'structured-data';
      let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.innerHTML = JSON.stringify(structuredData);
    }

  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogImage, twitterTitle, twitterDescription, structuredData]);
};

// Pre-defined SEO configurations for different pages
export const SEOConfigs = {
  home: {
    title: 'Gifteez.nl - AI Gift Finder | Vind het Perfecte Cadeau',
    description: 'Ontdek het perfecte cadeau met onze AI-gedreven gift finder. Persoonlijke aanbevelingen voor elke gelegenheid en budget. Gratis en snel!',
    keywords: 'cadeau finder, AI gift finder, cadeaus, geschenken, persoonlijke aanbevelingen, verjaardag, kerst',
    canonical: 'https://gifteez.nl/'
  },
  giftFinder: {
    title: 'AI Gift Finder - Vind het Perfecte Cadeau | Gifteez.nl',
    description: 'Gebruik onze slimme AI gift finder om in seconden het perfecte cadeau te vinden. Voer je voorkeuren in en ontvang gepersonaliseerde suggesties.',
    keywords: 'AI gift finder, cadeau zoeken, persoonlijke cadeaus, gift suggestions, cadeau aanbevelingen',
    canonical: 'https://gifteez.nl/giftfinder'
  },
  blog: {
    title: 'Cadeau Blog - Inspiratie & Gidsen | Gifteez.nl',
    description: 'Ontdek de beste cadeau-ideeën, trends en gidsen in onze blog. Van verjaardagscadeaus tot seizoensgebonden geschenken - alle inspiratie op één plek.',
    keywords: 'cadeau blog, gift guides, cadeau inspiratie, geschenk ideeën, cadeau trends',
    canonical: 'https://gifteez.nl/blog'
  },
  about: {
    title: 'Over Gifteez.nl - Ons Verhaal | AI Gift Finder',
    description: 'Leer meer over Gifteez.nl en ons team. Ontdek hoe we AI gebruiken om het perfecte cadeau voor jou te vinden en waarom we begonnen zijn.',
    keywords: 'over gifteez, ons verhaal, AI gift finder team, missie, visie',
    canonical: 'https://gifteez.nl/about'
  },
  contact: {
    title: 'Contact - Neem Contact Op | Gifteez.nl',
    description: 'Heb je vragen of feedback? Neem contact met ons op! We helpen je graag verder met al je cadeau-gerelateerde vragen.',
    keywords: 'contact, support, help, vragen, feedback, klantenservice',
    canonical: 'https://gifteez.nl/contact'
  },
  quiz: {
    title: 'Cadeau Quiz - Ontdek je Cadeau Persoonlijkheid | Gifteez.nl',
    description: 'Doe onze leuke cadeau quiz en ontdek welke cadeaus het beste bij jou passen. Krijg gepersonaliseerde aanbevelingen op basis van je voorkeuren.',
    keywords: 'cadeau quiz, persoonlijkheidstest, gift quiz, cadeau persoonlijkheid',
    canonical: 'https://gifteez.nl/quiz'
  },
  deals: {
    title: 'Beste Cadeau Deals & Aanbiedingen | Gifteez.nl',
    description: 'Ontdek de beste cadeau deals en aanbiedingen van vandaag. Bespaar geld op geweldige geschenken met onze handmatig geselecteerde kortingen.',
    keywords: 'cadeau deals, aanbiedingen, kortingen, goedkope cadeaus, gift deals',
    canonical: 'https://gifteez.nl/deals'
  }
};