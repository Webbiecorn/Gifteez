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
  }
  faq?: { q: string; a: string }[]
  internalLinks?: { href: string; label: string }[]
}

const VARIANTS: ProgrammaticConfig[] = [
  {
    slug: 'kerst-voor-hem-onder-50',
    occasion: 'kerst',
    recipient: 'hem',
    budgetMax: 50,
    title: 'Beste kerstcadeaus voor hem onder €50 (2025)',
    intro: 'Slimme, leuke en nuttige cadeaus voor hem, binnen budget en snel te bestellen.',
    highlights: [
      'Vandaag besteld, vaak morgen al in huis',
      'Mix van tech, games en gadgets',
      'Partners: Coolblue, Amazon & Bol via AWIN',
    ],
    filters: {
      maxPrice: 50,
      fastDelivery: true,
      // Inclusieve trefwoorden voor mannendoelgroep + zinsdelen
      keywords: ['kerst', 'voor hem', 'mannen', 'heren', 'man', 'hij'],
      // Extra boosts voor typische mannencadeaus
      boostKeywords: ['gadget', 'smart', 'bier', 'whisky', 'gaming', 'barbecue', 'tools'],
      // Sluit expliciet vrouwen/zachte hints uit wanneer duidelijk
      excludeKeywords: [
        'voor haar',
        'vrouw',
        'vrouwen',
        'dames',
        'lady',
        'ladies',
        'jurk',
        'oorbel',
        'ketting ',
        'sieraad',
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
    filters: {
      maxPrice: 50,
      fastDelivery: true,
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
    filters: {
      maxPrice: 25,
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
    filters: {
      maxPrice: 100,
      keywords: ['gaming', 'gamer', 'console', 'pc'],
      boostKeywords: ['rgb', 'headset', 'controller', 'pc gaming'],
      excludeKeywords: ['shirt', 'sokken', 'mug'],
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
    filters: {
      maxPrice: 50,
      eco: true,
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
