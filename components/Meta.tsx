import React, { useEffect } from 'react';

interface MetaProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

// Lightweight meta tag manager without extra dependency
export const Meta: React.FC<MetaProps> = ({ title, description, canonical, ogImage }) => {
  useEffect(() => {
    document.title = title;

    const ensureTag = (selector: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = create();
        document.head.appendChild(el);
      }
      return el;
    };

    // Description
    const descTag = ensureTag('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    });
    descTag.setAttribute('content', description);

    if (canonical) {
      const linkCanonical = ensureTag('link[rel="canonical"]', () => {
        const l = document.createElement('link');
        l.setAttribute('rel', 'canonical');
        return l;
      });
      linkCanonical.setAttribute('href', canonical);
    }

    const ogPairs: Array<[string, string]> = [
      ['og:title', title],
      ['og:description', description]
    ];
    if (ogImage) ogPairs.push(['og:image', ogImage]);
    if (canonical) ogPairs.push(['og:url', canonical]);
    ogPairs.forEach(([prop, value]) => {
      const tag = ensureTag(`meta[property='${prop}']`, () => {
        const m = document.createElement('meta');
        m.setAttribute('property', prop);
        return m;
      });
      tag.setAttribute('content', value);
    });

    const twitterCard = ensureTag("meta[name='twitter:card']", () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'twitter:card');
      return m;
    });
    twitterCard.setAttribute('content', 'summary_large_image');
  }, [title, description, canonical, ogImage]);

  return null; // Head side-effects only
};

export default Meta;
