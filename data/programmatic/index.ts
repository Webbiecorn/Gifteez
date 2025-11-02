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
  filters?: { maxPrice?: number; fastDelivery?: boolean; eco?: boolean; keywords?: string[] }
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
    filters: { maxPrice: 50, fastDelivery: true, keywords: ['kerst', 'heren', 'mannen'] },
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
    filters: { maxPrice: 50, fastDelivery: true, keywords: ['kerst', 'dames', 'vrouwen'] },
  },
  {
    slug: 'sinterklaas-voor-kinderen-onder-25',
    occasion: 'sinterklaas',
    recipient: 'kinderen',
    budgetMax: 25,
    title: 'Sinterklaas cadeaus voor kinderen: 25 ideeën onder €25',
    intro: 'Speels, creatief en leerzaam: pakjesavondhits zonder over het budget te gaan.',
    filters: { maxPrice: 25, keywords: ['sinterklaas', 'kinderen', 'kids'] },
  },
  {
    slug: 'gamer-cadeaus-onder-100',
    interest: 'gamer',
    budgetMax: 100,
    title: 'Beste cadeaus voor gamers — onder €100',
    intro: 'Accessoires en gear die gamers écht gebruiken (PS5/Xbox/PC).',
    filters: { maxPrice: 100, keywords: ['gaming', 'gamer', 'console', 'pc'] },
  },
  {
    slug: 'duurzamere-cadeaus-onder-50',
    interest: 'duurzaam',
    budgetMax: 50,
    title: 'Duurzame cadeaus onder €50: groen en gewild',
    intro: 'Impactvolle keuzes: vegan, eco en fair waar mogelijk.',
    filters: { maxPrice: 50, eco: true, keywords: ['duurzaam', 'eco', 'vegan'] },
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
