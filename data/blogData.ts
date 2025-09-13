import { BlogPost, Gift } from '../types';

// Minimal gift data retained (only those still referenced in active posts)
const gift_ai_voice: Gift = {
  productName: 'Google Nest Mini (2nd Gen)',
  description: 'Compacte smart speaker met Google Assistant. Uitstekende audio, smart home integratie en voice control.',
  priceRange: '€29 - €49',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/Google-generatie-draadloze-Bluetooth-luidspreker-antraciet/dp/B0CGYFYY34?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/71mQEBoemPL._AC_SL1500_.jpg'
};

const gift_ai_smartplug: Gift = {
  productName: 'TP-Link Tapo Smart Plug',
  description: 'Slimme stekker voor afstandsbediening via app. Energie monitoring, timers en voice control ondersteuning.',
  priceRange: '€12 - €25',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/Tapo-P115-energiebewaking-stopcontact-spraakbediening/dp/B09ZBGWYH9?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/71aNn34-N4L._AC_SL1500_.jpg'
};

const gift_ai_doorbell: Gift = {
  productName: 'eufy Smart Doorbell Video',
  description: 'Video deurbel met 2K camera, nachtzicht, bewegingsdetectie en lokale opslag. Geen maandelijkse kosten.',
  priceRange: '€99 - €149',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/eufy-Security-ge%C3%AFntegreerde-tweerichtingsaudio-zelfinstallatie/dp/B09377VH3T?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/61M6mX+pipL._AC_SL1500_.jpg'
};

const gift_ai_webcam: Gift = {
  productName: 'Logitech Circle View Webcam',
  description: 'Slimme webcam met 360° zicht, bewegingsdetectie en smart home integratie.',
  priceRange: '€79 - €119',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/Logitech-View-beveiligingscamera-groothoeklens-nachtzicht-versleuteld/dp/B07W6FQ65D?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/51mU6elBigL._AC_SL1000_.jpg'
};

const gift_ai_hub: Gift = {
  productName: 'Samsung SmartThings Station',
  description: 'Universele smart home hub voor Matter apparaten. Centraliseert controle.',
  priceRange: '€59 - €89',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/Aeotec-Smart-Home-Hub-SmartThings/dp/B08NDH9NXN?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/61guzpgr5ZL._AC_SL1500_.jpg'
};

const gift_duurzaam_beker: Gift = {
  productName: 'Herbruikbare Koffiebeker (HuskeeCup)',
  description: 'Stijlvolle, duurzame beker gemaakt van koffieschillen. Perfect voor onderweg en helpt afval verminderen.',
  priceRange: '€15 - €25',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/HuskeeCup-herbruikbare-koffiebeker-zwart-355ml/dp/B09H5V7YQZ?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/519Yfe+zKnL._AC_SL1000_.jpg'
};

const gift_duurzaam_smartplug: Gift = gift_ai_smartplug; // reuse

export const blogPosts: BlogPost[] = [
  {
    slug: 'ai-smart-home-gadgets-2025',
    title: 'AI & Smart Home Gadgets (2025): Innovatieve Apparaten voor een Slimmere Woning',
    excerpt: 'Ontdek de nieuwste AI-gadgets en smart home apparaten die je leven makkelijker maken.',
  // Switched from deprecated /images/trending-tech.png (removed) to reuse eco placeholder
  imageUrl: '/images/trending-eco.png',
    category: 'Tech',
    author: { name: 'Tech Expert', avatarUrl: 'https://i.pravatar.cc/150?u=tech' },
    publishedDate: '2025-09-08',
    content: [
      { type: 'paragraph', content: 'In 2025 is je huis niet langer dom – het is intelligent, adaptief en helpt je dagelijks.' },
      { type: 'heading', content: 'Voice Assistants & AI Speakers' },
      { type: 'gift', content: gift_ai_voice },
      { type: 'heading', content: 'Slimme Beveiliging' },
      { type: 'gift', content: gift_ai_doorbell },
      { type: 'gift', content: gift_ai_webcam },
      { type: 'heading', content: 'Smart Plugs & Energie' },
      { type: 'gift', content: gift_ai_smartplug },
      { type: 'heading', content: 'Smart Home Hubs' },
      { type: 'gift', content: gift_ai_hub },
      { type: 'heading', content: 'Ons Eindoordeel' },
      { type: 'verdict', title: 'Slim Beginnen', content: 'Start klein met een voice assistant en breid uit voor maximale waarde.' }
    ]
  },
  {
    slug: 'duurzame-eco-vriendelijke-cadeaus',
    title: 'Duurzame & Eco‑vriendelijke Cadeaus: Ideeën die Echt Verschil Maken (2025)',
    excerpt: 'Bewust geven? Deze compacte gids helpt je een duurzaam cadeau te kiezen dat écht gebruikt wordt.',
    imageUrl: '/images/trending-eco.png',
    category: 'Duurzaam',
    author: { name: 'Linda Groen', avatarUrl: 'https://i.pravatar.cc/150?u=lindagroen' },
    publishedDate: '2025-09-07',
    content: [
      { type: 'paragraph', content: 'Duurzaam geven draait om lange levensduur en minder verspilling.' },
      { type: 'heading', content: 'Dagelijkse Gewoonten' },
      { type: 'gift', content: gift_duurzaam_beker },
      { type: 'heading', content: 'Slim Energiegebruik' },
      { type: 'gift', content: gift_duurzaam_smartplug },
      { type: 'heading', content: 'Ons Eindoordeel' },
      { type: 'verdict', title: 'Functioneel & Bewust', content: 'Combineer een herbruikbaar item met een slimme tool voor direct effect.' }
    ]
  }
];
