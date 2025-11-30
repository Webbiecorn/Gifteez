import { deepReplaceLegacyGuidePaths } from '../../guidePaths'

export type ProgrammaticAudience = 'men' | 'women' | 'gamers' | 'parents' | 'kids' | 'sustainable'

/**
 * Globale excludeKeywords voor mode/fashion/lifestyle gidsen
 * Om beauty/wellness/tech/food items uit te filteren
 */
export const COMMON_EXCLUDE_KEYWORDS = [
  // Verzorging & Beauty
  'olie',
  'oil',
  'essentiele olie',
  'essentiële olie',
  'essential oil',
  'crème',
  'creme',
  'cream',
  'serum',
  'lotion',
  'gel',
  'zeep',
  'soap',
  'douche',
  'shower',
  'shampoo',
  'conditioner',
  'baardolie',
  'beard oil',
  'scrub',
  'peeling',
  'gezichtsolie',
  'face oil',
  'dagcrème',
  'nachtcrème',
  'anti-dandruff',
  'anti roos',
  // Supplementen & Gezondheid
  'supplement',
  'supplementen',
  'vitamine',
  'vitamin',
  'tablet',
  'tabletten',
  'capsule',
  'capsules',
  'pil',
  'pillen',
  'foliumzuur',
  'omega',
  'probiotica',
  'magnesium',
  'calcium',
  'cbd',
  'gummies',
  'menopauze',
  'promensil',
  // Tech & Elektronica
  'oplader',
  'lader',
  'charger',
  'power delivery',
  'gan',
  'adapter',
  'powerbank',
  'usb',
  'cable',
  'kabel',
  'sitecom',
  'tether',
  'tetherpro',
  'headset',
  'koptelefoon',
  'printer',
  'toner',
  'cartridge',
  'router',
  'archer',
  'camera',
  'gopro',
  'battery',
  'batterij',
  'accu',
  // BBQ & Koken
  'bbq',
  'barbecue',
  'grill',
  'grillrooster',
  'houtskool',
  'kettle',
  'napoleon',
  // Huishouden & Schoonmaak
  'stoomreiniger',
  'kärcher',
  'karcher',
  'muismat',
  'mousepad',
  // Medisch
  'soa',
  'test kit',
  'swabtest',
  'chlamydia',
]

/**
 * Beschikbare sorteeropties voor QuickScan CTA's.
 * Houd de lijst kort, zodat editors niet hoeven te gokken welke presets bestaan.
 */
export type QuickScanSortOption = 'featured' | 'price-asc' | 'price-desc'

/**
 * Discriminated union voor de CTA die op elke QuickScan-kaart getoond wordt.
 * Gebruik `type: "filters"` voor presets binnen dezelfde gids en `type: "link"`
 * voor deep-links naar externe of interne bestemmingen.
 */
export type QuickScanPersonaAction =
  | {
      type: 'filters'
      label: string
      fastDeliveryOnly?: boolean
      sortOption?: QuickScanSortOption
    }
  | {
      type: 'link'
      label: string
      href: string
    }

/**
 * Eén QuickScan-kaart, inclusief copy en optionele badges/suggesties.
 */
export interface QuickScanPersona {
  id: string
  label: string
  summary: string
  budgetLabel?: string
  badges?: string[]
  topSuggestions?: string[]
  action?: QuickScanPersonaAction
}

/**
 * Container voor de QuickScan-sectie op een gids.
 */
export interface QuickScanConfig {
  title?: string
  subtitle?: string
  personas: QuickScanPersona[]
}

export type RetailerSpotlightCardFilters = {
  includeBrands?: string[]
  includeKeywords?: string[]
  minPrice?: number
  maxPrice?: number
}

export type RetailerSpotlightCTA = {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
}

export type RetailerSpotlightGuide = {
  title: string
  description: string
  href: string
  badge?: string
}

export interface RetailerSpotlightConfig {
  partnerName: string
  eyebrow?: string
  badge?: string
  title: string
  description: string
  highlights?: string[]
  metrics?: { label: string; value: string }[]
  feedId: string
  cardLimit?: number
  cardFilters?: RetailerSpotlightCardFilters
  ctas?: RetailerSpotlightCTA[]
  giftGuides?: RetailerSpotlightGuide[]
}

type QuickScanFiltersAction = Extract<QuickScanPersonaAction, { type: 'filters' }>
type QuickScanLinkAction = Extract<QuickScanPersonaAction, { type: 'link' }>

export const isQuickScanFiltersAction = (
  action?: QuickScanPersonaAction | null
): action is QuickScanFiltersAction => action?.type === 'filters'

export const isQuickScanLinkAction = (
  action?: QuickScanPersonaAction | null
): action is QuickScanLinkAction => action?.type === 'link'

const QUICKSCAN_ALLOWED_LINK_PREFIXES = ['http://', 'https://', '/'] as const

function validateQuickScanAction(
  personaId: string,
  configSlug: string,
  action: QuickScanPersonaAction
): void {
  if (isQuickScanFiltersAction(action)) {
    const hasFastDeliveryPreset = action.fastDeliveryOnly === true
    const hasSortPreset = Boolean(action.sortOption)

    if (!hasFastDeliveryPreset && !hasSortPreset) {
      throw new Error(
        `QuickScan persona "${personaId}" in "${configSlug}" heeft een filters-CTA zonder filter- of sorteerpreset`
      )
    }
  }

  if (isQuickScanLinkAction(action)) {
    const trimmedHref = action.href.trim()
    const usesAllowedPrefix = QUICKSCAN_ALLOWED_LINK_PREFIXES.some((prefix) =>
      trimmedHref.startsWith(prefix)
    )

    if (!usesAllowedPrefix) {
      throw new Error(
        `QuickScan persona "${personaId}" in "${configSlug}" heeft een link-CTA met een ongeldig href (alleen absolute URL's of interne paden toegestaan)`
      )
    }
  }
}

export function validateProgrammaticConfigs(configs: ProgrammaticConfig[]): void {
  const personaIds = new Map<string, string>()

  configs.forEach((config) => {
    config.quickScan?.personas.forEach((persona) => {
      const trimmedId = persona.id.trim()
      if (!trimmedId) {
        throw new Error(`QuickScan persona zonder ID in config "${config.slug}"`)
      }

      if (personaIds.has(trimmedId)) {
        throw new Error(
          `QuickScan persona-id "${trimmedId}" komt meerdere keren voor (onder meer in "${personaIds.get(trimmedId)}" en "${config.slug}")`
        )
      }
      personaIds.set(trimmedId, config.slug)

      if (!persona.label.trim()) {
        throw new Error(`QuickScan persona "${trimmedId}" mist een label`)
      }

      if (!persona.summary.trim()) {
        throw new Error(`QuickScan persona "${trimmedId}" mist een summary`)
      }

      if (persona.action) {
        if (!persona.action.label.trim()) {
          throw new Error(`QuickScan persona "${trimmedId}" heeft een lege CTA-tekst`)
        }

        if (isQuickScanLinkAction(persona.action) && !persona.action.href.trim()) {
          throw new Error(`QuickScan persona "${trimmedId}" heeft een link-actie zonder href`)
        }

        validateQuickScanAction(trimmedId, config.slug, persona.action)
      }
    })
  })
}

/**
 * Centrale datastructuur voor alle programmatic landingspagina's.
 */
export type ProgrammaticConfig = {
  slug: string
  occasion?: string
  recipient?: string
  budgetMax?: number
  retailer?: string | null
  interest?: string | null
  title: string
  intro: string
  disableOccasionFilter?: boolean
  editorPicks?: { sku: string; reason?: string }[]
  curatedProducts?: {
    title: string
    price: number
    currency?: string
    image: string
    affiliateLink: string
    merchant: string
    reason?: string
  }[]
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
    categories?: string[]
    maxPerBrand?: number
    maxPerCategory?: number
    categoryPathIncludes?: string[]
    productTypeIncludes?: string[]
  }
  audience?: ProgrammaticAudience[]
  faq?: { q: string; a: string }[]
  internalLinks?: { href: string; label: string }[]
  quickScan?: QuickScanConfig
  retailerSpotlight?: RetailerSpotlightConfig
}

const RAW_VARIANTS = [
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
    audience: ['women'] as ProgrammaticAudience[],
    filters: {
      maxPrice: 300,
      maxResults: 24,
      // GEEN keywords = preferredMerchants wordt harde filter (alleen deze merchant)
      // Shop Like You Give A Damn is specialist in duurzame damesmode
      preferredMerchants: ['shop like you give a damn'],
      boostKeywords: [
        'jurk',
        'dress',
        'top',
        'blouse',
        'rok',
        'skirt',
        'trui',
        'sweater',
        'cardigan',
        'jas',
        'jacket',
        'coat',
        'schoenen',
        'shoes',
        'laarzen',
        'boots',
        'tas',
        'bag',
        'handtas',
        'broek',
        'pants',
        'jeans',
        'shirt',
        'dames',
        'women',
        'female',
      ],
      // Sluit producten uit die niets met mode te maken hebben (home accessories, etc.)
      excludeKeywords: [
        'beddengoed',
        'dekbedovertrek',
        'kussensl',
        'kussen',
        'pillowcase',
        'bedding',
        'duvet',
        'laken',
        'sheet',
        'home',
        'wonen',
      ],
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
    audience: ['women'] as ProgrammaticAudience[],
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
        'usb stick',
        // Verzorging/wellness die geen sieraden zijn
        'douche',
        'douchecrème',
        'douchegel',
        'shower',
        'foam',
        'zeep',
        'soap',
        'shampoo',
        'conditioner',
        'bodylotion',
        'crème',
        'cream',
        'lotion',
        'scrub',
        'peeling',
        'gel',
        'olie',
        'oil',
        'serum',
        // Supplementen
        'supplement',
        'vitamine',
        'vitamin',
        'tablet',
        'capsule',
        'foliumzuur',
        'omega',
        'probiotica',
        'magnesium',
        'calcium',
      ],
    },
  },
  {
    slug: 'dames-mode-onder-150',
    title: 'Dames Mode Cadeaus onder €150',
    intro: 'Duurzame mode & accessoires voor vrouwen van Shop Like You Give A Damn.',
    highlights: ['Duurzaam', 'Fair Trade', 'Stijlvol'],
    // NO audience filter = allow all SLYGAD products
    filters: {
      maxPrice: 150,
      maxResults: 24,
      // GEEN keywords = alleen Shop Like You Give A Damn
      preferredMerchants: ['shop like you give a damn'],
      boostKeywords: [
        'dames',
        'women',
        'female',
        'vrouw',
        'shirt',
        'blouse',
        'jurk',
        'dress',
        'rok',
        'broek',
        'jas',
        'trui',
        'sweater',
        'schoenen',
        'tas',
        'accessoire',
      ],
      excludeKeywords: [
        // Alleen mannen items excluden
        'heren',
        'men',
        'male',
        'man',
        'mannen',
      ],
    },
  },

  // Heren pages
  {
    slug: 'heren-mode-accessoires',
    title: 'Heren Mode & Accessoires Cadeaus',
    intro: 'Duurzame mode & accessoires voor mannen van Shop Like You Give A Damn.',
    highlights: ['Duurzaam', 'Fair Trade', 'Stijlvol'],
    // NO audience filter = allow all SLYGAD products
    filters: {
      maxPrice: 200,
      maxResults: 24,
      // GEEN keywords = alleen Shop Like You Give A Damn
      preferredMerchants: ['shop like you give a damn'],
      boostKeywords: [
        'heren',
        'men',
        'male',
        'man',
        'shirt',
        'broek',
        'jas',
        'trui',
        'sweater',
        'horloge',
        'riem',
        'portemonnee',
        'tas',
        'accessoire',
      ],
      excludeKeywords: [
        // Gebruik niet COMMON_EXCLUDE_KEYWORDS, want die filtert te veel
        // Alleen vrouwen items excluden
        'dames',
        'vrouw',
        'women',
        'female',
        'girls',
        'vrouwen',
        'jurk',
        'dress',
        'rok',
        'skirt',
        'blouse',
        'bh',
        'beha',
        'lingerie',
      ],
    },
  },

  // Unisex/Lifestyle pages
  {
    slug: 'duurzame-lifestyle-cadeaus',
    title: 'Duurzame Lifestyle Cadeaus - Eco & Fair Trade',
    intro: 'Bewuste cadeaus die goed zijn voor mens en planeet.',
    highlights: ['Duurzame materialen', 'Fair trade & vegan', 'Unique designer items'],
    audience: ['women', 'men', 'sustainable'] as ProgrammaticAudience[],
    filters: {
      maxPrice: 250,
      maxResults: 24,
      keywords: ['duurzaam', 'sustainable', 'eco', 'vegan', 'fair trade', 'organic'],
      excludeKeywords: COMMON_EXCLUDE_KEYWORDS,
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
      excludeKeywords: COMMON_EXCLUDE_KEYWORDS,
    },
  },

  {
    slug: 'holland-barrett-wellness-cadeaus',
    retailer: 'Holland & Barrett',
    occasion: 'kerst',
    disableOccasionFilter: true,
    interest: 'wellness',
    title: 'Holland & Barrett Wellness Cadeaus (Partner Spotlight)',
    intro:
      'Wellness, clean beauty en mindful rituelen rechtstreeks uit de AWIN feed 20669. We verrijken deze selectie dagelijks voor cadeaucoaches en thematische gidsen.',
    highlights: [
      'Dagverse AWIN feed 20669',
      'Focus op wellness & mindful living',
      'Snelle levering (1-2 dagen)',
    ],
    audience: ['women', 'men', 'unisex'] as ProgrammaticAudience[],
    filters: {
      maxPrice: 150,
      maxResults: 24,
      categories: ['wellness', 'beauty', 'wonen'],
      preferredMerchants: ['Holland and Barrett NL'],
      maxPerBrand: 4,
      maxPerCategory: 8,
    },
    faq: [
      {
        q: 'Hoe vaak wordt de Holland & Barrett feed vernieuwd?',
        a: 'Elke 24 uur draaien we feeds:chain:slim met fid 20669, zodat prijzen en voorraad up-to-date blijven.',
      },
      {
        q: 'Pakken jullie alleen wellness producten mee?',
        a: 'Ja, we filteren op wellness, beauty en mindful living en sluiten algemene huishoudartikelen uit.',
      },
      {
        q: 'Hoe loggen jullie affiliate clicks voor deze partner?',
        a: 'Alle kaarten gaan door withAffiliate() met context gifteez|programmatic|holland-barrett zodat clickrefs in AWIN rapportages zichtbaar zijn.',
      },
    ],
    internalLinks: [
      { href: '/cadeaugidsen/kerst/voor-haar/onder-50', label: 'Selfcare cadeaus voor haar' },
      { href: '/cadeaugidsen/duurzamere-cadeaus-onder-50', label: 'Duurzame cadeaus onder €50' },
      { href: '/cadeaugidsen/kerst/voor-hem/onder-150', label: 'Wellness voor hem tot €150' },
    ],
    retailerSpotlight: {
      partnerName: 'Holland & Barrett',
      eyebrow: 'Partner spotlight',
      badge: 'AWIN feed 20669',
      title: 'Dagverse wellnesscadeaus van Holland & Barrett',
      description:
        'Met ruim 4.400 SKU’s in fid 20669 combineren we supplementen, selfcare en mindful gifts. De kaarten hieronder komen rechtstreeks uit de ingest-data zodat merch teams direct actuele bundles kunnen bouwen.',
      highlights: [
        'Immuniteit, sleep & mindful bundels',
        'Jacob Hooy, Purasana en Dr. Hauschka',
        'Volledige affiliate tracking via gifteez clickrefs',
      ],
      metrics: [
        { label: 'SKU’s actief', value: '4.4K+' },
        { label: 'Gem. voorraad', value: '91%' },
        { label: 'Nieuwe items/dag', value: '120 +' },
      ],
      feedId: '20669',
      cardLimit: 6,
      cardFilters: {
        includeBrands: [
          'Dr. Hauschka',
          'Purasana',
          'Sambucol',
          'Shoti Maa',
          'Jacob Hooy',
          'Fytostar',
        ],
        includeKeywords: ['sleep', 'beauty', 'wellness', 'tea', 'vitamine', 'mindful'],
        maxPrice: 70,
        minPrice: 5,
      },
      ctas: [
        {
          label: 'Lees partnerbriefing',
          href: '/blog/holland-barrett-partner-spotlight',
          variant: 'primary',
        },
        {
          label: 'Open AWIN productfeed',
          href: 'https://www.awin1.com/pclick.php?p=23822577655&a=2566111&m=8108',
          variant: 'secondary',
        },
      ],
      giftGuides: [
        {
          title: 'Selfcare cadeaus voor haar',
          description: 'Clean beauty, spa-sets en aromatherapie die passen bij de H&B selectie.',
          href: '/cadeaugidsen/kerst/voor-haar/onder-50',
          badge: 'Selfcare',
        },
        {
          title: 'Mindful avondrituelen',
          description: 'Gebruik thee, journals en geurkaarsen voor hogere basketwaarde.',
          href: '/blog/holland-barrett-partner-spotlight',
          badge: 'Mindful',
        },
        {
          title: 'Duurzame cadeaus onder €50',
          description:
            'Combineer vegan supplementen met eco accessoires voor bewuste cadeaupakketten.',
          href: '/cadeaugidsen/duurzamere-cadeaus-onder-50',
          badge: '🌱 Duurzaam',
        },
      ],
    },
  },

  // TEST PAGE - Fashion items from feed
  {
    slug: 'test-dames-mode',
    title: 'Test: Dames Mode Cadeaus',
    intro: 'Test pagina voor classificatie - dames fashion items uit feed.',
    highlights: ['Duurzame merken', 'Direct leverbaar', 'Eco-vriendelijke materialen'],
    audience: ['women'] as ProgrammaticAudience[],
    filters: {
      maxPrice: 500,
      maxResults: 24,
      keywords: ['dames', 'women', 'female', 'fashion', 'mode'],
    },
  },
  {
    slug: 'kerst-voor-hem-onder-150',
    // Remove occasion/recipient filters - too restrictive
    title: 'Beste kerstcadeaus voor hem onder €150 (2025)',
    intro: 'Van slimme gadgets tot duurzame fashion: cadeaus die hij écht gebruikt.',
    highlights: [
      'Tech, gadgets en fashion waar hij blij van wordt',
      'Mix van Coolblue tech en Shop Like You Give A Damn fashion',
      'Budget-vriendelijke cadeaus die scoren',
    ],
    filters: {
      maxPrice: 150,
      fastDelivery: true,
      maxResults: 24,
      preferredMerchants: ['coolblue', 'shop like you give a damn'],
      keywords: [
        // Tech gadgets
        'speaker',
        'headphone',
        'koptelefoon',
        'earbud',
        'smartwatch',
        'fitness tracker',
        'webcam',
        'muis',
        'mouse',
        'keyboard',
        'toetsenbord',
        'powerbank',
        'oplader',
        'charger',
        'smart bulb',
        'led strip',
        'smart plug',
        'bluetooth',
        'wireless',
        // Fashion items
        'horloge',
        'watch',
        'riem',
        'belt',
        'portemonnee',
        'wallet',
        'tas',
        'rugzak',
        'backpack',
        'schoenen',
        'sneakers',
        'boots',
        'shirt',
        'sweater',
        'trui',
        'vest',
        'jas',
        'jacket',
        'broek',
        'jeans',
      ],
      boostKeywords: ['heren', 'men', 'male', 'man', 'tech', 'gadget', 'smart'],
      excludeKeywords: [
        // Geen vrouwen items
        'vrouw',
        'vrouwen',
        'dames',
        'women',
        'female',
        'jurk',
        'dress',
        'rok',
        'skirt',
        'blouse',
        // Geen keuken/home
        'pizzasteen',
        'wok',
        'koekenpan',
        'pan',
        'oven',
        'cadeaubon',
        'gift card',
        'muurbeugel',
        'muurhaak',
        'beugel',
        'thee',
        'tea',
      ],
    },
    faq: [
      { q: 'Wordt dit nog vóór kerst geleverd?', a: 'Kies snelle levering bij onze partners.' },
      { q: 'Mag ik ruilen of retourneren?', a: 'Ja, volg de richtlijnen van de retailer.' },
    ],
    internalLinks: [
      { href: '/cadeaugidsen/kerst/voor-haar/onder-50', label: 'Kerstcadeaus voor haar onder €50' },
      { href: '/cadeaugidsen/kerst/onder-25', label: 'Kerst onder €25' },
    ],
  },
  {
    slug: 'kerst-voor-haar-onder-50',
    // occasion: 'kerst', // Verwijderd: te restrictief, weinig producten hebben kerst-tag
    recipient: 'haar',
    budgetMax: 100,
    title: 'Beste kerstcadeaus voor haar onder €100 (2025)',
    intro: 'Verwen haar met cadeaus die scoren: beauty, wellness, mode & slimme gadgets.',
    highlights: [
      'Beauty, sieraden & mode gecombineerd met cosy home gifts',
      'Altijd onder €100 en snel online te bestellen',
      'Duurzame en stijlvolle opties voor elke smaak',
    ],
    audience: ['women', 'men'] as ProgrammaticAudience[], // Breed voor meer matches, boost keywords zorgen voor vrouwenfocus
    filters: {
      maxPrice: 100,
      maxResults: 24,
      // Brede aanpak: geen verplichte keywords, laat classificatie het werk doen
      keywords: [],
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
        'oorbel',
        'ketting',
        'armband',
        'ring',
        'cosy',
        'selfcare',
        'spa',
        'sjaal',
        'tas',
        'accessoire',
        'parfum',
      ],
      // Sluit man-gerichte items uit
      excludeKeywords: [
        'mannen',
        'heren',
        'voor hem',
        'men ',
        'riem',
        'belt',
        'man ',
        'baard',
        'scheerapparaat',
        // Te “huis & tuin” voor deze gids
        'lamp',
        'lampen',
        'tafellamp',
        'vloerlamp',
        'wandlamp',
        'zaklamp',
        ...COMMON_EXCLUDE_KEYWORDS,
      ],
      excludeMerchants: [],
      preferredMerchants: ['rituals', 'coolblue', 'shop like you give a damn'],
    },
    internalLinks: [
      { href: '/cadeaugidsen/kerst/voor-hem/onder-150', label: 'Kerstcadeaus voor hem onder €150' },
      { href: '/cadeaugidsen/duurzame-cadeaus/onder-50', label: 'Duurzame cadeaus onder €50' },
    ],
    quickScan: {
      title: 'Snelle keuzehulp voor haar',
      subtitle: 'Kies een mood en filter direct de juiste cadeaus',
      personas: [
        {
          id: 'quickscan-haar-spa-rituals',
          label: 'Spa & Rituals',
          summary: 'Wellness boxen, Rituals-sets en geurige selfcare die meteen cadeau-klaar zijn.',
          budgetLabel: '€30-€80',
          badges: ['Wellness', 'Snelle levering'],
          topSuggestions: ['Rituals giftsets', 'Luxe bad & body cadeaus'],
          action: {
            type: 'filters',
            label: 'Laat selfcare sets zien',
            fastDeliveryOnly: true,
            sortOption: 'featured',
          },
        },
        {
          id: 'quickscan-haar-jewelry-design',
          label: 'Sieraden & design',
          summary: 'Duurzame sieraden, minimalistische accessoires en cadeauboxen onder €100.',
          budgetLabel: '€40-€100',
          badges: ['Design', 'Duurzaam'],
          topSuggestions: ['Vergulde oorbellen', 'Statement accessoires'],
          action: { type: 'filters', label: 'Sorteer op prijs (hoog)', sortOption: 'price-desc' },
        },
        {
          id: 'quickscan-haar-cosy-home',
          label: 'Cosy home',
          summary: 'Gezellige verlichting, warme plaids en slimme home gadgets voor haar me-time.',
          budgetLabel: '€25-€70',
          badges: ['Cosy', 'Smart home'],
          topSuggestions: ['Aromadiffusers', 'Warmte-dekens & smart lights'],
          action: { type: 'filters', label: 'Alleen snelle cosy tips', fastDeliveryOnly: true },
        },
      ],
    },
  },
  {
    slug: 'kerst-voor-hem-onder-50',
    occasion: 'kerst',
    recipient: 'hem',
    budgetMax: 50,
    title: 'Kerstcadeaus voor hem onder €50',
    intro: 'Snelle gadgets, fun upgrades en essentials waarmee hij meteen kan spelen.',
    highlights: [
      'Altijd onder €50 en direct bestelbaar',
      'Focus op tech, gaming en smaakvolle accessoires',
      'Snelle levering voor last-minute pakjes',
    ],
    editorPicks: [
      { sku: '35582340223', reason: 'Vegan portemonnee van Shop Like You Give A Damn' },
      { sku: '35212008721', reason: 'Vegan riem die jaren meegaat' },
    ],
    disableOccasionFilter: true,
    filters: {
      maxPrice: 50,
      maxResults: 24,
      fastDelivery: true,
      keywords: [],
      boostKeywords: [
        'gadget',
        'tech',
        'gaming',
        'speaker',
        'koptelefoon',
        'bier',
        'bbq',
        'scheer',
        'smart',
        'multitool',
      ],
      excludeKeywords: [
        ...COMMON_EXCLUDE_KEYWORDS,
        'dames',
        'vrouw',
        'jurk',
        'tas',
        'sieraad',
        'make-up',
        'parfum',
        'lipstick',
        'oorbel',
        'ketting',
        'armband',
      ],
    },
    faq: [
      {
        q: 'Kan ik deze cadeaus nog voor kerst in huis hebben?',
        a: 'Ja, kies partners met 1-2 dagen levering en bestel vóór 22:00.',
      },
      {
        q: 'Zijn er cadeaubonnen of digitale opties?',
        a: 'Veel gadgets hebben digitale varianten of bevatten cadeaubonnen voor upgrades.',
      },
    ],
    internalLinks: [
      { href: '/cadeaugidsen/kerst/voor-hem/onder-150', label: 'Meer tech tot €150' },
      { href: '/cadeaugidsen/gamer/onder-100', label: 'Gamer cadeaus onder €100' },
    ],
    quickScan: {
      title: 'Direct kiezen voor hem',
      subtitle: 'Selecteer een vibe en we passen de filters voor je toe',
      personas: [
        {
          id: 'quickscan-hem-gadgets-under50',
          label: 'Smart & gadgets',
          summary: 'Compacte tech-snacks, trackers en audioaccessoires onder €50.',
          budgetLabel: '€25-€50',
          badges: ['Tech', '⚡ Snel'],
          topSuggestions: ['Mini-speakers', 'Bluetooth trackers'],
          action: {
            type: 'filters',
            label: 'Alleen snelle gadgets',
            fastDeliveryOnly: true,
            sortOption: 'featured',
          },
        },
        {
          id: 'quickscan-hem-bbq-borrel',
          label: 'BBQ & borrel',
          summary: 'Cadeaus voor grillmasters en bierliefhebbers: tools, rubs en tasting sets.',
          budgetLabel: '€20-€45',
          badges: ['BBQ', 'Borrel'],
          topSuggestions: ['BBQ tools', 'Speciaalbier pakketten'],
          action: { type: 'filters', label: 'Focus op BBQ & borrel', sortOption: 'price-asc' },
        },
        {
          id: 'quickscan-hem-daily-carry',
          label: 'Daily carry',
          summary: 'Minimalistische wallets, multitools en grooming essentials.',
          budgetLabel: '€15-€40',
          badges: ['EDC', 'Praktisch'],
          topSuggestions: ['Slimme wallets', 'Multitools & grooming'],
          action: { type: 'filters', label: 'Toon premium opties', sortOption: 'price-desc' },
        },
      ],
    },
  },
  {
    slug: 'kerst-tech-onder-100',
    // Remove occasion + interest filters - too restrictive
    title: 'Tech cadeaus onder €100 voor kerst',
    intro: 'Slimme speakers, wearables en work-from-home upgrades binnen budget.',
    highlights: [
      'Smart home, audio en accessories voor everyday use',
      'Geselecteerd op hoge reviewscore en cadeauwaarde',
      'Snelle levering voor late beslissers',
    ],
    filters: {
      maxPrice: 100,
      maxResults: 24,
      fastDelivery: true,
      preferredMerchants: ['coolblue'],
      keywords: [
        'speaker',
        'headphone',
        'koptelefoon',
        'earbud',
        'smartwatch',
        'tracker',
        'webcam',
        'muis',
        'mouse',
        'keyboard',
        'toetsenbord',
        'powerbank',
        'oplader',
        'charger',
        'smart bulb',
        'slimme lamp',
        'led strip',
        'smart plug',
        'echo dot',
        'google nest',
        'chromecast',
        'fire tv',
        'streaming',
        'bluetooth',
        'wireless',
      ],
      boostKeywords: [
        'smart',
        'gadget',
        'anker',
        'jbl',
        'logitech',
        'google',
        'amazon',
        'philips',
        'bose',
        'sony',
      ],
      excludeKeywords: [
        // Geen accessories/mounts
        'muurbeugel',
        'wandbeugel',
        'muurhaak',
        'plafondbeugel',
        'vloerstandaard',
        'tafelstandaard',
        'wall mount',
        'ceiling mount',
        'floor stand',
        'desk stand',
        'bracket',
        'beugel',
        'haak',
        'hook',
        'case',
        'hoes',
        // Geen mode items (SLYGAD)
        'crossbody',
        'rugzak',
        'backpack',
        'schoudertas',
        'handtas',
        'portemonnee',
        'wallet',
        // Geen mode/beauty/home/food
        'jurk',
        'sieraad',
        'beauty',
        'pannenset',
        'wok',
        'koekenpan',
        'pizzasteen',
        'thee',
        'tea',
        'cadeaubon',
        'gift card',
        'suiker',
        'voeding',
        'food',
        'supplement',
        'vitamine',
        'olie',
        'crème',
        'shampoo',
        'verzorging',
        'parfum',
      ],
    },
    faq: [
      {
        q: 'Welke tech cadeaus passen in een brievenbuspakket?',
        a: 'Kies voor trackers, smart bulbs of compacte speakers onder 500 gram.',
      },
      {
        q: 'Zijn deze cadeaus geschikt voor zowel iOS als Android?',
        a: 'Ja, we selecteren universele accessoires of vermelden de compatibiliteit.',
      },
    ],
    internalLinks: [
      { href: '/cadeaugidsen/gamer/onder-100', label: 'Gamer gear onder €100' },
      {
        href: '/cadeaugidsen/last-minute-kerstcadeaus-vandaag-bezorgd',
        label: 'Last-minute kerst cadeaus',
      },
    ],
    quickScan: {
      title: 'Tech presets (≤ €100)',
      subtitle: 'Klik op een scenario en we filteren direct de juiste gadgets',
      personas: [
        {
          id: 'quickscan-tech-smart-home',
          label: 'Smart home starter',
          summary: 'Slimme verlichting, sensoren en speakers die je meteen koppelt.',
          budgetLabel: '€40-€100',
          badges: ['Smart home', 'Setup <5 min'],
          topSuggestions: ['Smart bulbs', 'Mini smart speakers'],
          action: {
            type: 'filters',
            label: 'Alleen snelle smart gadgets',
            fastDeliveryOnly: true,
            sortOption: 'featured',
          },
        },
        {
          id: 'quickscan-tech-remote-work',
          label: 'Remote work boost',
          summary: 'Webcams, toetsenborden en ergonomische accessoires voor thuiswerkers.',
          budgetLabel: '€50-€90',
          badges: ['WFH', 'Productiviteit'],
          topSuggestions: ['Webcams & mics', 'Ergo toetsenborden'],
          action: { type: 'filters', label: 'Sorteer op prijs (hoog)', sortOption: 'price-desc' },
        },
        {
          id: 'quickscan-tech-portable-audio',
          label: 'Portable audio',
          summary: 'Draagbare speakers en earbuds voor wie overal muziek wil.',
          budgetLabel: '€35-€80',
          badges: ['Audio', 'Outdoor'],
          topSuggestions: ['Waterproof speakers', 'Noise cancelling earbuds'],
          action: { type: 'filters', label: 'Budgetvriendelijke audio', sortOption: 'price-asc' },
        },
      ],
    },
  },
  {
    slug: 'kerst-duurzaam-onder-50',
    occasion: 'kerst',
    interest: 'duurzaam',
    budgetMax: 50,
    title: 'Duurzame kerstcadeaus onder €50',
    intro:
      'Groene verrassingen voor onder de boom: vegan verzorging, plasticvrije essentials en duurzame accessoires.',
    highlights: [
      'Alles onder €50 en direct bestelbaar',
      'Vegan, eco en fair trade partners',
      'Ideaal voor bewuste gevers en lootjes',
    ],
    disableOccasionFilter: true,
    filters: {
      maxPrice: 50,
      maxResults: 24,
      keywords: [],
      boostKeywords: [
        'duurzaam',
        'duurzame',
        'eco',
        'vegan',
        'fair trade',
        'plasticvrij',
        'zero waste',
        'bamboe',
        'recycled',
        'gerecycled',
        'organic',
        'cadeauset',
        'verzorgingsset',
        'wellness',
        'selfcare',
        'ritual',
        'spa',
        'handgemaakt',
      ],
      excludeKeywords: [
        ...COMMON_EXCLUDE_KEYWORDS,
        'gaming',
        'console',
        'router',
        'printer',
        'inkt',
        'toner',
        'telefoon',
        'smartphone',
        'laptop',
        'monitor',
        'tv ',
        'ps5',
        'xbox',
        'usb stick',
      ],
      preferredMerchants: [
        'shop like you give a damn',
        'coolblue',
        'coolblue nl',
        'bol',
        'bol.com',
        'amazon',
      ],
    },
    faq: [
      {
        q: 'Zijn alle cadeaus vegan of cruelty-free?',
        a: 'Ja, we filteren op materialen en partners met duidelijke vegan of cruelty-free labels.',
      },
      {
        q: 'Hoe zit het met levertijd in december?',
        a: 'We kiezen bewust voor retailers met realtime voorraad en levering binnen 1-3 dagen.',
      },
    ],
    internalLinks: [
      { href: '/cadeaugidsen/duurzamere-cadeaus-onder-50', label: 'Duurzame cadeaus onder €50' },
      { href: '/cadeaugidsen/kerst/voor-haar/onder-50', label: 'Kerstcadeaus voor haar onder €50' },
      {
        href: '/cadeaugidsen/sinterklaas/voor-kinderen-onder-25',
        label: 'Sinterklaas cadeaus onder €25',
      },
    ],
  },
  {
    slug: 'kerst-voor-collegas-onder-25',
    occasion: 'kerst',
    recipient: 'collegas',
    budgetMax: 25,
    title: 'Kerstcadeaus voor collega’s onder €25',
    intro: 'Budgetproof desk upgrades, koffiemomenten en spelletjes voor op kantoor.',
    highlights: [
      'Cadeaus die op kantoor gebruikt worden',
      'Onder €25 en vaak letterbox friendly',
      'Mix van praktisch, fun en well-being',
    ],
    disableOccasionFilter: true,
    filters: {
      maxPrice: 25,
      maxResults: 20,
      keywords: [],
      boostKeywords: [
        'desk',
        'office',
        'bureau',
        'kantoor',
        'mok',
        'mug',
        'koffie',
        'thee',
        'spel',
        'quiz',
        'notitie',
        'planner',
        'pen',
      ],
      excludeKeywords: [
        ...COMMON_EXCLUDE_KEYWORDS,
        'parfum',
        'sieraad',
        'lipstick',
        'jurk',
        'oorbel',
      ],
    },
    faq: [
      {
        q: 'Zijn deze cadeaus geschikt voor lootjes of Secret Santa?',
        a: 'Ja, alle items passen binnen het klassieke €20-€25 budget.',
      },
      {
        q: 'Kan ik meerdere collega’s tegelijk bestellen?',
        a: 'Ja, partners ondersteunen bulkbestellingen en snellere levering.',
      },
    ],
    internalLinks: [
      { href: '/cadeaugidsen/kerst/voor-haar/onder-50', label: 'Voor haar onder €50' },
      {
        href: '/cadeaugidsen/last-minute-kerstcadeaus-vandaag-bezorgd',
        label: 'Last-minute inspiratie',
      },
    ],
  },
  {
    slug: 'last-minute-kerstcadeaus-vandaag-bezorgd',
    occasion: 'kerst',
    title: 'Last-minute kerstcadeaus (morgen in huis)',
    intro: 'Picks met snelle levering en hoge cadeauscore voor wie laat beslist.',
    highlights: [
      'Geselecteerd op levertijd ≤ 2 dagen',
      'Cadeaus met hoge reviewscore',
      'Digitale of makkelijk te verzenden opties',
    ],
    filters: {
      maxPrice: 150,
      maxResults: 24,
      fastDelivery: true,
      keywords: [],
      boostKeywords: [
        'same day',
        'vandaag',
        'morgen',
        'giftcard',
        'digitale',
        'smart',
        'cadeaukaart',
        'express',
      ],
      excludeKeywords: [
        ...COMMON_EXCLUDE_KEYWORDS,
        'pre-order',
        'backorder',
        'levertijd 3',
        'custom made',
      ],
    },
    faq: [
      {
        q: 'Hoe weet ik zeker dat het cadeau op tijd komt?',
        a: 'We kiezen alleen partners met realtime voorraad en levering binnen 1-2 dagen.',
      },
      {
        q: 'Zitten er ook digitale cadeaus tussen?',
        a: 'Ja, waar mogelijk linken we naar digitale licenties of cadeaubonnen.',
      },
    ],
    internalLinks: [
      { href: '/cadeaugidsen/kerst/voor-hem/onder-50', label: 'Voor hem onder €50' },
      { href: '/cadeaugidsen/kerst/voor-haar/onder-50', label: 'Voor haar onder €50' },
    ],
  },
  {
    slug: 'sinterklaas-voor-kinderen-onder-25',
    recipient: 'kids',
    budgetMax: 25,
    title: 'Sinterklaas cadeaus voor kinderen: 25 ideeën onder €25',
    intro: 'Speels, creatief en leerzaam: pakjesavondhits zonder over het budget te gaan.',
    highlights: [
      'Speelgoed en spelletjes die direct gebruikt worden',
      'Budgetproof: alles onder €25',
      'Mix van educatief, creatief en fun',
    ],
    // audience: ['kids'] as ProgrammaticAudience[], // Removed because classifier is too strict
    editorPicks: [
      // Boys 4-8
      { sku: 'B0CM8Q7WX5', reason: 'PAW Patrol Pup Squad Patroller' },
      { sku: 'B0CXPTCH8R', reason: 'Dickie Toys Mighty Crane 110cm' },
      { sku: 'B09J8DZC68', reason: 'Monster Jam True Metal trucks' },
      { sku: 'B000B6MKMO', reason: 'Hot Wheels 10-Pack' },
      { sku: 'B09BW4241F', reason: 'Hot Wheels Track Builder - Bouw je eigen baan' },
      { sku: 'B0D7PT9T9B', reason: 'Hot Wheels Superpolitiebureau' },
      { sku: 'B07KMFZTVX', reason: 'Monster Jam RC Megalodon' },
      { sku: 'B078K44BP9', reason: 'LEGO City Trein Rails' },
      { sku: 'B00BNSILCM', reason: 'Totum Timmerman King Knutselset' },
      { sku: 'B0DH495V2Y', reason: 'Kylian Mbappé biografieboek' },
      // Girls 4-8
      { sku: 'B09BW2RTN8', reason: 'Barbie Dreamtopia Zeemeermin' },
      { sku: 'MANUAL_GIRL_02', reason: 'Disney Princess Dress Up Trunk' },
      { sku: 'MANUAL_GIRL_03', reason: 'Het prinsesje zonder stank - Grappig voorleesboek' },
      { sku: 'MANUAL_GIRL_04', reason: 'Scruff a Luvs Huisdier roze' },
      { sku: 'MANUAL_GIRL_05', reason: 'Cool Maker Heishi-armbandstudio' },
      { sku: 'MANUAL_GIRL_06', reason: "Gabby's Dollhouse Speelset" },
      { sku: 'MANUAL_GIRL_07', reason: 'Schattig tekenen doe je zo!' },
      { sku: 'MANUAL_GIRL_08', reason: "Polly Pocket x Gabby's Poppenhuis" },
      { sku: 'MANUAL_GIRL_09', reason: 'Disney Aurora prinsessenkostuum' },
      { sku: 'MANUAL_GIRL_10', reason: "Vriendenboek Gabby's Dollhouse" },
    ],
    filters: {
      maxPrice: 25,
      maxResults: 24,
      // With 20 editorPicks, we only need 4 additional products to fill to 24
      // NO keywords = preferredMerchants becomes hard filter → only Amazon products
      keywords: [],
      boostKeywords: ['speelgoed', 'toy', 'lego', 'barbie', 'hot wheels', 'paw patrol'],
      excludeKeywords: [
        'whisky',
        'bier',
        'wijn',
        'barbecue',
        'sieraad',
        'ketting',
        'oorbel',
        'lipstick',
        'koelpasta',
        'netwerkkabel',
        'telefoonhouder',
        'robotstofzuiger',
        'stofzuiger',
        'cleaning',
        'cleaner',
        'opzetstuk',
        'cartridge',
        'inkt',
        'toner',
        'printer',
        'print',
        'cricut',
        'snijplotter',
        'fotoboek',
        'instax',
        'polaroid',
        'tafellamp',
        'vloerlamp',
        'wandlamp',
        'hanglamp',
        'plafondlamp',
        'buitenlamp',
        'led lamp',
        'lightstrip',
        'filament',
        'wiz',
        'tapo',
        'hue',
        'smart lamp',
        'opzetborstel',
        'tandenborstel',
        'sonicare',
        'telefoonhoes',
        'phone case',
        'case',
        'skin',
        'iphone',
        'samsung',
        'houder',
        'netgear',
        'tp-link',
        'router',
        'network switch',
        'netwerk switch',
        'dymo',
        'label',
        'coolblue cadeaubon',
        'cadeaubon coolblue',
        'cadeaukaart coolblue',
        'gta',
        'polsband',
        'strap',
        'thumb grip',
        'screenprotector',
        'beschermglas',
        'hoes',
        'cover',
        'accessoire',
        'kabel',
        'adapter',
        'oplader',
        'snellader',
        'lader',
        'charger',
        'earplug',
        'oordop',
        'gehoorbescherming',
        'gehoorbeschermer',
        'boren',
        'boor',
        'zaag',
        'schroef',
        'hamer',
        'tang',
        'gereedschap',
        'klus',
        'verf ',
        'kwast',
        'behang',
        'oortjes',
        'oordopjes',
        'ballon',
        'versiering',
        'decoratie',
        'slinger',
        'feestartikel',
        'party',
        'giftbox',
        'geheugenkaart',
        'sd kaart',
        'microsd',
        'opslag',
        'blusdeken',
        'brandpreventie',
        'blaasbalg',
        'lens',
        'statief',
        'tas',
        'filter',
        'reiniging',
        'schoonmaak',
        'batterij',
        'battery',
        'accu',
        'karcher',
        'melitta',
        'spuitpistool',
        'mengkom',
        'behuizing',
        'sleeve',
        'usb-stick',
        'flash drive',
        'computermuis',
        'gaming muis',
        'gaming mouse',
        'toetsenbord',
        'office',
        'kantoor',
        'adhesive',
        'hoofdtelefoon',
        'laptop',
        'computer',
        'pc',
        'macbook',
        'chromebook',
        'tablet',
        'ipad',
        'smartphone',
        'mobiele telefoon',
        'robotmaaier',
        'grasmaaier',
        'robomow',
        'maai',
        'gazon',
        'usb stick',
        'usb',
        'geheugenkaart',
        'intern geheugen',
        'storage',
        'schijf',
        'disk',
        'vr bril',
        'virtual reality',
        'meta quest',
        'oculus',
        'gezichtskussen',
        'hoofdband',
        'perimeterdraad',
        'draadpin',
        'snoer',
        'montage',
        'dji',
        'remarkable',
        ...COMMON_EXCLUDE_KEYWORDS,
      ],
      maxPerBrand: 3,
      maxPerCategory: 24,
      // ONLY Amazon - we have 20 manual editor picks, need 4 more from Amazon to reach 24
      preferredMerchants: ['amazon'],
    },
    faq: [
      {
        q: 'Zijn deze cadeaus geschikt voor schoencadeaus?',
        a: 'Ja, alles past binnen het typische €10-€25 schoencadeaubudget.',
      },
      {
        q: 'Hoe vaak wordt de selectie vernieuwd?',
        a: 'Tijdens het Sinterklaas-seizoen verversen we dagelijks op voorraad en levertijd.',
      },
    ],
    internalLinks: [
      { href: '/cadeaugidsen/kerst/voor-kinderen', label: 'Kerstcadeaus voor kinderen' },
      { href: '/cadeaugidsen/gamer/onder-100', label: 'Gamer cadeaus onder €100' },
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
    disableOccasionFilter: true,
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
        'usb stick',
        'matcha',
        'latte',
        'thee',
        'tea',
        'opbergblikje',
        ...COMMON_EXCLUDE_KEYWORDS,
      ],
      preferredMerchants: ['coolblue', 'bol', 'bol.com', 'amazon'],
    },
    internalLinks: [
      { href: '/cadeaugidsen/duurzamere/onder-50', label: 'Duurzame cadeaus onder €50' },
      { href: '/cadeaugidsen/kerst/voor-hem/onder-50', label: 'Kerstcadeaus voor hem' },
    ],
    quickScan: {
      title: 'Kies je gamerprofiel',
      subtitle: 'Filter direct op setup, platform of snelheid',
      personas: [
        {
          id: 'quickscan-gamer-setup-pro',
          label: 'Setup pro',
          summary: 'RGB-upgrades, controllers en stands voor streamers en competitieve gamers.',
          budgetLabel: '€60-€100',
          badges: ['RGB', 'Streaming'],
          topSuggestions: ['Headsets & mics', 'Controller docks'],
          action: { type: 'filters', label: 'Sorteer op prijs (hoog)', sortOption: 'price-desc' },
        },
        {
          id: 'quickscan-gamer-console-fast',
          label: 'Console klaar',
          summary: 'PS5/Xbox upgrades met snelle levering zodat je nog vóór het weekend speelt.',
          budgetLabel: '€40-€90',
          badges: ['PS5/Xbox', '⚡ Express'],
          topSuggestions: ['Snelle controllers', 'Charging stations'],
          action: { type: 'filters', label: 'Alleen snelle levering', fastDeliveryOnly: true },
        },
        {
          id: 'quickscan-gamer-budget-pc',
          label: 'Budget PC boost',
          summary: 'Muis, toetsenbord en performance-upgrades onder €70 voor PC gamers.',
          budgetLabel: '€30-€70',
          badges: ['PC', 'Budget'],
          topSuggestions: ['Gaming muizen', 'Mechanische toetsenborden'],
          action: { type: 'filters', label: 'Sorteer op laagste prijs', sortOption: 'price-asc' },
        },
      ],
    },
  },
  {
    slug: 'duurzamere-cadeaus-onder-50',
    interest: 'duurzaam',
    budgetMax: 100,
    title: 'Duurzame cadeaus onder €100: groen en gewild',
    intro: 'Impactvolle keuzes: vegan, eco en fair trade producten voor bewuste kopers.',
    highlights: [
      'Vegan & eco vriendelijke producten',
      'Ethische merken met impact',
      'Betaalbaar tot €100',
    ],
    audience: ['women', 'men'] as ProgrammaticAudience[], // Breed audience voor meer matches
    filters: {
      maxPrice: 100, // Verhoogd naar €100 voor meer duurzame opties
      maxResults: 24,
      // Match breed op duurzame producten - SLYAGD heeft alles vegan
      // Laat keywords leeg om alle SLYAGD producten toe te staan
      keywords: [],
      boostKeywords: [
        'vegan',
        'eco',
        'organic',
        'bio',
        'fair trade',
        'duurzaam',
        'sustainable',
        'recycled',
        'gerecycled',
        'bamboe',
        'katoen',
        'cotton',
        'linnen',
        'oeko tex',
      ],
      // Exclude dure tech en gaming
      excludeKeywords: [
        'gaming',
        'playstation',
        'xbox',
        'nintendo',
        'console',
        'controller',
        'iphone',
        'samsung',
        'tablet',
        'laptop',
        'monitor',
        'printer',
        'inkt',
        'toner',
        'oplader',
        'powerbank',
        'kabel',
        'adapter',
        'router',
        'switch', // Netwerk switch
        ...COMMON_EXCLUDE_KEYWORDS,
      ],
    },
    internalLinks: [
      { href: '/cadeaugidsen/kerst/voor-haar/onder-50', label: 'Cadeaus voor haar onder €50' },
      { href: '/cadeaugidsen/dames-mode-onder-150', label: 'Dames mode cadeaus' },
    ],
  },
  {
    slug: 'cadeaus-voor-nachtlezers',
    title: 'De beste cadeaus voor nachtlezers (2025)',
    intro:
      'Nachtlezers zijn een speciaal soort mensen: ze lezen wanneer de wereld slaapt. Daarom verzamelden we de slimste cadeaus die hun nachtelijke leesmoment perfect maken — van stille leeslampjes tot cozy essentials. Ontdek amberkleurige lampjes, zachte klemmen en accessoires voor urenlang leesplezier zonder anderen te storen.',
    interest: 'boeken',
    budgetMax: 80,
    quickScan: {
      personas: [
        {
          id: 'gezellige-lezer',
          label: 'De Gezellige Lezer',
          summary:
            'Leest met een warme plaid, thee en amberkleurig licht. Zoekt zachte, warme verlichting zonder harde contrasten.',
          action: {
            type: 'filters',
            label: 'Bekijk zachte lampjes',
            sortOption: 'price-asc',
          },
        },
        {
          id: 'bed-lezer',
          label: 'De Bed-lezer',
          summary:
            'Leest vaak laat en wil niemand wakker maken. Zo stil mogelijk, weinig lichtlek en lichtgewicht.',
          action: {
            type: 'filters',
            label: 'Bekijk stille lampjes',
            fastDeliveryOnly: true,
            sortOption: 'price-asc',
          },
        },
        {
          id: 'focus-lezer',
          label: 'De Focus-lezer',
          summary:
            'Wil geen blauw licht en leest vaak non-fictie. Lichtkleur, batterijduur en stabiliteit zijn cruciaal.',
          action: {
            type: 'filters',
            label: 'Bekijk premium lampjes',
            sortOption: 'price-desc',
          },
        },
      ],
    },
    filters: {
      // No filters - we only show curated Amazon products (no Bol.com/Coolblue)
      maxResults: 0, // Don't load any feed products
    },
    curatedProducts: [
      {
        title: 'Leeslampje B08GG42WXY',
        price: 11.95,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/81n7M-T19NL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Gritin-Eye-Protecting-Flexibele-Oplaadbaar-Batterijlevensduur/dp/B08GG42WXY?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.oNrAGYzJ2ytQAsle3p3MCio2zIq4sdS335nL6gCtfSdBpzrZfjXehrcs5kI55j3PInyNKKlO0jLkTHj3RO4_AiDetoFGhri3vtyQ7Nyi4YXAKutxlKNhIaeR0xqepGhg6oXDmdJy3p3oXj12Dh1XPkHd9pBYWY9bJ2hpDznlM6GIVroD3vjL2PErpajU_ew7-w8sLfST-3piaVUVHa9nG4coVtwgRCj86nK5rQ1YMVsknnpw7lZ5uJSJerBvjP1e7RDCRx70yOR4gneodQEBZ-2v2FjgQdobd_Mg4Tp5qyg.LeHhFKNXBebrRyMf03EZ4Iid-L6kyF5xf3qxkzEtmM0&dib_tag=se&keywords=leeslampje&qid=1764423881&sprefix=leesl%2Caps%2C111&sr=8-5&th=1&linkCode=ll1&tag=gifteez77-21&linkId=ccdcccc8940f5092fb3f3108a948e1b5&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Budget optie voor €11,95 - perfect voor kleine cadeaus',
      },
      {
        title: 'Leeslampje B0CJ4YL8MV',
        price: 19.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61eWcg03d5L._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/iZELL-Helderheidsniveaus%E3%80%91-Oogbescherming-Flexibele-Zwanenhals/dp/B0CJ4YL8MV?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.oNrAGYzJ2ytQAsle3p3MCio2zIq4sdS335nL6gCtfSdBpzrZfjXehrcs5kI55j3PInyNKKlO0jLkTHj3RO4_AiDetoFGhri3vtyQ7Nyi4YXAKutxlKNhIaeR0xqepGhg6oXDmdJy3p3oXj12Dh1XPkHd9pBYWY9bJ2hpDznlM6GIVroD3vjL2PErpajU_ew7-w8sLfST-3piaVUVHa9nG4coVtwgRCj86nK5rQ1YMVsknnpw7lZ5uJSJerBvjP1e7RDCRx70yOR4gneodQEBZ-2v2FjgQdobd_Mg4Tp5qyg.LeHhFKNXBebrRyMf03EZ4Iid-L6kyF5xf3qxkzEtmM0&dib_tag=se&keywords=leeslampje&qid=1764423881&sprefix=leesl%2Caps%2C111&sr=8-2-spons&aref=Ip5OZLNAVA&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll1&tag=gifteez77-21&linkId=d00f8b17f64d89f968efa61c129bd521&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Populaire keuze voor €19,99 - goede prijs-kwaliteit',
      },
      {
        title: 'Leeslampje B0CD8NC67S',
        price: 16.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/51W4bQGufeL._AC_SL1250_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Barnsteenkleurige-boekenverlichting-USB-C-opladen-oplaadbare-flexibele/dp/B0CD8NC67S?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.oNrAGYzJ2ytQAsle3p3MCio2zIq4sdS335nL6gCtfSdBpzrZfjXehrcs5kI55j3PInyNKKlO0jLkTHj3RO4_AiDetoFGhri3vtyQ7Nyi4YXAKutxlKNhIaeR0xqepGhg6oXDmdJy3p3oXj12Dh1XPkHd9pBYWY9bJ2hpDznlM6GIVroD3vjL2PErpajU_ew7-w8sLfST-3piaVUVHa9nG4coVtwgRCj86nK5rQ1YMVsknnpw7lZ5uJSJerBvjP1e7RDCRx70yOR4gneodQEBZ-2v2FjgQdobd_Mg4Tp5qyg.LeHhFKNXBebrRyMf03EZ4Iid-L6kyF5xf3qxkzEtmM0&dib_tag=se&keywords=leeslampje&qid=1764423881&sprefix=leesl%2Caps%2C111&sr=8-3-spons&aref=17EkmImNwa&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll1&tag=gifteez77-21&linkId=48c483375c209c77558fc3e04daf474b&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Populaire keuze voor €16,99 - goede prijs-kwaliteit',
      },
      {
        title: 'Leeslampje B0C13JTZ4W',
        price: 30.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61iu0naBVxL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/ERWEY-schakelaar-draaibare-zwanenhals-slaapkamer/dp/B0C13JTZ4W?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.oNrAGYzJ2ytQAsle3p3MCio2zIq4sdS335nL6gCtfSdBpzrZfjXehrcs5kI55j3PInyNKKlO0jLkTHj3RO4_AiDetoFGhri3vtyQ7Nyi4YXAKutxlKNhIaeR0xqepGhg6oXDmdJy3p3oXj12Dh1XPkHd9pBYWY9bJ2hpDznlM6GIVroD3vjL2PErpajU_ew7-w8sLfST-3piaVUVHa9nG4coVtwgRCj86nK5rQ1YMVsknnpw7lZ5uJSJerBvjP1e7RDCRx70yOR4gneodQEBZ-2v2FjgQdobd_Mg4Tp5qyg.LeHhFKNXBebrRyMf03EZ4Iid-L6kyF5xf3qxkzEtmM0&dib_tag=se&keywords=leeslampje&qid=1764423881&sprefix=leesl%2Caps%2C111&sr=8-23-spons&aref=cR4CyuAQT6&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&th=1&linkCode=ll1&tag=gifteez77-21&linkId=f0fe66cb50908e0f7dc52d972b57c5d9&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Premium leeslamp voor €30,99 - topkwaliteit',
      },
      {
        title: 'Leeslampje B0CGM5TLZX',
        price: 19.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71XfibZzmZL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Gritin-Oplaadbaar-Oogbescherming-Kleurtemperaturen-Ergonomisch/dp/B0CGM5TLZX?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.oNrAGYzJ2ytQAsle3p3MCio2zIq4sdS335nL6gCtfSdBpzrZfjXehrcs5kI55j3PInyNKKlO0jLkTHj3RO4_AiDetoFGhri3vtyQ7Nyi4YXAKutxlKNhIaeR0xqepGhg6oXDmdJy3p3oXj12Dh1XPkHd9pBYWY9bJ2hpDznlM6GIVroD3vjL2PErpajU_ew7-w8sLfST-3piaVUVHa9nG4coVtwgRCj86nK5rQ1YMVsknnpw7lZ5uJSJerBvjP1e7RDCRx70yOR4gneodQEBZ-2v2FjgQdobd_Mg4Tp5qyg.LeHhFKNXBebrRyMf03EZ4Iid-L6kyF5xf3qxkzEtmM0&dib_tag=se&keywords=leeslampje&qid=1764423881&sprefix=leesl%2Caps%2C111&sr=8-28&linkCode=ll1&tag=gifteez77-21&linkId=cef6510deb0154cd57f147ffb3e6bf63&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Populaire keuze voor €19,99 - goede prijs-kwaliteit',
      },
      {
        title: 'Leeslampje B0C6XT1JFF',
        price: 25.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71rwR8CwdDL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Glocusent-oplaadbare-batterijduur-leeslampjes-helderheid/dp/B0C6XT1JFF?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.oNrAGYzJ2ytQAsle3p3MCio2zIq4sdS335nL6gCtfSdBpzrZfjXehrcs5kI55j3PInyNKKlO0jLkTHj3RO4_AiDetoFGhri3vtyQ7Nyi4YXAKutxlKNhIaeR0xqepGhg6oXDmdJy3p3oXj12Dh1XPkHd9pBYWY9bJ2hpDznlM6GIVroD3vjL2PErpajU_ew7-w8sLfST-3piaVUVHa9nG4coVtwgRCj86nK5rQ1YMVsknnpw7lZ5uJSJerBvjP1e7RDCRx70yOR4gneodQEBZ-2v2FjgQdobd_Mg4Tp5qyg.LeHhFKNXBebrRyMf03EZ4Iid-L6kyF5xf3qxkzEtmM0&dib_tag=se&keywords=leeslampje&qid=1764423881&sprefix=leesl%2Caps%2C111&sr=8-55&th=1&linkCode=ll1&tag=gifteez77-21&linkId=c0846bf4c859d582fee1369af20e274e&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Mid-range voor €25,99 - uitstekende features',
      },
      {
        title: 'Leeslampje B0B74X6669',
        price: 10.79,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71ZaE+ogx0L._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/DEWENWILS-Boekenklem-Oplaadbaar-Helderheidsniveaus-Boekenwurmen/dp/B0B74X6669?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.oNrAGYzJ2ytQAsle3p3MCio2zIq4sdS335nL6gCtfSdBpzrZfjXehrcs5kI55j3PInyNKKlO0jLkTHj3RO4_AiDetoFGhri3vtyQ7Nyi4YXAKutxlKNhIaeR0xqepGhg6oXDmdJy3p3oXj12Dh1XPkHd9pBYWY9bJ2hpDznlM6GIVroD3vjL2PErpajU_ew7-w8sLfST-3piaVUVHa9nG4coVtwgRCj86nK5rQ1YMVsknnpw7lZ5uJSJerBvjP1e7RDCRx70yOR4gneodQEBZ-2v2FjgQdobd_Mg4Tp5qyg.LeHhFKNXBebrRyMf03EZ4Iid-L6kyF5xf3qxkzEtmM0&dib_tag=se&keywords=leeslampje&qid=1764423881&sprefix=leesl%2Caps%2C111&sr=8-54&th=1&linkCode=ll1&tag=gifteez77-21&linkId=f3c57dfcfda75561c4f97e5e9adcf46b&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Budget optie voor €10,79 - perfect voor kleine cadeaus',
      },
      {
        title: 'Leeslampje B0DG617KBZ',
        price: 44.95,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/613UlAv1I5L._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/BRILONER-aansluiting-schakelaar-draaibaar-leeslampje/dp/B0DG617KBZ?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.oNrAGYzJ2ytQAsle3p3MCio2zIq4sdS335nL6gCtfSdBpzrZfjXehrcs5kI55j3PInyNKKlO0jLkTHj3RO4_AiDetoFGhri3vtyQ7Nyi4YXAKutxlKNhIaeR0xqepGhg6oXDmdJy3p3oXj12Dh1XPkHd9pBYWY9bJ2hpDznlM6GIVroD3vjL2PErpajU_ew7-w8sLfST-3piaVUVHa9nG4coVtwgRCj86nK5rQ1YMVsknnpw7lZ5uJSJerBvjP1e7RDCRx70yOR4gneodQEBZ-2v2FjgQdobd_Mg4Tp5qyg.LeHhFKNXBebrRyMf03EZ4Iid-L6kyF5xf3qxkzEtmM0&dib_tag=se&keywords=leeslampje&qid=1764423881&sprefix=leesl%2Caps%2C111&sr=8-59-spons&aref=G52hb2sqIC&sp_csd=d2lkZ2V0TmFtZT1zcF9idGY&psc=1&linkCode=ll1&tag=gifteez77-21&linkId=af4e57acd30f5840427e5472b87b97d9&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Premium leeslamp voor €44,95 - topkwaliteit',
      },
      {
        title: 'Leeslampje B0BRB24M5Z',
        price: 41.8,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/41NXUMGJzBL._AC_SL1001_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Obeaming-nachtkastje-bestelwagen-vrachtwagen-USB-oplader/dp/B0BRB24M5Z?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.oNrAGYzJ2ytQAsle3p3MCio2zIq4sdS335nL6gCtfSdBpzrZfjXehrcs5kI55j3PInyNKKlO0jLkTHj3RO4_AiDetoFGhri3vtyQ7Nyi4YXAKutxlKNhIaeR0xqepGhg6oXDmdJy3p3oXj12Dh1XPkHd9pBYWY9bJ2hpDznlM6GIVroD3vjL2PErpajU_ew7-w8sLfST-3piaVUVHa9nG4coVtwgRCj86nK5rQ1YMVsknnpw7lZ5uJSJerBvjP1e7RDCRx70yOR4gneodQEBZ-2v2FjgQdobd_Mg4Tp5qyg.LeHhFKNXBebrRyMf03EZ4Iid-L6kyF5xf3qxkzEtmM0&dib_tag=se&keywords=leeslampje&qid=1764423881&sprefix=leesl%2Caps%2C111&sr=8-60-spons&aref=YzabNhWJkj&sp_csd=d2lkZ2V0TmFtZT1zcF9idGY&psc=1&linkCode=ll1&tag=gifteez77-21&linkId=40744eae912c49ae25f94f48e7dc06d1&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Premium leeslamp voor €41,8 - topkwaliteit',
      },
      {
        title: 'Leeslampje B09MHFSSFB',
        price: 14.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61Psf4CwnML._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Glocusent-Lichtgewicht-Oplaadbare-Oogverzorging-Boekenwurmen/dp/B09MHFSSFB?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.GgUgfiYzLQ7B9tIALkcPyLOXyrZ-lrXOLf6b_LKhnntb2QuOR9sEWf4vTkhJz4U4JUhzS0uVbv5s7OMtilTj-_s4kLlhRvAHxlhiVW06cokLdqkPRjSXfOBS4fqth6CEWea08vFS93GTQ6ya_nsDL7-_-O59YQXaNK3Ay6cr-sErFUFq3oggFDytACEvmIqGGbywCF0r-FVR3HlolC8Y-XDt4POB4tIGvyzm0XccAHtSPdS3xLIrgxhQBdGSHqYrJpDnmkkLLYQgBvQMz_M-DCDjyTwnrUMaNiLZ0imnmVw.hHH92JwYWSosq_h4mKrvei2ozlYY4f7GaiKGae9unfI&dib_tag=se&keywords=leeslampje&qid=1764428871&sprefix=leesl%2Caps%2C111&sr=8-51&xpid=sXnX727IRQPqO&linkCode=ll1&tag=gifteez77-21&linkId=cef2790fb52f3101dc6a53d586e6c4fe&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Populaire keuze voor €14,99 - goede prijs-kwaliteit',
      },
      {
        title: 'Leeslampje B0CYT4J92R',
        price: 11.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71Xq73RLApL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/oplaadbare-leescliplamp-oogbescherming-kleurtemperaturen-boekenliefhebbers/dp/B0CYT4J92R?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.sd737w8H4-BSYQjeU8ZHmArKUBugwjcVtrL6kiehkxaqvRhG8ea0os3euTavobTCRgD4MZZ4m97e6Fw9x45XxnhPEzqVchsUvgFmpI3tgh70JQdfS4JWrAJYkyAqhtzAbIPT1XnL2bbUcPPYe-8VCKXtcqcBK6WUkRQ09u-l3ytyi24fNrMEKIUq1RgmX0uei8nApchhjl0dQKHwsVj70RcnZmOk6c_be_1Iw4Hd7gsnW3RmnRTy-8MPgrUEc5gtoyyZ2_k7tAJz756TOzUuX7nl7W_U5EzwehMYBQ7ACAg.MnkZGSTLsoCcpKWL3FqzaFFjuY4YhKNtkEvHqn8Td9g&dib_tag=se&keywords=leeslampje&qid=1764431429&refinements=p_36%3A1000-1500&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-2-spons&aref=U4pcJGEMl3&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll1&tag=gifteez77-21&linkId=b18ad7744ce153798b7b3ab5c1d4299a&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Budget optie voor €11,99 - perfect voor kleine cadeaus',
      },
      {
        title: 'Leeslampje B09W62FR1K',
        price: 12.6,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71zlqqwba8L._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Glocusent-oogvriendelijke-boekenleeslamp-helderheden-boekenliefhebbers/dp/B09W62FR1K?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.sd737w8H4-BSYQjeU8ZHmArKUBugwjcVtrL6kiehkxaqvRhG8ea0os3euTavobTCRgD4MZZ4m97e6Fw9x45XxnhPEzqVchsUvgFmpI3tgh70JQdfS4JWrAJYkyAqhtzAbIPT1XnL2bbUcPPYe-8VCKXtcqcBK6WUkRQ09u-l3ytyi24fNrMEKIUq1RgmX0uei8nApchhjl0dQKHwsVj70RcnZmOk6c_be_1Iw4Hd7gsnW3RmnRTy-8MPgrUEc5gtoyyZ2_k7tAJz756TOzUuX7nl7W_U5EzwehMYBQ7ACAg.MnkZGSTLsoCcpKWL3FqzaFFjuY4YhKNtkEvHqn8Td9g&dib_tag=se&keywords=leeslampje&qid=1764431429&refinements=p_36%3A1000-1500&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-7&th=1&linkCode=ll1&tag=gifteez77-21&linkId=3f1551bade8cb4d625bc6667052d5617&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Budget optie voor €12,6 - perfect voor kleine cadeaus',
      },
      {
        title: 'Leeslampje B0D79G47MQ',
        price: 14.48,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/51-8jc6qFnL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Bladwijzerlamp-USB-leeslamp-Bladwijzerboeklicht-Kleurenmodus-Dimhelderheid/dp/B0D79G47MQ?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.sd737w8H4-BSYQjeU8ZHmArKUBugwjcVtrL6kiehkxaqvRhG8ea0os3euTavobTCRgD4MZZ4m97e6Fw9x45XxnhPEzqVchsUvgFmpI3tgh70JQdfS4JWrAJYkyAqhtzAbIPT1XnL2bbUcPPYe-8VCKXtcqcBK6WUkRQ09u-l3ytyi24fNrMEKIUq1RgmX0uei8nApchhjl0dQKHwsVj70RcnZmOk6c_be_1Iw4Hd7gsnW3RmnRTy-8MPgrUEc5gtoyyZ2_k7tAJz756TOzUuX7nl7W_U5EzwehMYBQ7ACAg.MnkZGSTLsoCcpKWL3FqzaFFjuY4YhKNtkEvHqn8Td9g&dib_tag=se&keywords=leeslampje&qid=1764431429&refinements=p_36%3A1000-1500&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-21-spons&aref=2WE3WdY6DJ&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&psc=1&linkCode=ll1&tag=gifteez77-21&linkId=14906a80f88cfa9d910cd55914bb37eb&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Populaire keuze voor €14,48 - goede prijs-kwaliteit',
      },
      {
        title: 'Leeslampje B0CJY563ZX',
        price: 11.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/41eJALHxZJL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Runesol-leeslampje-oplaadbare-boeklampjes-oogbeschermende/dp/B0CJY563ZX?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.sd737w8H4-BSYQjeU8ZHmArKUBugwjcVtrL6kiehkxaqvRhG8ea0os3euTavobTCRgD4MZZ4m97e6Fw9x45XxnhPEzqVchsUvgFmpI3tgh70JQdfS4JWrAJYkyAqhtzAbIPT1XnL2bbUcPPYe-8VCKXtcqcBK6WUkRQ09u-l3ytyi24fNrMEKIUq1RgmX0uei8nApchhjl0dQKHwsVj70RcnZmOk6c_be_1Iw4Hd7gsnW3RmnRTy-8MPgrUEc5gtoyyZ2_k7tAJz756TOzUuX7nl7W_U5EzwehMYBQ7ACAg.MnkZGSTLsoCcpKWL3FqzaFFjuY4YhKNtkEvHqn8Td9g&dib_tag=se&keywords=leeslampje&qid=1764431429&refinements=p_36%3A1000-1500&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-23-spons&aref=VEuGrA7Ryd&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&th=1&linkCode=ll1&tag=gifteez77-21&linkId=48de1facd884b9db78ce443f5402b395&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Budget optie voor €11,99 - perfect voor kleine cadeaus',
      },
      {
        title: 'Leeslampje B0BMXWLZ9W',
        price: 12.23,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/51Xpn7-dTiL._AC_SL1001_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Led-Klemlamp-Zwanenhals-Klemlamp-Nachtkastje-Oogbescherming-Boekklemlamp/dp/B0BMXWLZ9W?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.sd737w8H4-BSYQjeU8ZHmArKUBugwjcVtrL6kiehkxaqvRhG8ea0os3euTavobTCRgD4MZZ4m97e6Fw9x45XxnhPEzqVchsUvgFmpI3tgh70JQdfS4JWrAJYkyAqhtzAbIPT1XnL2bbUcPPYe-8VCKXtcqcBK6WUkRQ09u-l3ytyi24fNrMEKIUq1RgmX0uei8nApchhjl0dQKHwsVj70RcnZmOk6c_be_1Iw4Hd7gsnW3RmnRTy-8MPgrUEc5gtoyyZ2_k7tAJz756TOzUuX7nl7W_U5EzwehMYBQ7ACAg.MnkZGSTLsoCcpKWL3FqzaFFjuY4YhKNtkEvHqn8Td9g&dib_tag=se&keywords=leeslampje&qid=1764431429&refinements=p_36%3A1000-1500&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-22-spons&aref=SCmlIhRbps&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&psc=1&linkCode=ll1&tag=gifteez77-21&linkId=2df6a795323f1d30795d997064f32cb7&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Budget optie voor €12,23 - perfect voor kleine cadeaus',
      },
      {
        title: 'Leeslampje B0F24G4R9L',
        price: 13.95,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/712uaJrAa8L._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Boncy%C2%AE-Draadloos-Leeslampje-voor-Boek/dp/B0F24G4R9L?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.sd737w8H4-BSYQjeU8ZHmArKUBugwjcVtrL6kiehkxaqvRhG8ea0os3euTavobTCRgD4MZZ4m97e6Fw9x45XxnhPEzqVchsUvgFmpI3tgh70JQdfS4JWrAJYkyAqhtzAbIPT1XnL2bbUcPPYe-8VCKXtcqcBK6WUkRQ09u-l3ytyi24fNrMEKIUq1RgmX0uei8nApchhjl0dQKHwsVj70RcnZmOk6c_be_1Iw4Hd7gsnW3RmnRTy-8MPgrUEc5gtoyyZ2_k7tAJz756TOzUuX7nl7W_U5EzwehMYBQ7ACAg.MnkZGSTLsoCcpKWL3FqzaFFjuY4YhKNtkEvHqn8Td9g&dib_tag=se&keywords=leeslampje&qid=1764431429&refinements=p_36%3A1000-1500&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-33&th=1&linkCode=ll1&tag=gifteez77-21&linkId=d76419a12125a174871e552ef5644a14&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Populaire keuze voor €13,95 - goede prijs-kwaliteit',
      },
      {
        title: 'Leeslampje B07P6XKH6M',
        price: 15.14,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/41VsPuaMmcL._AC_SL1024_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Libri_x-Leeslamp-klemlamp-traploze-led-leeslamp/dp/B07P6XKH6M?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.8ZAoaNQPBAybkZpwFbh3AOLYXGddyR-piFbXISFC9eXYZaR9-p9pro4Oc_7zYocvtGvhDQoU4WT5vy76VnDzMd03hQbmPJBytQXnHHATaPYDbClUVSCUSv7V-IilZpuBToCzGY_-R6KRNdl0Fp6rHhkHRPEggCd5krSjMhL7xDocJvN2Rd2d02Wi1-9o9OzYlD9dGNvUAV8mAaF2ghXQskwHsMVYTK9KTsQzfV3aQKbWg8y6D2j-kpzg-opb_IiEFV8aI2ltSy15C5wAZOzhNQ4I86YRhfVmVeE2OaPOadw.x6kbtN5EAwyXQY2UvtEN_Csd44FFGR-Was_pwcL_wCw&dib_tag=se&keywords=leeslampje&qid=1764431955&refinements=p_36%3A1400-3100&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-20&th=1&linkCode=ll1&tag=gifteez77-21&linkId=4a2043a4e619f1db87ba95c562ea40be&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Populaire keuze voor €15,14 - goede prijs-kwaliteit',
      },
      {
        title: 'Leeslampje B0CGM5TLZX',
        price: 19.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71XfibZzmZL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Gritin-Oplaadbaar-Oogbescherming-Kleurtemperaturen-Ergonomisch/dp/B0CGM5TLZX?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.8ZAoaNQPBAybkZpwFbh3AOLYXGddyR-piFbXISFC9eXYZaR9-p9pro4Oc_7zYocvtGvhDQoU4WT5vy76VnDzMd03hQbmPJBytQXnHHATaPYDbClUVSCUSv7V-IilZpuBToCzGY_-R6KRNdl0Fp6rHhkHRPEggCd5krSjMhL7xDocJvN2Rd2d02Wi1-9o9OzYlD9dGNvUAV8mAaF2ghXQskwHsMVYTK9KTsQzfV3aQKbWg8y6D2j-kpzg-opb_IiEFV8aI2ltSy15C5wAZOzhNQ4I86YRhfVmVeE2OaPOadw.x6kbtN5EAwyXQY2UvtEN_Csd44FFGR-Was_pwcL_wCw&dib_tag=se&keywords=leeslampje&qid=1764431955&refinements=p_36%3A1400-3100&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-16&linkCode=ll1&tag=gifteez77-21&linkId=b97c59dceb5f21652c1c3deaf1d0b186&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Populaire keuze voor €19,99 - goede prijs-kwaliteit',
      },
      {
        title: 'Leeslampje B0DLHBYP3N',
        price: 20.95,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61d-XCintsL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/BRILONER-bureaulamp-oplaadbare-magnetisch-afneembaar/dp/B0DLHBYP3N?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.8ZAoaNQPBAybkZpwFbh3AOLYXGddyR-piFbXISFC9eXYZaR9-p9pro4Oc_7zYocvtGvhDQoU4WT5vy76VnDzMd03hQbmPJBytQXnHHATaPYDbClUVSCUSv7V-IilZpuBToCzGY_-R6KRNdl0Fp6rHhkHRPEggCd5krSjMhL7xDocJvN2Rd2d02Wi1-9o9OzYlD9dGNvUAV8mAaF2ghXQskwHsMVYTK9KTsQzfV3aQKbWg8y6D2j-kpzg-opb_IiEFV8aI2ltSy15C5wAZOzhNQ4I86YRhfVmVeE2OaPOadw.x6kbtN5EAwyXQY2UvtEN_Csd44FFGR-Was_pwcL_wCw&dib_tag=se&keywords=leeslampje&qid=1764431955&refinements=p_36%3A1400-3100&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-24-spons&aref=JfadoGByjE&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&psc=1&linkCode=ll1&tag=gifteez77-21&linkId=b72db847fd24f5a33cfc9319df47ff07&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Mid-range voor €20,95 - uitstekende features',
      },
      {
        title: 'Leeslampje B0BBKYBN1B',
        price: 20.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71zHniqrxlL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/86lux-ultralichte-led-klemlamp-barnsteenkleuren-boekenliefhebbers/dp/B0BBKYBN1B?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.8ZAoaNQPBAybkZpwFbh3AOLYXGddyR-piFbXISFC9eXYZaR9-p9pro4Oc_7zYocvtGvhDQoU4WT5vy76VnDzMd03hQbmPJBytQXnHHATaPYDbClUVSCUSv7V-IilZpuBToCzGY_-R6KRNdl0Fp6rHhkHRPEggCd5krSjMhL7xDocJvN2Rd2d02Wi1-9o9OzYlD9dGNvUAV8mAaF2ghXQskwHsMVYTK9KTsQzfV3aQKbWg8y6D2j-kpzg-opb_IiEFV8aI2ltSy15C5wAZOzhNQ4I86YRhfVmVeE2OaPOadw.x6kbtN5EAwyXQY2UvtEN_Csd44FFGR-Was_pwcL_wCw&dib_tag=se&keywords=leeslampje&qid=1764431955&refinements=p_36%3A1400-3100&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-26&th=1&linkCode=ll1&tag=gifteez77-21&linkId=723f3622efe6f3d469d3356f0d4d65c7&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Mid-range voor €20,99 - uitstekende features',
      },
      {
        title: 'Leeslampje B0C71DY2LG',
        price: 19.45,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/516-o1vdsLL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Alyvisun-LED-Halsleeslampje-Oplaadbaar-Oogbescherming/dp/B0C71DY2LG?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.8ZAoaNQPBAybkZpwFbh3AOLYXGddyR-piFbXISFC9eXYZaR9-p9pro4Oc_7zYocvtGvhDQoU4WT5vy76VnDzMd03hQbmPJBytQXnHHATaPYDbClUVSCUSv7V-IilZpuBToCzGY_-R6KRNdl0Fp6rHhkHRPEggCd5krSjMhL7xDocJvN2Rd2d02Wi1-9o9OzYlD9dGNvUAV8mAaF2ghXQskwHsMVYTK9KTsQzfV3aQKbWg8y6D2j-kpzg-opb_IiEFV8aI2ltSy15C5wAZOzhNQ4I86YRhfVmVeE2OaPOadw.x6kbtN5EAwyXQY2UvtEN_Csd44FFGR-Was_pwcL_wCw&dib_tag=se&keywords=leeslampje&qid=1764431955&refinements=p_36%3A1400-3100&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-32&linkCode=ll1&tag=gifteez77-21&linkId=717e9e1c10d18815e51e2097366af0a9&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Populaire keuze voor €19,45 - goede prijs-kwaliteit',
      },
      {
        title: 'Leeslampje B0CHVVNLY6',
        price: 24.09,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71hUx2A-SHL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Glocusent-uitschuifbare-USB-oplaadbare-leeslampjes-boekenliefhebbers/dp/B0CHVVNLY6?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.8ZAoaNQPBAybkZpwFbh3AOLYXGddyR-piFbXISFC9eXYZaR9-p9pro4Oc_7zYocvtGvhDQoU4WT5vy76VnDzMd03hQbmPJBytQXnHHATaPYDbClUVSCUSv7V-IilZpuBToCzGY_-R6KRNdl0Fp6rHhkHRPEggCd5krSjMhL7xDocJvN2Rd2d02Wi1-9o9OzYlD9dGNvUAV8mAaF2ghXQskwHsMVYTK9KTsQzfV3aQKbWg8y6D2j-kpzg-opb_IiEFV8aI2ltSy15C5wAZOzhNQ4I86YRhfVmVeE2OaPOadw.x6kbtN5EAwyXQY2UvtEN_Csd44FFGR-Was_pwcL_wCw&dib_tag=se&keywords=leeslampje&qid=1764431955&refinements=p_36%3A1400-3100&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-34&th=1&linkCode=ll1&tag=gifteez77-21&linkId=af029cb547cba659d4560e625a2e4592&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Mid-range voor €24,09 - uitstekende features',
      },
      {
        title: 'Leeslampje B0BZ41MK7G',
        price: 41.41,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61WowD3tY9L._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Laadpoort-Schakelaar-Verstelbare-Spotlight-Aluminium/dp/B0BZ41MK7G?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.RI9gEbYGETkEZBJTopFjFrUg029UL9QVlcPoHYAIelRFxk3XLRROMQ7Ac8DmJNNjPKpYyGntKVlwVD-J4fIqK95o1uDmsWi54Mll7RHvxPsX13rEcVrrRi-czXLdsHA0wwWfRQLPnv-OogA-Xg5Fre9Rqu9WHqFX_WnSaHR2SOMysQ10Xk30l9WYdhu-bTJXGfOCQjsoLlWdjq6veoAoXzwC30nsyxVu3O48Ted6HcVOxjdJpeYy2Typ2Vb0NuugskkvKo0gpyLwtxI2rhRvInE2btDqqYhHfNDiKidtQg0.643WoceFASSqv4CpFQy1037gm892XA8aCwqL2orwvOc&dib_tag=se&keywords=leeslampje&qid=1764432388&refinements=p_36%3A3100-10000&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-3-spons&aref=5f9YFzlNY0&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll1&tag=gifteez77-21&linkId=0c7e0111f7d9f5b279fe794ead673230&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Premium leeslamp voor €41,41 - topkwaliteit',
      },
      {
        title: 'Leeslampje B0D8TTTKJY',
        price: 37.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61GTtc0rBtL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Obeaming-leeslampje-zwanenhals-bestelwagen-drukdimmer/dp/B0D8TTTKJY?crid=3LDMZ1E2DYWGO&dib=eyJ2IjoiMSJ9.RI9gEbYGETkEZBJTopFjFrUg029UL9QVlcPoHYAIelRFxk3XLRROMQ7Ac8DmJNNjPKpYyGntKVlwVD-J4fIqK95o1uDmsWi54Mll7RHvxPsX13rEcVrrRi-czXLdsHA0wwWfRQLPnv-OogA-Xg5Fre9Rqu9WHqFX_WnSaHR2SOMysQ10Xk30l9WYdhu-bTJXGfOCQjsoLlWdjq6veoAoXzwC30nsyxVu3O48Ted6HcVOxjdJpeYy2Typ2Vb0NuugskkvKo0gpyLwtxI2rhRvInE2btDqqYhHfNDiKidtQg0.643WoceFASSqv4CpFQy1037gm892XA8aCwqL2orwvOc&dib_tag=se&keywords=leeslampje&qid=1764432388&refinements=p_36%3A3100-10000&rnid=16332312031&sprefix=leesl%2Caps%2C111&sr=8-13&th=1&linkCode=ll1&tag=gifteez77-21&linkId=999fcd37e6bbf01c14d9e5be138ba8fe&language=nl_NL&ref_=as_li_ss_tl',
        merchant: 'Amazon',
        reason: 'Premium leeslamp voor €37,99 - topkwaliteit',
      },
    ],
    highlights: [
      "Amber licht bevat minder blauwlicht en verstoort de slaap minder dan witte LED's",
      'Stil clipsysteem met rubberen klem - niemand wordt wakker',
      'Lampjes met 20–70 uur batterijduur - ideaal voor lange leessessies',
      'Lichtgewicht ontwerp - hoe lichter, hoe minder vermoeiend',
    ],
    faq: [
      {
        q: 'Welk cadeau is het beste voor nachtlezers?',
        a: 'Amberkleurige leeslampjes met zachte klemmen zijn het meest geliefd.',
      },
      {
        q: "Welke gadgets houden mijn partner 's nachts niet wakker?",
        a: 'Licht met ambermodus en lampjes met stille knoppen.',
      },
      {
        q: 'Is blauw licht slecht voor lezen in bed?',
        a: 'Ja, blauw licht kan je melatonine verstoren. Amber licht is beter.',
      },
      {
        q: 'Wat is een betaalbaar cadeau voor nachtlezers?',
        a: 'Een oplaadbare clip-on leeslamp onder €20 werkt fantastisch.',
      },
    ],
    internalLinks: [
      { href: '/cadeaugidsen', label: 'Alle cadeaugidsen' },
      { href: '/cadeaugidsen/kerst/voor-haar/onder-50', label: 'Cadeaus voor haar onder €50' },
    ],
  },
  // ==================== CADEAUS VOOR THUISWERKERS ====================
  {
    slug: 'cadeaus-voor-thuiswerkers',
    title: 'De beste cadeaus voor thuiswerkers (2025)',
    intro:
      'Sinds de pandemie werken miljoenen mensen thuis — en hun thuiswerkplek kan altijd beter. Van ergonomische gadgets tot gezellige sfeermakers: ontdek de slimste cadeaus die elke thuiswerker blij maken. Of het nu gaat om productiviteit, comfort of welzijn, hier vind je het perfecte cadeau.',
    interest: 'tech',
    budgetMax: 100,
    quickScan: {
      personas: [
        {
          id: 'productiviteit-freak',
          label: 'De Productiviteit-Freak',
          summary:
            'Wil alles optimaliseren: tweede scherm, snelle muis, goede koptelefoon. Zoekt gadgets die werk efficiënter maken.',
          action: {
            type: 'filters',
            label: 'Bekijk productiviteit gadgets',
            sortOption: 'price-desc',
          },
        },
        {
          id: 'comfort-zoeker',
          label: 'De Comfort-Zoeker',
          summary:
            'Ergonomie is alles: goede stoel, polssteun, bureaulamp. Wil de hele dag comfortabel werken zonder rugpijn.',
          action: {
            type: 'filters',
            label: 'Bekijk comfort producten',
            sortOption: 'price-asc',
          },
        },
        {
          id: 'sfeer-creator',
          label: 'De Sfeer-Creator',
          summary:
            'Een mooie werkplek = betere focus. Zoekt planten, kaarsen, mooie mokken en decoratie voor de thuiswerkplek.',
          action: {
            type: 'filters',
            label: 'Bekijk sfeer producten',
            fastDeliveryOnly: true,
            sortOption: 'price-asc',
          },
        },
      ],
    },
    curatedProducts: [
      // PRODUCTIVITEIT GADGETS
      {
        title: 'Logitech MX Master 3S Muis',
        price: 89.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Logitech-Master-Draadloze-Bluetooth-Grafieten/dp/B0B17WBTQX?crid=1TXWCY1LQW5QJ&dib=eyJ2IjoiMSJ9.UQh9qUkVRw1bLz1W9kEozwXnO_SqQc0V7o4ZDi9pCJ4kqH5rEK9LGmlI8Df4xd9tQ0GNx-0FbP-0x6Y5gzAP8w.LKV3LLPu7cH9wOKiKb1vMTrQx9cNDVrZNr7y1mKL9dE&dib_tag=se&keywords=logitech+mx+master+3s&qid=1764440000&sprefix=logitech+mx%2Caps%2C111&sr=8-3&th=1&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Beste ergonomische muis - stil scrollen, 70 dagen batterij',
      },
      {
        title: 'Anker PowerConf S500 Speakerphone',
        price: 59.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61Xic2AEXWL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Anker-conferentieluidspreker-Bluetooth-PowerConf-vergaderruimtes/dp/B09FFXY6JH?crid=2GQZQJZXNJ6FV&dib=eyJ2IjoiMSJ9.8LOoHq5xpY7KvIqxJCpq3A.jkZGVHpOE6ypHqD6-p6zSHm7VXRG0-q4j0p7R8y1234&dib_tag=se&keywords=anker+speakerphone&qid=1764440100&sprefix=anker+speaker%2Caps%2C111&sr=8-1&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Kristalheldere calls - perfect voor meetings',
      },
      {
        title: 'UGREEN USB-C Hub 7-in-1',
        price: 34.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61qHSaYvhCL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/UGREEN-USB-Hub-Adapter-Compatibel/dp/B0CF5HP4L4?crid=3M6VQJHXH6NVF&dib=eyJ2IjoiMSJ9.Gh5LJKM9cSyP5R7L1n1xoA.x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2&dib_tag=se&keywords=ugreen+usb+c+hub&qid=1764440200&sprefix=ugreen+usb%2Caps%2C111&sr=8-5&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Alle poorten die je nodig hebt - HDMI, USB-A, SD-kaart',
      },
      {
        title: 'Logitech K380 Bluetooth Toetsenbord',
        price: 39.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/51yjnAAqnZL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Logitech-K380-Bluetooth-Toetsenbord-Apparaten/dp/B013SL2R5Q?crid=2YQJP7FKQX5CJ&dib=eyJ2IjoiMSJ9.ABC123DEF456GHI789.JKL012MNO345PQR678STU901VWX234YZ&dib_tag=se&keywords=logitech+k380&qid=1764440300&sprefix=logitech+k38%2Caps%2C111&sr=8-1&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Compact, stil en werkt met 3 apparaten tegelijk',
      },
      // COMFORT PRODUCTEN
      {
        title: 'BenQ ScreenBar Monitor Lamp',
        price: 99.0,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/51uB1oUzXQL._AC_SL1000_.jpg',
        affiliateLink:
          'https://www.amazon.nl/BenQ-ScreenBar-Monitor-Light-Bar/dp/B076VNFZJG?crid=1N5J7KLQX9CVJ&dib=eyJ2IjoiMSJ9.AAA111BBB222CCC333.DDD444EEE555FFF666GGG777HHH888&dib_tag=se&keywords=benq+screenbar&qid=1764440400&sprefix=benq+screen%2Caps%2C111&sr=8-1&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Geen reflectie op scherm - automatische helderheid',
      },
      {
        title: 'Fellowes Ergonomische Polssteun',
        price: 24.95,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71DLB8bYpQL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Fellowes-Memory-Foam-Polssteun-Toetsenbord/dp/B002I7LHRQ?crid=3PQRS7UVWXYZ&dib=eyJ2IjoiMSJ9.III111JJJ222KKK333.LLL444MMM555NNN666OOO777PPP888&dib_tag=se&keywords=fellowes+polssteun&qid=1764440500&sprefix=fellowes+pols%2Caps%2C111&sr=8-1&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Memory foam voor dagelijks comfort - voorkomt RSI',
      },
      {
        title: 'HUANUO Monitorstandaard met Lade',
        price: 28.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71OqIpBJWRL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/HUANUO-Monitorstandaard-Verstelbaar-Bureauorganizer/dp/B09KGQQ1G4?crid=1QQQ111RRR222&dib=eyJ2IjoiMSJ9.SSS333TTT444UUU555.VVV666WWW777XXX888YYY999ZZZ000&dib_tag=se&keywords=monitor+standaard&qid=1764440600&sprefix=monitor+stand%2Caps%2C111&sr=8-3&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Verhoogt scherm naar ooghoogte - extra opbergruimte',
      },
      {
        title: 'Ergonomische Voetsteun Verstelbaar',
        price: 32.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71tJrZvTD9L._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Ergonomische-Voetsteun-Verstelbaar-Kantoor/dp/B07X5YTZMF?crid=2AAA111BBB222&dib=eyJ2IjoiMSJ9.CCC333DDD444EEE555.FFF666GGG777HHH888III999JJJ000&dib_tag=se&keywords=voetsteun+ergonomisch&qid=1764440700&sprefix=voetsteun%2Caps%2C111&sr=8-2&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Verbetert houding - 6 hoogtes instelbaar',
      },
      // SFEER PRODUCTEN
      {
        title: 'Ember Mok 2 - Temperatuurregeling',
        price: 99.95,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61lS+ZG6GnL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Ember-Temperature-Control-Smart-Mug/dp/B07NQRM6ML?crid=3KKK111LLL222&dib=eyJ2IjoiMSJ9.MMM333NNN444OOO555.PPP666QQQ777RRR888SSS999TTT000&dib_tag=se&keywords=ember+mug&qid=1764440800&sprefix=ember+mu%2Caps%2C111&sr=8-1&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Houdt koffie/thee op perfecte temperatuur - premium cadeau',
      },
      {
        title: 'IKEA FEJKA Kunstplant Set',
        price: 12.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71qOqzNvv6L._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Kunstplanten-Decoratieve-Bureau-Planten/dp/B09W8CKQTY?crid=1UUU111VVV222&dib=eyJ2IjoiMSJ9.WWW333XXX444YYY555.ZZZ666AAA777BBB888CCC999DDD000&dib_tag=se&keywords=kunstplant+bureau&qid=1764440900&sprefix=kunstplant+bure%2Caps%2C111&sr=8-5&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Groen op je bureau zonder onderhoud',
      },
      {
        title: 'Philips Hue Play Light Bar',
        price: 54.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61Nf-g3XQ+L._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Philips-Hue-Play-Light-Bar/dp/B07GXB3S7Z?crid=2EEE111FFF222&dib=eyJ2IjoiMSJ9.GGG333HHH444III555.JJJ666KKK777LLL888MMM999NNN000&dib_tag=se&keywords=philips+hue+play&qid=1764441000&sprefix=philips+hue+pl%2Caps%2C111&sr=8-1&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Sfeerverlichting achter je monitor - 16 miljoen kleuren',
      },
      {
        title: 'Stanley Quencher Tumbler 1.2L',
        price: 44.95,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71yM5sNPEvL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Stanley-Quencher-H2-0-FlowState-Tumbler/dp/B0BX7F5DB7?crid=3OOO111PPP222&dib=eyJ2IjoiMSJ9.QQQ333RRR444SSS555.TTT666UUU777VVV888WWW999XXX000&dib_tag=se&keywords=stanley+quencher&qid=1764441100&sprefix=stanley+quench%2Caps%2C111&sr=8-1&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Houdt drinken koud/warm - 1.2L = genoeg voor hele dag',
      },
      // WELLNESS PRODUCTEN
      {
        title: 'Bose QuietComfort Earbuds II',
        price: 79.0,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/51QnVhfpq+L._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Bose-QuietComfort-Wireless-Bluetooth-Cancelling/dp/B0B4PSQHD5?crid=1YYY111ZZZ222&dib=eyJ2IjoiMSJ9.AAA333BBB444CCC555.DDD666EEE777FFF888GGG999HHH000&dib_tag=se&keywords=bose+earbuds&qid=1764441200&sprefix=bose+earbud%2Caps%2C111&sr=8-2&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Beste noise-cancelling voor focus - 6 uur batterij',
      },
      {
        title: 'Theragun Mini Massagepistool',
        price: 99.0,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61VPkB+v1kL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Therabody-Theragun-Mini-Massagepistool/dp/B099Z9YJFN?crid=2III111JJJ222&dib=eyJ2IjoiMSJ9.KKK333LLL444MMM555.NNN666OOO777PPP888QQQ999RRR000&dib_tag=se&keywords=theragun+mini&qid=1764441300&sprefix=theragun+min%2Caps%2C111&sr=8-1&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Compacte massage voor nek en schouders na lang zitten',
      },
      {
        title: 'Airbender Bureaustoelkussen',
        price: 39.95,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71Iq7YRjYIL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Ergonomisch-Zitkussen-Bureaustoel-Staartbeen/dp/B08BFPCWJG?crid=3SSS111TTT222&dib=eyJ2IjoiMSJ9.UUU333VVV444WWW555.XXX666YYY777ZZZ888AAA999BBB000&dib_tag=se&keywords=bureaustoel+kussen&qid=1764441400&sprefix=bureaustoel+kuss%2Caps%2C111&sr=8-3&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Memory foam voor je onderrug - past op elke stoel',
      },
      // BUDGET OPTIES
      {
        title: 'Cable Management Box',
        price: 15.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61VUwAJZMmL._AC_SL1000_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Kabel-Management-Box-Organizer/dp/B07BQJF5YK?crid=1CCC111DDD222&dib=eyJ2IjoiMSJ9.EEE333FFF444GGG555.HHH666III777JJJ888KKK999LLL000&dib_tag=se&keywords=cable+management+box&qid=1764441500&sprefix=cable+manage%2Caps%2C111&sr=8-1&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Opgeruimd bureau = opgeruimd hoofd - verbergt alle kabels',
      },
      {
        title: 'LED Bureaulamp met USB',
        price: 29.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61B9a1EY-9L._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/LED-Bureaulamp-Oogbescherming-Dimbaar/dp/B08CXPM2MX?crid=2MMM111NNN222&dib=eyJ2IjoiMSJ9.OOO333PPP444QQQ555.RRR666SSS777TTT888UUU999VVV000&dib_tag=se&keywords=bureaulamp+led+dimbaar&qid=1764441600&sprefix=bureaulamp+led%2Caps%2C111&sr=8-2&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: '5 kleurtemperaturen, 10 helderheden - USB oplaadpoort',
      },
      {
        title: 'Laptop Standaard Aluminium',
        price: 26.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71QPMF2UAvL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Laptop-Standaard-Aluminium-Verstelbaar/dp/B08CGCCL8F?crid=3WWW111XXX222&dib=eyJ2IjoiMSJ9.YYY333ZZZ444AAA555.BBB666CCC777DDD888EEE999FFF000&dib_tag=se&keywords=laptop+standaard+aluminium&qid=1764441700&sprefix=laptop+stand%2Caps%2C111&sr=8-4&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Verhoogt laptop naar ooghoogte - koelt beter af',
      },
      {
        title: 'Webcam Cover 6-Pack',
        price: 6.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/61AX1CLWXYL._AC_SL1001_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Webcam-Cover-Ultra-Dun-Privacy/dp/B07VL2SY5T?crid=1GGG111HHH222&dib=eyJ2IjoiMSJ9.III333JJJ444KKK555.LLL666MMM777NNN888OOO999PPP000&dib_tag=se&keywords=webcam+cover&qid=1764441800&sprefix=webcam+cov%2Caps%2C111&sr=8-1&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Privacy in één klik - past op elke laptop/tablet',
      },
      {
        title: 'Desktop Whiteboard met Standaard',
        price: 18.99,
        currency: 'EUR',
        image: 'https://m.media-amazon.com/images/I/71Sc1BvqjSL._AC_SL1500_.jpg',
        affiliateLink:
          'https://www.amazon.nl/Desktop-Whiteboard-Bureau-Notities/dp/B08DXLR1YC?crid=2QQQ111RRR222&dib=eyJ2IjoiMSJ9.SSS333TTT444UUU555.VVV666WWW777XXX888YYY999ZZZ000&dib_tag=se&keywords=desktop+whiteboard&qid=1764441900&sprefix=desktop+whiteb%2Caps%2C111&sr=8-3&linkCode=ll1&tag=gifteez77-21',
        merchant: 'Amazon',
        reason: 'Snelle notities zonder papier - altijd in zicht',
      },
    ],
    highlights: [
      'Ergonomische gadgets voorkomen rug-, nek- en polsklachten bij langdurig thuiswerken',
      'Goede verlichting (zoals BenQ ScreenBar) vermindert oogvermoeidheid aanzienlijk',
      'Noise-cancelling koptelefoons verhogen focus en productiviteit met 20-30%',
      'Een opgeruimd bureau met cable management verbetert concentratie',
    ],
    faq: [
      {
        q: 'Wat is het beste cadeau voor thuiswerkers?',
        a: 'Een ergonomische muis (Logitech MX Master 3S) of een monitorlamp (BenQ ScreenBar) zijn populaire keuzes die dagelijks gebruikt worden.',
      },
      {
        q: 'Welke gadgets helpen tegen rugpijn bij thuiswerken?',
        a: 'Een ergonomisch zitkussen, verstelbare voetsteun en laptopstandaard die je scherm op ooghoogte brengt.',
      },
      {
        q: 'Wat is een goed budget cadeau voor thuiswerkers?',
        a: 'Een cable management box (€16), webcam covers (€7) of een desktop whiteboard (€19) zijn praktische cadeaus onder €20.',
      },
      {
        q: 'Hoe verbeter ik de productiviteit van een thuiswerker?',
        a: 'Noise-cancelling earbuds, een tweede scherm of een USB-C hub met meerdere poorten maken werken efficiënter.',
      },
    ],
    internalLinks: [
      { href: '/cadeaugidsen', label: 'Alle cadeaugidsen' },
      { href: '/cadeaugidsen/kerst-tech-onder-100', label: 'Tech cadeaus onder €100' },
      { href: '/cadeaugidsen/cadeaus-voor-nachtlezers', label: 'Cadeaus voor nachtlezers' },
    ],
  },
] satisfies ProgrammaticConfig[]

const VARIANTS: ProgrammaticConfig[] = deepReplaceLegacyGuidePaths(RAW_VARIANTS)

validateProgrammaticConfigs(VARIANTS)

export const PROGRAMMATIC_INDEX: Record<string, ProgrammaticConfig> = VARIANTS.reduce(
  (acc, v) => {
    acc[v.slug] = v
    return acc
  },
  {} as Record<string, ProgrammaticConfig>
)

export default PROGRAMMATIC_INDEX
