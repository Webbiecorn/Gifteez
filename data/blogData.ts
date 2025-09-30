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
    // Custom cover image generated (AI & Smart Home hero)
    imageUrl: '/images/ai-smart-home-gadgets-2025-cover.png',
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
  ,
  {
    slug: 'top-10-gadgets-man-die-alles-al-heeft-2025',
    title: 'Top 10 Gadgets Voor de Man Die Alles Al Heeft (2025)',
    excerpt: 'Originele high-impact gadget ideeën – van flight sim hardware tot koffieluxe en creatieve tools. Perfect voor de man die “alles al heeft”.',
    imageUrl: '/images/trending-eco.png',
    category: 'Tech',
    author: { name: 'Gifteez Redactie', avatarUrl: 'https://i.pravatar.cc/150?u=top10man' },
    publishedDate: '2025-09-14',
    content: [
      { type: 'paragraph', content: 'Wat geef je een man die alles al heeft? Je kiest geen standaard gadget – je kiest iets dat <strong>upgrade, beleving of niche plezier</strong> toevoegt. In deze gids ontdek je 10 verrassende gadgets in verschillende prijsklassen. Wil je meer gepersonaliseerde ideeën? <a href="/giftfinder">Probeer de AI GiftFinder</a>.' },
      { type: 'heading', content: 'Premium Entertainment & Immersion' },
      { type: 'gift', content: {
        productName: 'Logitech Z906 5.1 Surround Set',
        description: 'THX-gecertificeerd 5.1 systeem (500W) voor films, gaming en sport – brute upgrade t.o.v. standaard TV-audio.',
        priceRange: '€300 - €350',
        retailers: [ { name: 'Coolblue', affiliateLink: 'https://www.awin1.com/pclick.php?p=38840435684&a=2566111&m=85161' } ],
        imageUrl: 'https://coolblue.bynder.com/transform/0935d025-afbd-44d2-ab68-21f558d8bc96/128602?io=transform:fit,height:800,width:800&format=png&quality=100',
        tags: ['home-cinema','immersive'],
        giftType: 'physical',
        popularity: 9
      } },
      { type: 'gift', content: {
        productName: 'Thrustmaster T-Flight Hotas X',
        description: 'Instap HOTAS joystick + throttle voor flight sims – directe immersie zonder ingewikkelde setup.',
        priceRange: '€70 - €90',
        retailers: [ { name: 'Coolblue', affiliateLink: 'https://www.awin1.com/pclick.php?p=41821229208&a=2566111&m=85161' } ],
        imageUrl: 'https://coolblue.bynder.com/transform/59962df2-91aa-4b72-a51d-441cc9951695/101584?io=transform:fit,height:800,width:800&format=png&quality=100',
        tags: ['sim','gaming'],
        giftType: 'physical',
        popularity: 8
      } },
      { type: 'heading', content: 'Creativiteit & Fotografie' },
      { type: 'gift', content: {
        productName: 'Sony E 30mm f/3.5 Macro',
        description: 'Macrolens (1:1) voor detailfotografie – ontdekt texturen, horloges, natuur & productshots.',
        priceRange: '€200 - €230',
        retailers: [ { name: 'Coolblue', affiliateLink: 'https://www.awin1.com/pclick.php?p=41527438959&a=2566111&m=85161' } ],
        imageUrl: 'https://coolblue.bynder.com/transform/4738f89c-ccc1-4d2a-9079-17f5abaa061c/138684?io=transform:fit,height:800,width:800&format=png&quality=100',
        tags: ['macro','fotografie'],
        giftType: 'physical',
        popularity: 7
      } },
      { type: 'gift', content: {
        productName: 'Epson Premium Glossy Fotopapier A4 (30)',
        description: 'Premium hoogglans papier (255g) – laat digitale foto’s fysiek “leven” aan de muur of in albums.',
        priceRange: '€25 - €30',
        retailers: [ { name: 'Coolblue', affiliateLink: 'https://www.awin1.com/pclick.php?p=38840429539&a=2566111&m=85161' } ],
        imageUrl: 'https://coolblue.bynder.com/transform/edac7fe3-8130-408a-80f1-5b247be652f7/172491?io=transform:fit,height:800,width:800&format=png&quality=100',
        tags: ['print','creatief'],
        giftType: 'physical',
        popularity: 6
      } },
      { type: 'heading', content: 'Productiviteit & Slim Werken' },
      { type: 'gift', content: {
        productName: 'Logitech Wireless Mouse M705',
        description: 'Comfortabele draadloze muis met lange accuduur en programmeerbare knoppen voor efficiënter werken.',
        priceRange: '€35 - €50',
        retailers: [ { name: 'Coolblue', affiliateLink: 'https://www.awin1.com/pclick.php?p=38840429295&a=2566111&m=85161' } ],
        imageUrl: 'https://coolblue.bynder.com/transform/f70a3fe0-85ce-4cab-ba6f-1fac2b18bdb8/171765?io=transform:fit,height:800,width:800&format=png&quality=100',
        tags: ['productiviteit','workflow'],
        giftType: 'physical',
        popularity: 7
      } },
      { type: 'gift', content: {
        productName: 'DYMO LabelManager 210D+',
        description: 'Desktop labelprinter – maakt kantoor, kabels, gereedschap & voorraad strak georganiseerd.',
        priceRange: '€55 - €70',
        retailers: [ { name: 'Coolblue', affiliateLink: 'https://www.awin1.com/pclick.php?p=41775819330&a=2566111&m=85161' } ],
        imageUrl: 'https://coolblue.bynder.com/transform/a114dc04-e17d-46dd-8019-b55fe5244efc/113732?io=transform:fit,height:800,width:800&format=png&quality=100',
        tags: ['organisatie','workspace'],
        giftType: 'physical',
        popularity: 7
      } },
      { type: 'heading', content: 'Dagelijkse Luxe & Genot' },
      { type: 'gift', content: {
        productName: 'De’Longhi Magnifica ECAM 22.110SB',
        description: 'Volautomaat koffie – dagelijkse barista upgrade met bonenvers maling en melkopschuim optie.',
        priceRange: '€300 - €350',
        retailers: [ { name: 'Coolblue', affiliateLink: 'https://www.awin1.com/pclick.php?p=38840444889&a=2566111&m=85161' } ],
        imageUrl: 'https://coolblue.bynder.com/transform/50dc6831-c738-4521-acf1-4157c45e0a83/131069?io=transform:fit,height:800,width:800&format=png&quality=100',
        tags: ['koffie','lifestyle'],
        giftType: 'physical',
        popularity: 8
      } },
      { type: 'gift', content: {
        productName: 'Fritel FR 1455 3L Friteuse',
        description: 'Compacte frituur met koude zone – vrijdag snack night wordt een traditie.',
        priceRange: '€60 - €80',
        retailers: [ { name: 'Coolblue', affiliateLink: 'https://www.awin1.com/pclick.php?p=39671771087&a=2566111&m=85161' } ],
        imageUrl: 'https://coolblue.bynder.com/transform/c51eab0c-7701-4650-a1fd-c3b82574a08d/133852?io=transform:fit,height:800,width:800&format=png&quality=100',
        tags: ['food','fun'],
        giftType: 'physical',
        popularity: 6
      } },
      { type: 'heading', content: 'Niche Upgrades & Accessoires' },
      { type: 'gift', content: {
        productName: 'Saitek Pro Flight Rudder Pedals',
        description: 'Add-on voor flight sim setup – nauwkeurige roercontrole & realistische ervaring.',
        priceRange: '€140 - €170',
        retailers: [ { name: 'Coolblue', affiliateLink: 'https://www.awin1.com/pclick.php?p=38840443467&a=2566111&m=85161' } ],
        imageUrl: 'https://coolblue.bynder.com/transform/7dba6724-beb8-460f-8bb3-b52918585800/146924?io=transform:fit,height:800,width:800&format=png&quality=100',
        tags: ['sim','upgrade'],
        giftType: 'physical',
        popularity: 7
      } },
      { type: 'gift', content: {
        productName: 'Jupio LP-E10 Camera Accu',
        description: 'Extra accu – voorkomt dat een fotosessie stilvalt. Compact maar impactvol cadeau in combinatie met lens/papier.',
        priceRange: '€25 - €35',
        retailers: [ { name: 'Coolblue', affiliateLink: 'https://www.awin1.com/pclick.php?p=38840443598&a=2566111&m=85161' } ],
        imageUrl: 'https://coolblue.bynder.com/transform/1cb78c07-1765-4217-9084-9760ef71f172/135807?io=transform:fit,height:800,width:800&format=png&quality=100',
        tags: ['accessoire','fotografie'],
        giftType: 'physical',
        popularity: 6
      } },
      { type: 'heading', content: 'Ons Eindoordeel' },
      { type: 'paragraph', content: 'Meer deals zien? Bekijk onze actuele <a href="/deals">cadeau deals & aanbiedingen</a> of lees ook: <a href="/blog/ai-smart-home-gadgets-2025">AI & Smart Home Gadgets 2025</a>.' },
      { type: 'paragraph', content: '<em>Transparantie:</em> Sommige links zijn affiliate links. Jij betaalt niets extra, maar wij kunnen een kleine commissie ontvangen – zo houden we de site gratis.' },
      { type: 'faq', items: [
        {
          question: 'Hoe kies ik het beste gadget cadeau voor iemand die alles al heeft?',
          answer: 'Kies iets dat een probleem oplost, een unieke ervaring toevoegt of bestaande hobby\'s versterkt. Focus op kwaliteit, originaliteit en praktische meerwaarde.'
        },
        {
          question: 'Zijn deze gadgets ook geschikt voor verjaardagen of Vaderdag?',
          answer: 'Ja, de meeste gadgets in deze lijst zijn tijdloze cadeaus die goed werken voor verjaardagen, Vaderdag, jubilea of gewoon als verrassingscadeau.'
        },
        {
          question: 'Gebruikten jullie affiliate links in deze lijst?',
          answer: 'Ja, enkele links zijn affiliate links via betrouwbare partners. Dit kost jou niets extra en helpt ons nieuwe gidsen te maken.'
        }
      ] },
      { type: 'verdict', title: 'Kies Beleving Boven “Nog Iets”', content: 'Voor de man die alles al heeft werken categorieën als immersie (surround, flight sim), creativiteit (macro + print), en dagelijkse luxe (koffie) het beste. Combineer een premium hoofdcadeau met een kleiner complementair accessoire voor maximale “wow + usefulness”. Meer ideeën nodig? Test de <a href="/giftfinder">AI GiftFinder</a> voor een persoonlijke lijst of pak directe aanbiedingen op de <a href="/deals">Deals pagina</a>.' }
    ]
  }
];
