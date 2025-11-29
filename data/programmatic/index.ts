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
      keywords: [
        'read',
        'reading',
        'bed lamp',
        'book light',
        'nachtlezer',
        'leeslampje',
        'warm light',
        'amber light',
        'cozy',
        'leeslamp',
        'boekenlegger',
        'boek',
        'lamp',
        'led',
      ],
      maxPrice: 80,
    },
    editorPicks: [
      { sku: 'B0B74X6669', reason: 'Compacte klemclip voor €10,79 - budgetvriendelijk en stil' },
      { sku: 'B08GG42WXY', reason: 'Flexibele zwanenhals met oogbescherming voor €11,95' },
      {
        sku: 'B0CD8NC67S',
        reason: 'Barnsteenkleurig licht met USB-C opladen - perfect voor slaap',
      },
      { sku: 'B0CGM5TLZX', reason: 'Nekketting met ergonomisch ontwerp - handsfree lezen' },
      { sku: 'B0C6XT1JFF', reason: 'Premium hals-leeslamp met 80 uur batterij en amberkleur' },
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
