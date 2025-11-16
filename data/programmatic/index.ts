import { deepReplaceLegacyGuidePaths } from '../../guidePaths'

export type ProgrammaticAudience = 'men' | 'women' | 'gamers' | 'parents' | 'kids' | 'sustainable'

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
      ],
    },
  },
  {
    slug: 'dames-mode-onder-150',
    title: 'Dames Mode Cadeaus onder €150',
    intro: 'Fashion cadeaus voor vrouwen - kleding, accessoires en schoenen.',
    highlights: ['Trendy fashion items', 'Diverse stijlen en maten', 'Snelle levering'],
    audience: ['women'] as ProgrammaticAudience[],
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
    audience: ['women', 'men', 'sustainable'] as ProgrammaticAudience[],
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
    audience: ['women'] as ProgrammaticAudience[],
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
    audience: [] as ProgrammaticAudience[], // Geen audience filter - laat unisex producten door
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
    occasion: 'kerst',
    interest: 'tech',
    budgetMax: 100,
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
      keywords: [],
      boostKeywords: ['smart', 'gadget', 'tech', 'anker', 'jbl', 'logitech', 'google'],
      excludeKeywords: ['jurk', 'sieraad', 'beauty', 'keuken', 'pannenset'],
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
      excludeKeywords: ['parfum', 'sieraad', 'lipstick', 'jurk', 'oorbel'],
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
      excludeKeywords: ['pre-order', 'backorder', 'levertijd 3', 'custom made'],
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
    editorPicks: [
      { sku: '38840436662', reason: 'PSN-tegoed voor digitale verrassingen' },
      { sku: '40955671541', reason: 'Joy-Con polsbandjes voor familieswitches' },
      { sku: 'partypro-39148061237-23', reason: 'DIY ballonnenboog van PartyPro' },
      { sku: 'partypro-39148061137-3', reason: 'Tropical Jungle feestset voor kids' },
    ],
    filters: {
      maxPrice: 25,
      maxResults: 24,
      keywords: [
        'speel',
        'sinter',
        'pakjesavond',
        'knutsel',
        'knutselset',
        'puzzel',
        'puzzels',
        'kleurboek',
        'kleurplaat',
        'doeboek',
        'boekje',
        'kind',
        'kids',
        'lego',
        'duplo',
        'playmobil',
        'bordspel',
        'spel ',
        'spelletjes',
        'knuffel',
        'nintendo',
        'joy-con',
        'mario',
        'pokemon',
        'roblox',
        'minecraft',
        'fortnite',
        'ps4',
        'ps5',
        'playstation',
        'xbox',
        'cadeaubon',
        'cadeaukaart',
        'muismat',
        'ballon',
        'ballonnen',
        'versiering',
        'feest',
        'feestje',
        'party',
        'traktatie',
        'slinger',
        'goodie bag',
        'giftbox',
        'surprise',
        'snoep',
        'stickers',
        'knutselpakket',
        'craft kit',
        'kleurset',
      ],
      boostKeywords: [
        'lego',
        'playmobil',
        'spel',
        'speel',
        'speelgoed',
        'knutsel',
        'puzzel',
        'boek',
      ],
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
        'lamp',
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
      ],
      maxPerBrand: 3,
      maxPerCategory: 24,
      preferredMerchants: ['bol', 'bol.com', 'amazon', 'intertoys', 'coolblue', 'partypro'],
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
      ],
    },
    internalLinks: [
      { href: '/cadeaugidsen/kerst/voor-haar/onder-50', label: 'Cadeaus voor haar onder €50' },
      { href: '/cadeaugidsen/dames-mode-onder-150', label: 'Dames mode cadeaus' },
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
