export type ProgrammaticAudience = 'men' | 'women' | 'gamers' | 'parents' | 'kids' | 'sustainable'

export type ProgrammaticConfig = {
  slug: string
  occasion?: string
  recipient?: string
  budgetMax?: number
  retailer?: string | null
  interest?: string | null
  title: string
  intro: string
  editorPicks?: { sku: string; reason?: string }[]
  highlights?: string[]
  filters?: {
    maxPrice?: number
    fastDelivery?: boolean
    eco?: boolean
    keywords?: string[]
    boostKeywords?: string[]
    excludeKeywords?: string[]
    excludeMerchants?: string[]
    preferredMerchants?: string[]
    maxResults?: number
  }
  audience?: ProgrammaticAudience[]
  faq?: { q: string; a: string }[]
  internalLinks?: { href: string; label: string }[]
}

const VARIANTS: ProgrammaticConfig[] = [
  // FASHION & LIFESTYLE PAGES (matchen met je AWIN feed)

  // Dames pages
  {
    slug: 'dames-mode-duurzaam',
    title: 'Duurzame Dames Mode Cadeaus - Eco Fashion',
    intro: 'Stijlvolle en duurzame mode cadeaus voor vrouwen. Eco-friendly merken met impact.',
    highlights: [
      'Gecertificeerde duurzame materialen',
      'Vegan & fair trade merken',
      'Unieke designer items',
    ],
    audience: ['women'],
    filters: {
      maxPrice: 300,
      maxResults: 24,
      keywords: ['dames', 'women', 'duurzaam', 'sustainable', 'eco', 'vegan'],
    },
  },
  {
    slug: 'dames-sieraden-onder-100',
    title: 'Dames Sieraden Cadeaus onder €100',
    intro: 'Prachtige sieraden voor vrouwen - kettingen, armbanden, oorbellen en ringen.',
    highlights: [
      'Unieke designer sieraden',
      'Hypoallergeen en vegan',
      'Inclusief cadeauverpakking',
    ],
    audience: ['women'],
    filters: {
      maxPrice: 100,
      maxResults: 24,
      // STRICT: Must have jewelry term in TITLE (not just description)
      // This prevents fashion items from matching
      keywords: [
        'Sieraden',
        'Jewelry',
        'Jewellery',
        'Ketting',
        'Kettinghanger',
        'Armband',
        'Polsband',
        'Ring ', // Space to avoid matching "string", "loungering", etc.
        'Ringen',
        'Oorbel',
        'Oorbellen',
        'Oorringen',
        'Creolen',
        'Bracelet',
        'Necklace',
        'Earring',
        'Earrings',
        'Pendant',
        'Charm',
      ],
      boostKeywords: [
        'sterling',
        'zilver',
        'goud',
        'silver',
        'gold',
        'diamant',
        'parel',
        '14k',
        '18k',
      ],
      // Exclude ALL fashion/clothing
      excludeKeywords: [
        'ballerina',
        'ballerinas',
        'blazer',
        'legging',
        'leggings',
        'zedkin', // LOVJOI fashion item
        'sneakers',
        'klompen',
        'klomp',
        'clog',
        'slip',
        'slips',
        'string',
        'hotpants',
        'panty',
        'badpak',
        'bikini',
        'zwembroek',
        'hoodie',
        'sweater',
        'sweatshirt',
        'shirt',
        'blouse',
        'top',
        'jurk',
        'rok',
        'broek',
        'jeans',
        'jas',
        'vest',
        'trui',
        'cardigan',
        'lingerie',
        'bra',
        'bralette',
        'beha',
        'bh',
        'ondergoed',
        'sokken',
        'schoenen',
        'laarzen',
        'slippers',
        'sandalen',
        'sneaker',
        'tas',
        'bag',
        'portemonnee',
        'riem',
        'sjaal',
        'hoed',
        'pet',
        'handschoen',
        'shorts',
        'short',
        'sportshort',
        'router', // TP-Link routers were matching
        'archer',
      ],
    },
  },
  {
    slug: 'dames-mode-onder-150',
    title: 'Dames Mode Cadeaus onder €150',
    intro: 'Fashion cadeaus voor vrouwen - kleding, accessoires en schoenen.',
    highlights: ['Trendy fashion items', 'Diverse stijlen en maten', 'Snelle levering'],
    audience: ['women'],
    filters: {
      maxPrice: 150,
      maxResults: 24,
      keywords: ['dames', 'women', 'mode', 'fashion', 'kleding', 'jas', 'schoenen'],
    },
  },

  // Heren pages
  {
    slug: 'heren-mode-accessoires',
    title: 'Heren Mode & Accessoires Cadeaus',
    intro: 'Stijlvolle cadeaus voor mannen - van riemen tot horloges.',
    highlights: ['Premium merken', 'Tijdloze designs', 'Perfecte geschenken'],
    audience: ['men'],
    filters: {
      maxPrice: 200,
      maxResults: 24,
      keywords: ['heren', 'men', 'male', 'mode', 'accessoires', 'riem', 'horloge', 'portemonnee'],
    },
  },

  // Unisex/Lifestyle pages
  {
    slug: 'duurzame-lifestyle-cadeaus',
    title: 'Duurzame Lifestyle Cadeaus - Eco & Fair Trade',
    intro: 'Bewuste cadeaus die goed zijn voor mens en planeet.',
    highlights: ['Duurzame materialen', 'Fair trade & vegan', 'Unique designer items'],
    audience: ['women', 'men', 'sustainable'],
    filters: {
      maxPrice: 250,
      maxResults: 24,
      keywords: ['duurzaam', 'sustainable', 'eco', 'vegan', 'fair trade', 'organic'],
    },
  },
  {
    slug: 'wonen-decoratie-cadeaus',
    title: 'Wonen & Decoratie Cadeaus',
    intro: 'Stijlvolle woonaccessoires en decoratie voor elk interieur.',
    highlights: ['Unique home decor', 'Handgemaakt & artisanaal', 'Direct leverbaar'],
    filters: {
      maxPrice: 200,
      maxResults: 24,
      keywords: ['wonen', 'home', 'decoratie', 'interieur', 'kussen', 'beddengoed', 'vaas'],
    },
  },

  // TEST PAGE - Fashion items from feed
  {
    slug: 'test-dames-mode',
    title: 'Test: Dames Mode Cadeaus',
    intro: 'Test pagina voor classificatie - dames fashion items uit feed.',
    highlights: ['Duurzame merken', 'Direct leverbaar', 'Eco-vriendelijke materialen'],
    audience: ['women'],
    filters: {
      maxPrice: 500,
      maxResults: 24,
      keywords: ['dames', 'women', 'female', 'fashion', 'mode'],
    },
  },
  {
    slug: 'kerst-voor-hem-onder-150',
    occasion: 'kerst',
    recipient: 'hem',
    budgetMax: 150,
    title: 'Beste kerstcadeaus voor hem onder €150 (2025)',
    intro: 'Van slimme gadgets tot betaalbare tech: cadeaus die hij écht gebruikt.',
    highlights: [
      'Tech en gadgets waar hij blij van wordt',
      'Snel geleverd via Coolblue',
      'Budget-vriendelijke cadeaus die scoren',
    ],
    audience: [], // Geen audience filter - laat unisex producten door
    filters: {
      maxPrice: 150, // Verhoogd naar €150 voor échte tech producten
      fastDelivery: true,
      maxResults: 24,
      // Geen keywords - accepteer alle producten behalve excludes
      keywords: [],
      boostKeywords: [],
      // Alleen vrouwenproducten uitsluiten + fashion items
      excludeKeywords: [
        'vrouw',
        'vrouwen',
        'dames',
        'lady',
        'ladies',
        'jurk',
        'rok',
        'blouse',
        'top',
        'oorbel',
        'ketting',
        'armband',
        'sieraad',
        'make-up',
        'mascara',
        'lipstick',
        'nagellak',
        'foundation',
        // Fashion voor mannen ook uitsluiten
        'overhemd',
        'shirt',
        'shorts',
        'broek',
        'jas',
        'vest',
        'trui',
        'schoenen',
      ],
      preferredMerchants: ['coolblue', 'bol', 'bol.com', 'amazon'],
    },
    faq: [
      { q: 'Wordt dit nog vóór kerst geleverd?', a: 'Kies snelle levering bij onze partners.' },
      { q: 'Mag ik ruilen of retourneren?', a: 'Ja, volg de richtlijnen van de retailer.' },
    ],
    internalLinks: [
      { href: '/cadeaus/kerst/voor-haar/onder-50', label: 'Kerstcadeaus voor haar onder €50' },
      { href: '/cadeaus/kerst/onder-25', label: 'Kerst onder €25' },
    ],
  },
  {
    slug: 'kerst-voor-haar-onder-50',
    occasion: 'kerst',
    recipient: 'haar',
    budgetMax: 50,
    title: 'Beste kerstcadeaus voor haar onder €50 (2025)',
    intro: 'Verwen haar met cadeaus die scoren: beauty, wellness, cosy & slimme gadgets.',
    highlights: [
      'Beauty & wellness gecombineerd met cosy home gifts',
      'Altijd onder €50 en snel online te bestellen',
      'Focus op partners met hoge review scores',
    ],
    audience: ['women'],
    filters: {
      maxPrice: 50,
      fastDelivery: true,
      maxResults: 24,
      // Inclusieve trefwoorden voor vrouwendoelgroep + zinsdelen
      keywords: ['kerst', 'voor haar', 'haar', 'vrouw', 'vrouwen', 'dames', 'zij'],
      boostKeywords: [
        'beauty',
        'wellness',
        'gift set',
        'giftset',
        'cadeauset',
        'cadeau set',
        'cadeaubox',
        'geschenkset',
        'verwenpakket',
        'beauty box',
        'verzorgingsset',
        'rituals set',
        'rituals',
        'sieraad',
        'sieraden',
        'cosy',
        'selfcare',
        'spa',
      ],
      // Sluit man-gerichte items uit en enkele typische man-sleutelwoorden
      excludeKeywords: [
        'mannen',
        'heren',
        'voor hem',
        'men ',
        'riem',
        'belt',
        'man ',
        // Te “huis & tuin” voor deze gids
        'lamp',
        'lampen',
        'tafellamp',
        'vloerlamp',
        'wandlamp',
        'zaklamp',
      ],
      excludeMerchants: ['shop like you give a damn - nl & be', "will's vegan store"],
      preferredMerchants: ['rituals', 'coolblue', 'bol', 'bol.com', 'amazon'],
    },
    internalLinks: [
      { href: '/cadeaus/kerst/voor-hem/onder-50', label: 'Kerstcadeaus voor hem onder €50' },
      { href: '/cadeaus/kerst/onder-25', label: 'Kerst onder €25' },
    ],
  },
  {
    slug: 'sinterklaas-voor-kinderen-onder-25',
    occasion: 'sinterklaas',
    recipient: 'kinderen',
    budgetMax: 25,
    title: 'Sinterklaas cadeaus voor kinderen: 25 ideeën onder €25',
    intro: 'Speels, creatief en leerzaam: pakjesavondhits zonder over het budget te gaan.',
    highlights: [
      'Speelgoed en spelletjes die direct gebruikt worden',
      'Budgetproof: alles onder €25',
      'Mix van educatief, creatief en fun',
    ],
    audience: ['kids'],
    filters: {
      maxPrice: 25,
      maxResults: 24,
      keywords: ['sinterklaas', 'kinderen', 'kids', 'pakjesavond'],
      boostKeywords: ['lego', 'playmobil', 'spel', 'speelgoed', 'knutsel', 'puzzel', 'boek'],
      excludeKeywords: [
        // Vermijd 18+ of niet-kindgericht
        'whisky',
        'bier',
        'wijn',
        'barbecue',
        'sieraad',
        'ketting',
        'oorbel',
        'lipstick',
      ],
      preferredMerchants: ['bol', 'bol.com', 'amazon', 'intertoys'],
    },
    internalLinks: [
      { href: '/cadeaus/kerst/voor-kinderen', label: 'Kerstcadeaus voor kinderen' },
      { href: '/cadeaus/gamer/onder-100', label: 'Gamer cadeaus onder €100' },
    ],
  },
  {
    slug: 'gamer-cadeaus-onder-100',
    interest: 'gamer',
    budgetMax: 100,
    title: 'Beste cadeaus voor gamers — onder €100',
    intro: 'Accessoires en gear die gamers écht gebruiken (PS5/Xbox/PC).',
    highlights: [
      'Console & PC accessoires die goed scoren',
      'Budget onder €100, toch premium gear',
      'Met reviews vanuit de community',
    ],
    audience: ['men', 'women'],
    filters: {
      maxPrice: 100,
      maxResults: 24,
      // Bredere gaming keywords - moet in title/description voorkomen
      keywords: [
        'gaming',
        'gamer',
        'game',
        'playstation',
        'ps5',
        'ps4',
        'ps3',
        'xbox',
        'nintendo',
        'switch',
        'controller',
        'joystick',
        'headset',
        'gaming headset',
        'gaming muis',
        'gaming toetsenbord',
        'gaming monitor',
        'gaming stoel',
        'gaming bureau',
        'rgb',
        'streaming',
        'webcam gaming',
        'microfoon gaming',
      ],
      boostKeywords: [],
      excludeKeywords: [
        // Fashion items
        'jas',
        'shirt',
        'sokken',
        'broek',
        'jeans',
        'trui',
        'vest',
        'jurk',
        'rok',
        'bikini',
        'beha',
        'bh',
        'voedingsbeha',
        'lingerie',
        'ondergoed',
        'klompen',
        'schoenen',
        'laarzen',
        'dames',
        'heren',
        // Non-gaming items
        'koksmes',
        'mes',
        'pizzasteen',
        'koekenpan',
        'mug',
        'poster',
        'sleutelhanger',
        'knuffel',
        'speelgoed',
      ],
      preferredMerchants: ['coolblue', 'bol', 'bol.com', 'amazon'],
    },
    internalLinks: [
      { href: '/cadeaus/duurzamere/onder-50', label: 'Duurzame cadeaus onder €50' },
      { href: '/cadeaus/kerst/voor-hem/onder-50', label: 'Kerstcadeaus voor hem' },
    ],
  },
  {
    slug: 'duurzamere-cadeaus-onder-50',
    interest: 'duurzaam',
    budgetMax: 50,
    title: 'Duurzame cadeaus onder €50: groen en gewild',
    intro: 'Impactvolle keuzes: vegan, eco en fair waar mogelijk.',
    highlights: [
      'Vegan & eco keuzes met impact',
      'Kleinschalige merken via AWIN & SLYGAD',
      'Onder €50 en vaak klimaatneutraal verzonden',
    ],
    audience: ['sustainable'],
    filters: {
      maxPrice: 50,
      eco: true,
      maxResults: 24,
      keywords: ['duurzaam', 'eco', 'vegan'],
      boostKeywords: [
        'recycled',
        'organic',
        'fair',
        'plasticvrij',
        'bamboe',
        'herbruikbaar',
        'refill',
      ],
      excludeKeywords: ['leder', 'leer', 'leather'],
      preferredMerchants: ['shop like you give a damn', 'greenjump', 'seepje', 'dille & kamille'],
    },
    internalLinks: [
      { href: '/cadeaus/kerst/voor-haar/onder-50', label: 'Cadeaus voor haar onder €50' },
      { href: '/cadeaus/kerst/voor-hem/onder-50', label: 'Cadeaus voor hem onder €50' },
    ],
  },
]

export const PROGRAMMATIC_INDEX: Record<string, ProgrammaticConfig> = VARIANTS.reduce(
  (acc, v) => {
    acc[v.slug] = v
    return acc
  },
  {} as Record<string, ProgrammaticConfig>
)

export default PROGRAMMATIC_INDEX
