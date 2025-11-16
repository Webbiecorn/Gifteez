/**
 * ProgrammaticLandingPage - Updated for Classifier System
 * Loads product data from pre-generated JSON files
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  PROGRAMMATIC_INDEX,
  type ProgrammaticAudience,
  type ProgrammaticConfig,
  type QuickScanPersona,
  type QuickScanPersonaAction,
} from '../data/programmatic'
import { buildGuidePath, GUIDE_BASE_PATH, normalizeGuidePath } from '../guidePaths'
import { withAffiliate } from '../services/affiliate'
import AnalyticsEvents from '../services/analyticsEventService'
import { PerformanceInsightsService } from '../services/performanceInsightsService'
import JsonLd from './JsonLd'
import Container from './layout/Container'
import type { NavigateTo } from '../types'
import type { ProgrammaticIndex, ClassifiedProduct } from '../utils/product-classifier'

interface Props {
  variantSlug: string
  navigateTo: NavigateTo
}

const FALLBACK_ORIGIN = 'https://gifteez.nl'

type InfoBadge = {
  label: string
  value: string
}

type EditorPick = {
  product: ClassifiedProduct
  reason?: string
}

type SortOption = 'featured' | 'price-asc' | 'price-desc'

type QuickScanFiltersAction = Extract<QuickScanPersonaAction, { type: 'filters' }>
type QuickScanLinkAction = Extract<QuickScanPersonaAction, { type: 'link' }>

const SORT_OPTION_LABELS: Record<SortOption, string> = {
  featured: '✨ Uitgelicht',
  'price-asc': '⬇️ Laagste prijs',
  'price-desc': '⬆️ Hoogste prijs',
}

const getQuickScanActionBadges = (action?: QuickScanPersonaAction): string[] => {
  if (!action) return []

  if (action.type === 'filters') {
    const filtersAction = action as QuickScanFiltersAction
    const badges: string[] = ['Preset filters']

    if (filtersAction.fastDeliveryOnly) {
      badges.push('⚡ Snelle levering')
    }

    if (filtersAction.sortOption) {
      badges.push(SORT_OPTION_LABELS[filtersAction.sortOption])
    }

    return badges
  }

  return ['Spring naar gids']
}

const cloneQuickScanPersona = (persona: QuickScanPersona): QuickScanPersona => ({
  ...persona,
  badges: persona.badges ? [...persona.badges] : undefined,
  topSuggestions: persona.topSuggestions ? [...persona.topSuggestions] : undefined,
  action: persona.action ? { ...persona.action } : undefined,
})

const QUICK_SCAN_RECIPIENT_PRESETS: Record<string, QuickScanPersona[]> = {
  hem: [
    {
      id: 'quickscan-hem-gadget',
      label: 'Gadget & grill',
      summary: 'Compacte tech, bbq-tools en speelse upgrades die hij meteen test.',
      budgetLabel: '€25-€60',
      badges: ['Tech', 'BBQ'],
      topSuggestions: ['Smart tools & speakers', 'BBQ, bier en outdoor gadgets'],
      action: {
        type: 'filters',
        label: 'Alleen snelle gadgets',
        fastDeliveryOnly: true,
        sortOption: 'featured',
      },
    },
    {
      id: 'quickscan-hem-everyday',
      label: 'Everyday carry',
      summary: 'Slanke wallets, grooming sets en minimalistische basics.',
      budgetLabel: '€20-€50',
      badges: ['Stijlvol', 'Praktisch'],
      topSuggestions: ['Vegan wallets & belts', 'Grooming & selfcare kits'],
      action: { type: 'filters', label: 'Toon premium opties', sortOption: 'price-desc' },
    },
  ],
  haar: [
    {
      id: 'quickscan-haar-selfcare',
      label: 'Selfcare & cosy',
      summary: 'Spa-boxen, geursets en zachte accessoires voor haar me-time.',
      budgetLabel: '€30-€80',
      badges: ['Wellness', 'Cosy'],
      topSuggestions: ['Rituals & spa-boxen', 'Verwarmde plaids & diffusers'],
      action: { type: 'filters', label: 'Laat cosy tips zien', sortOption: 'featured' },
    },
    {
      id: 'quickscan-haar-design',
      label: 'Statement & design',
      summary: 'Duurzame sieraden en slimme lifestyle gadgets die opvallen.',
      budgetLabel: '€40-€100',
      badges: ['Fashion', 'Design'],
      topSuggestions: ['Duurzame sieraden', 'Smart beauty & lifestyle'],
      action: { type: 'filters', label: 'Sorteer op prijs (hoog)', sortOption: 'price-desc' },
    },
  ],
  kids: [
    {
      id: 'quickscan-kids-stem',
      label: 'STEM & bouwen',
      summary: 'Educatieve bouwsets, robotica en leerzame games.',
      budgetLabel: '€15-€35',
      badges: ['STEM', 'Leerzaam'],
      topSuggestions: ['Robot kits & bouwsets', 'Interactie spelletjes'],
      action: { type: 'filters', label: 'Alleen snelle levering', fastDeliveryOnly: true },
    },
    {
      id: 'quickscan-kids-creative',
      label: 'Creatief & cosy',
      summary: 'Knutselboxen, verhalenlampen en gezellige decoratie.',
      budgetLabel: '€10-€30',
      badges: ['Creatief', 'Cosy'],
      topSuggestions: ['DIY knutselsets', 'Gezellige verlichting & dekens'],
      action: { type: 'filters', label: 'Sorteer op prijs (laag)', sortOption: 'price-asc' },
    },
  ],
  collegas: [
    {
      id: 'quickscan-collega-desk',
      label: 'Desk hero',
      summary: 'Bureau-upgrades, premium stationery en focus tools voor collega’s.',
      budgetLabel: '€15-€35',
      badges: ['Office', 'Praktisch'],
      topSuggestions: ['Premium notebooks & pennen', 'Micro-break koffie & thee'],
      action: { type: 'filters', label: 'Alleen snelle levering', fastDeliveryOnly: true },
    },
    {
      id: 'quickscan-collega-remote',
      label: 'Remote & team',
      summary: 'Hybride werktools en kleine treats om te delen met het team.',
      budgetLabel: '€15-€40',
      badges: ['Team', 'Remote'],
      topSuggestions: ['Webcam/mic upgrades', 'Snackbox of giftcard'],
      action: {
        type: 'link',
        label: 'Bekijk duurzame optie',
        href: '/cadeaugidsen/kerst-duurzaam-onder-50',
      },
    },
  ],
}

const QUICK_SCAN_INTEREST_PRESETS: Record<string, QuickScanPersona[]> = {
  tech: [
    {
      id: 'quickscan-tech-home',
      label: 'Smart home starter',
      summary: 'Speakers, slimme verlichting en hubs voor direct gemak.',
      budgetLabel: '€40-€100',
      badges: ['Smart home', 'Productiviteit'],
      topSuggestions: ['Smart speakers', 'RGB bureauverlichting'],
      action: { type: 'filters', label: 'Alleen snelle tech', fastDeliveryOnly: true },
    },
  ],
  duurzaam: [
    {
      id: 'quickscan-sustainable-green',
      label: 'Groene minimalist',
      summary: 'Vegan verzorging, plasticvrije essentials en slow fashion.',
      budgetLabel: '€20-€60',
      badges: ['Vegan', 'Zero waste'],
      topSuggestions: ['Plasticvrije badkamerkits', 'Gerecyclede accessoires'],
      action: { type: 'filters', label: 'Toon eco selectie', sortOption: 'featured' },
    },
  ],
  gamer: [
    {
      id: 'quickscan-gamer-setup',
      label: 'Setup tweaker',
      summary: 'Controllers, headsets en RGB-upgrades voor de gamer.',
      budgetLabel: '€30-€90',
      badges: ['Gaming', 'RGB'],
      topSuggestions: ['Headsets & controllers', 'RGB accessoires & laptopstands'],
      action: { type: 'filters', label: 'Sorteer op prijs (hoog)', sortOption: 'price-desc' },
    },
  ],
}

const QUICK_SCAN_AUDIENCE_PRESETS: Record<ProgrammaticAudience, QuickScanPersona> = {
  men: {
    id: 'quickscan-audience-men',
    label: 'Praktisch & tech',
    summary: 'Slimme tools, audio en outdoor basics voor mannen.',
    budgetLabel: '€25-€75',
    badges: ['Tech', 'Outdoor'],
    topSuggestions: ['Smart speakers', 'BBQ & outdoor gear'],
    action: { type: 'filters', label: 'Alleen snelle gadgets', fastDeliveryOnly: true },
  },
  women: {
    id: 'quickscan-audience-women',
    label: 'Selfcare & stijl',
    summary: 'Wellness, sieraden en cosy essentials voor haar.',
    budgetLabel: '€30-€80',
    badges: ['Wellness', 'Fashion'],
    topSuggestions: ['Spa sets', 'Duurzame sieraden'],
    action: { type: 'filters', label: 'Laat cosy tips zien', sortOption: 'featured' },
  },
  gamers: {
    id: 'quickscan-audience-gamers',
    label: 'Pro-setup',
    summary: 'Performance-upgrades en accessoires voor gamers.',
    budgetLabel: '€40-€120',
    badges: ['Gaming', 'Performance'],
    topSuggestions: ['Headsets', 'RGB & streaming gear'],
    action: { type: 'filters', label: 'Sorteer op prijs (hoog)', sortOption: 'price-desc' },
  },
  parents: {
    id: 'quickscan-audience-parents',
    label: 'Gezinsplanner',
    summary: 'Smart home helpers en multi-use cadeaus voor drukke ouders.',
    budgetLabel: '€35-€90',
    badges: ['Smart home', 'Organisatie'],
    topSuggestions: ['Slimme speakers', 'Organizers & planners'],
    action: { type: 'filters', label: 'Alleen snelle levering', fastDeliveryOnly: true },
  },
  kids: {
    id: 'quickscan-audience-kids',
    label: 'Speels & educatief',
    summary: 'STEM kits en creatieve cadeaus voor kinderen.',
    budgetLabel: '€15-€40',
    badges: ['STEM', 'Creatief'],
    topSuggestions: ['Bouwsets', 'Knutselboxen'],
    action: { type: 'filters', label: 'Sorteer op prijs (laag)', sortOption: 'price-asc' },
  },
  sustainable: {
    id: 'quickscan-audience-sustainable',
    label: 'Groen & bewust',
    summary: 'Vegan, fair en zero-waste cadeaus voor bewuste kopers.',
    budgetLabel: '€20-€60',
    badges: ['Vegan', 'Zero waste'],
    topSuggestions: ['Plasticvrije badkamerkits', 'Duurzame fashion'],
    action: { type: 'filters', label: 'Toon eco selectie', sortOption: 'featured' },
  },
}

const QUICK_SCAN_OCCASION_PRESETS: Record<string, QuickScanPersona[]> = {
  kerst: [
    {
      id: 'quickscan-occasion-kerst-fast',
      label: 'Last-minute kerst',
      summary: 'Alleen partners die vandaag of morgen leveren, ideaal voor late beslissers.',
      badges: ['⚡ Vandaag/morgen'],
      topSuggestions: ['Coolblue & Bol selectie'],
      action: { type: 'filters', label: 'Alleen snelle levering', fastDeliveryOnly: true },
    },
  ],
  sinterklaas: [
    {
      id: 'quickscan-occasion-sint',
      label: 'Surprise & lootjes',
      summary: 'Compacte cadeaus onder €25 voor surprises en schoolvieringen.',
      badges: ['Budget', 'Speels'],
      topSuggestions: ['Lootje-proof gadgets', 'Creatieve DIY sets'],
      action: { type: 'filters', label: 'Sorteer op prijs (laag)', sortOption: 'price-asc' },
    },
  ],
}

const DEFAULT_QUICK_SCAN_PERSONAS: QuickScanPersona[] = [
  {
    id: 'quickscan-default-fast',
    label: 'Last-minute redder',
    summary: 'Focus op snelle verzending (≤ 2 dagen) zodat je cadeau op tijd binnen is.',
    badges: ['⚡ Snelle levering'],
    topSuggestions: ['Coolblue', 'Bol', 'Amazon Prime'],
    action: { type: 'filters', label: 'Alleen snelle opties', fastDeliveryOnly: true },
  },
  {
    id: 'quickscan-default-budget',
    label: 'Budgetzeker',
    summary: 'Zie meteen de laagste prijzen en bespaar zonder in te leveren op kwaliteit.',
    badges: ['Budget', 'Slim'],
    action: { type: 'filters', label: 'Sorteer op laagste prijs', sortOption: 'price-asc' },
  },
]

const deriveQuickScanPersonas = (config?: ProgrammaticConfig): QuickScanPersona[] => {
  if (!config) return []
  if (config.quickScan?.personas?.length) {
    return config.quickScan.personas.map(cloneQuickScanPersona)
  }

  const personas: QuickScanPersona[] = []
  const seen = new Set<string>()
  const pushPersona = (entry?: QuickScanPersona | QuickScanPersona[]) => {
    if (!entry) return
    const list = Array.isArray(entry) ? entry : [entry]
    list.forEach((persona) => {
      if (!seen.has(persona.id)) {
        personas.push(cloneQuickScanPersona(persona))
        seen.add(persona.id)
      }
    })
  }

  if (config.recipient && QUICK_SCAN_RECIPIENT_PRESETS[config.recipient]) {
    pushPersona(QUICK_SCAN_RECIPIENT_PRESETS[config.recipient])
  }

  if (config.interest && QUICK_SCAN_INTEREST_PRESETS[config.interest]) {
    pushPersona(QUICK_SCAN_INTEREST_PRESETS[config.interest])
  }

  if ((!config.recipient || personas.length < 2) && config.audience) {
    config.audience.forEach((audience) => {
      pushPersona(QUICK_SCAN_AUDIENCE_PRESETS[audience])
    })
  }

  if (config.occasion && QUICK_SCAN_OCCASION_PRESETS[config.occasion]) {
    pushPersona(QUICK_SCAN_OCCASION_PRESETS[config.occasion])
  }

  if (personas.length === 0) {
    pushPersona(DEFAULT_QUICK_SCAN_PERSONAS)
  }

  return personas.slice(0, 4)
}

const normalizeFeedSource = (value?: string | null) => {
  if (!value) return null
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
}

const buildProgrammaticSourceDescriptor = (
  slug: string,
  context: 'grid' | 'editor',
  product: ClassifiedProduct
) => {
  const feed =
    normalizeFeedSource(product.source) ||
    normalizeFeedSource(product.merchant) ||
    normalizeFeedSource(product.id.split(':')[0]) ||
    'unknown'
  return `programmatic:${slug}:${context}:${feed}`
}

const toTitleCase = (value: string) =>
  value
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const formatBadgeValue = (value?: string | null) => {
  if (!value) return ''
  if (value.includes('&')) return value
  return toTitleCase(value)
}

const formatRecipientLabel = (recipient?: string | null) => {
  if (!recipient) return ''
  const normalized = recipient.toLowerCase()
  if (normalized === 'kids' || normalized === 'kinderen') return 'Kinderen'
  if (normalized === 'men' || normalized === 'hem') return 'Voor hem'
  if (normalized === 'women' || normalized === 'haar') return 'Voor haar'
  if (normalized === 'collegas' || normalized === 'collega' || normalized === 'collega’s')
    return 'Collega’s'
  return formatBadgeValue(recipient)
}

const ProgrammaticLandingPage: React.FC<Props> = ({ variantSlug, navigateTo }) => {
  const config: ProgrammaticConfig | undefined = PROGRAMMATIC_INDEX[variantSlug]
  const [index, setIndex] = useState<ProgrammaticIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('featured')
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState(false)
  const trackedImpressions = useRef<Set<string>>(new Set())
  const trackedEditorImpressions = useRef<Set<string>>(new Set())
  const analyticsListName = useMemo(() => `programmatic:${variantSlug}`, [variantSlug])
  const scrollToGrid = useCallback(() => {
    const grid = document.getElementById('cadeau-grid')
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    setSortOption('featured')
    setFastDeliveryOnly(false)
    trackedImpressions.current.clear()
    trackedEditorImpressions.current.clear()

    // Try to load pre-generated JSON
    fetch(`/programmatic/${variantSlug}.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Guide not available yet`)
        }
        return response.json()
      })
      .then((data: ProgrammaticIndex) => {
        setIndex(data)
        setLoading(false)
      })
      .catch((err) => {
        console.warn('Pre-generated guide not found, using config:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [variantSlug])

  const pageTitle = config?.title ?? index?.metadata.title ?? 'Cadeau ideeën'
  const pageIntro = config?.intro ?? index?.metadata.description ?? ''
  const totalProductCount = index?.metadata?.totalProducts ?? index?.products?.length ?? 0

  const infoBadges = useMemo<InfoBadge[]>(() => {
    const badges: InfoBadge[] = []
    if (config?.occasion) {
      badges.push({ label: 'Gelegenheid', value: formatBadgeValue(config.occasion) })
    }
    if (config?.recipient) {
      badges.push({ label: 'Voor wie', value: formatRecipientLabel(config.recipient) })
    }
    if (config?.budgetMax) {
      badges.push({ label: 'Budget', value: `Onder €${config.budgetMax}` })
    }
    if (config?.retailer) {
      badges.push({ label: 'Retailer', value: formatBadgeValue(config.retailer) })
    }
    if (config?.interest) {
      badges.push({ label: 'Interesse', value: formatBadgeValue(config.interest) })
    }
    if (config?.filters?.fastDelivery) {
      badges.push({ label: 'Levering', value: '⚡ Vandaag of morgen' })
    }
    if (config?.filters?.eco) {
      badges.push({ label: 'Duurzaam', value: 'Groene selectie' })
    }
    return badges
  }, [config])

  const personaQuickScan = useMemo(() => {
    const personas = deriveQuickScanPersonas(config)
    return personas.map((persona) => {
      if (persona.action?.type === 'link' && persona.action.href.startsWith('/')) {
        return {
          ...persona,
          action: {
            ...persona.action,
            href: normalizeGuidePath(persona.action.href),
          },
        }
      }
      return persona
    })
  }, [config])

  const quickScanTitle = config?.quickScan?.title ?? 'Quick scan: voor wie shop je?'
  const quickScanSubtitle =
    config?.quickScan?.subtitle ??
    'Kies het profiel dat het beste past en wij zetten filters en volgorde voor je klaar.'

  const schemaData = useMemo(() => {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : FALLBACK_ORIGIN
    const currentUrl =
      typeof window !== 'undefined' && window.location?.href
        ? window.location.href
        : `${origin}${buildGuidePath(variantSlug)}`

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Cadeaugidsen',
          item: `${origin}${GUIDE_BASE_PATH}`,
        },
        { '@type': 'ListItem', position: 3, name: pageTitle, item: currentUrl },
      ],
    }

    const itemList = index?.products?.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: pageTitle,
          itemListElement: index.products.slice(0, 12).map((product, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            item: {
              '@type': 'Product',
              name: product.title,
              description: product.description,
              image: product.images?.[0],
              brand: product.brand,
              offers: {
                '@type': 'Offer',
                priceCurrency: product.currency || 'EUR',
                price: product.price,
                availability: product.inStock
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
                url: withAffiliate(product.url, {
                  retailer: product.merchant?.toLowerCase() || product.source,
                  pageType: 'programmatic-guide',
                  placement: 'schema-item-list',
                  theme: variantSlug,
                  cardIndex: idx + 1,
                }),
              },
            },
          })),
        }
      : null

    const faq = config?.faq?.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: config.faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
        }
      : null

    return { breadcrumb, itemList, faq }
  }, [config?.faq, index, pageTitle, variantSlug])

  const editorPickProducts = useMemo<EditorPick[]>(() => {
    if (!index) return []
    if (index.featured?.length) {
      return index.featured.map((product) => ({ product, reason: 'Redactie favoriet' }))
    }
    if (!config?.editorPicks?.length) return []
    return config.editorPicks
      .map<EditorPick | null>((pick) => {
        const match =
          index.products.find((product) => product.id === pick.sku || product.sku === pick.sku) ||
          null
        if (!match) return null
        return { product: match, reason: pick.reason }
      })
      .filter((item): item is EditorPick => Boolean(item))
  }, [config?.editorPicks, index])

  const lastUpdatedLabel = useMemo(() => {
    if (!index?.metadata.generatedAt) return null
    try {
      return new Date(index.metadata.generatedAt).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (err) {
      console.warn('Failed to format generatedAt', err)
      return null
    }
  }, [index?.metadata.generatedAt])

  const showSinterklaasNotice = Boolean(
    variantSlug.includes('sinterklaas') && index?.products.length && index.products.length < 6
  )

  const displayProducts = useMemo(() => {
    if (!index?.products) return []
    let products = [...index.products]
    if (fastDeliveryOnly) {
      products = products.filter(
        (product) => typeof product.deliveryDays === 'number' && product.deliveryDays <= 2
      )
    }
    if (sortOption === 'price-asc') {
      return [...products].sort((a, b) => a.price - b.price)
    }
    if (sortOption === 'price-desc') {
      return [...products].sort((a, b) => b.price - a.price)
    }
    return products
  }, [fastDeliveryOnly, index?.products, sortOption])

  const handleQuickScanFilters = useCallback(
    (persona: QuickScanPersona, action: QuickScanFiltersAction) => {
      if (typeof action.fastDeliveryOnly === 'boolean') {
        setFastDeliveryOnly(action.fastDeliveryOnly)
      }
      if (action.sortOption) {
        setSortOption(action.sortOption)
      }
      AnalyticsEvents.quickScanInteraction({
        slug: variantSlug,
        personaId: persona.id,
        personaLabel: persona.label,
        action: 'apply_filters',
        fastDelivery: action.fastDeliveryOnly ?? null,
        sortOption: action.sortOption ?? null,
        targetHref: null,
      })
      scrollToGrid()
    },
    [scrollToGrid, variantSlug]
  )

  const handleQuickScanLink = useCallback(
    (persona: QuickScanPersona, action: QuickScanLinkAction) => {
      AnalyticsEvents.quickScanInteraction({
        slug: variantSlug,
        personaId: persona.id,
        personaLabel: persona.label,
        action: 'open_link',
        fastDelivery: null,
        sortOption: null,
        targetHref: action.href,
      })
    },
    [variantSlug]
  )

  useEffect(() => {
    if (!displayProducts.length) return

    const unseenProducts = displayProducts.filter(
      (product) => !trackedImpressions.current.has(product.id)
    )

    if (unseenProducts.length === 0) return

    const impressionPayload = unseenProducts.map((product) => ({
      id: product.id,
      name: product.title,
      title: product.title,
      category: product.facets.category,
      price: product.price,
      retailer: product.merchant || product.source,
    }))

    AnalyticsEvents.productImpressions(impressionPayload, analyticsListName)

    unseenProducts.forEach((product) => {
      trackedImpressions.current.add(product.id)
      void PerformanceInsightsService.trackImpression(
        product.id,
        buildProgrammaticSourceDescriptor(variantSlug, 'grid', product)
      )
    })
  }, [analyticsListName, displayProducts, variantSlug])

  useEffect(() => {
    if (!editorPickProducts.length) return

    const unseen = editorPickProducts.filter(
      (pick) => !trackedEditorImpressions.current.has(pick.product.id)
    )

    if (unseen.length === 0) return

    const editorListName = `${analyticsListName}:editors`
    const payload = unseen.map(({ product }) => ({
      id: product.id,
      name: product.title,
      title: product.title,
      category: product.facets.category,
      price: product.price,
      retailer: product.merchant || product.source,
    }))

    AnalyticsEvents.productImpressions(payload, editorListName)

    unseen.forEach(({ product }) => {
      trackedEditorImpressions.current.add(product.id)
      void PerformanceInsightsService.trackImpression(
        product.id,
        buildProgrammaticSourceDescriptor(variantSlug, 'editor', product)
      )
    })
  }, [analyticsListName, editorPickProducts, variantSlug])

  if (loading) {
    return (
      <Container>
        <div className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Cadeaugids laden...</p>
          </div>
        </div>
      </Container>
    )
  }

  if (error && !index) {
    return (
      <Container>
        <div className="py-12">
          <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-2">Gids nog niet beschikbaar</h2>
            <p className="text-amber-700 mb-4">
              Deze cadeaugids wordt momenteel gevuld met producten. Kom later terug!
            </p>
            <button
              onClick={() => navigateTo('cadeausHub')}
              className="text-primary hover:underline font-semibold"
            >
              ← Bekijk andere gidsen
            </button>
          </div>
        </div>
      </Container>
    )
  }

  if (!index || !index.products || index.products.length === 0) {
    return (
      <Container>
        <div className="py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{pageTitle}</h1>
            <p className="text-gray-600 mb-6">{pageIntro}</p>
            <p className="text-amber-600">Geen producten beschikbaar voor deze gids.</p>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <JsonLd data={schemaData.breadcrumb} />
      {schemaData.itemList && <JsonLd data={schemaData.itemList} />}
      {schemaData.faq && <JsonLd data={schemaData.faq} />}

      <div className="py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-10 md:mb-14 rounded-3xl bg-gradient-to-br from-primary/5 via-white to-white p-6 md:p-10 border border-primary/10 shadow-sm">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
                Programmatic cadeaugids
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {pageTitle}
              </h1>
              <p className="text-lg md:text-xl text-gray-700 max-w-4xl">{pageIntro}</p>
            </div>

            {/* Stats Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                {totalProductCount} cadeau ideeën
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
                {index.stats?.uniqueBrands ?? '—'} merken
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-semibold">
                €{index.stats?.priceRange ? Math.round(index.stats.priceRange[0]) : '—'} - €
                {index.stats?.priceRange ? Math.round(index.stats.priceRange[1]) : '—'}
              </span>
            </div>

            {/* Context badges */}
            {infoBadges.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {infoBadges.map((badge) => (
                  <div
                    key={`${badge.label}-${badge.value}`}
                    className="bg-white/80 rounded-2xl border border-gray-100 px-4 py-3 shadow-sm"
                  >
                    <p className="text-xs uppercase text-gray-500 tracking-wide">{badge.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{badge.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Highlights */}
            {config?.highlights && config.highlights.length > 0 && (
              <ul className="space-y-2">
                {config.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {highlight}
                  </li>
                ))}
              </ul>
            )}

            {showSinterklaasNotice && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 text-amber-900 text-sm font-medium border border-amber-100">
                🎁 Deze Sinterklaas selectie wordt nog aangevuld. Laat ons weten wat je mist!
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <a
                href="#cadeau-grid"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition"
              >
                Bekijk {totalProductCount} cadeau ideeën
              </a>
              <button
                type="button"
                onClick={() => navigateTo('cadeausHub')}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold bg-white hover:bg-gray-50"
              >
                Andere gidsen
              </button>
            </div>

            {lastUpdatedLabel && (
              <p className="text-sm text-gray-500">Laatste update: {lastUpdatedLabel}</p>
            )}
          </div>
        </div>

        {personaQuickScan.length > 0 && (
          <section className="mb-12 rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary">
                    🤖 Cadeaucoach
                  </span>
                  Quick scan presets
                </div>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">{quickScanTitle}</h2>
                <p className="text-sm text-gray-600 max-w-2xl">
                  {quickScanSubtitle ||
                    'Kies een scenario en laat Cadeaucoach (AI) snel filters toepassen of spring naar de juiste gids.'}
                </p>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-white/70 p-4 shadow-sm">
                <p className="text-sm text-gray-700">
                  Wil je liever persoonlijk advies? Cadeaucoach (AI) vraagt 3 dingen en geeft direct
                  5 suggesties.
                </p>
                <button
                  type="button"
                  onClick={() => navigateTo('giftFinder')}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5"
                >
                  Open Cadeaucoach
                </button>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {personaQuickScan.map((persona) => {
                const actionBadges = getQuickScanActionBadges(persona.action)
                return (
                  <article
                    key={persona.id}
                    className="flex h-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white/70 p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.55)]"
                  >
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Persona
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{persona.label}</h3>
                      <p className="text-sm text-gray-600">{persona.summary}</p>
                    </div>

                    {persona.badges && persona.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {persona.badges.map((badge) => (
                          <span
                            key={`${persona.id}-${badge}`}
                            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}

                    {persona.topSuggestions && persona.topSuggestions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Focus van Cadeaucoach
                        </p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-600">
                          {persona.topSuggestions.map((tip, index) => (
                            <li key={`${persona.id}-tip-${index}`}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-auto rounded-2xl border border-gray-100 bg-white p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                          🤖 Cadeaucoach tip
                        </span>
                        {persona.budgetLabel && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                            {persona.budgetLabel}
                          </span>
                        )}
                      </div>
                      {actionBadges.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {actionBadges.map((badge) => (
                            <span
                              key={`${persona.id}-${badge}`}
                              className="inline-flex items-center rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4">
                        {persona.action?.type === 'filters' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickScanFilters(
                                persona,
                                persona.action as QuickScanFiltersAction
                              )
                            }
                            className="inline-flex w-full items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                          >
                            {persona.action.label || 'Pas filters toe'}
                          </button>
                        )}
                        {persona.action?.type === 'link' && (
                          <a
                            href={(persona.action as QuickScanLinkAction).href}
                            onClick={() =>
                              handleQuickScanLink(persona, persona.action as QuickScanLinkAction)
                            }
                            className="inline-flex w-full items-center justify-between rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-primary hover:text-primary"
                          >
                            {persona.action.label}
                            <span aria-hidden className="ml-2">
                              →
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {editorPickProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Favorieten van de redactie</h2>
                <p className="text-gray-600">
                  Handgeplukte tips voor dit thema. Perfect als je snel wilt kiezen.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <span
                  className="w-2 h-2 rounded-full bg-primary animate-pulse"
                  aria-hidden="true"
                />
                Verified door Gifteez
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {editorPickProducts.slice(0, 3).map((pick, idx) => (
                <ProductCard
                  key={`${pick.product.id}-editor`}
                  product={pick.product}
                  spotlightReason={pick.reason}
                  variantSlug={variantSlug}
                  position={idx + 1}
                  context="editor"
                />
              ))}
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section>
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Selectie in deze gids
              </p>
              <p className="text-sm text-gray-700">
                {displayProducts.length} van {index.products.length} producten zichtbaar
                {fastDeliveryOnly && ' • gefilterd op snelle levering'}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={fastDeliveryOnly}
                  onChange={(event) => setFastDeliveryOnly(event.target.checked)}
                />
                Alleen snelle levering (≤ 2 dagen)
              </label>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                Sorteer op
                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as SortOption)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm focus:border-primary focus:outline-none"
                >
                  <option value="featured">Uitgelicht</option>
                  <option value="price-asc">Laagste prijs eerst</option>
                  <option value="price-desc">Hoogste prijs eerst</option>
                </select>
              </div>
            </div>
          </div>

          {displayProducts.length === 0 ? (
            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-8 text-center">
              <p className="text-lg font-semibold text-amber-900 mb-2">
                Geen producten matchen deze filters
              </p>
              <p className="text-amber-800 mb-4">
                Probeer de filter voor snelle levering uit te zetten of kies een andere sortering.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFastDeliveryOnly(false)
                  setSortOption('featured')
                }}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary shadow"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div
              id="cadeau-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {displayProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variantSlug={variantSlug}
                  position={index + 1}
                  context="grid"
                />
              ))}
            </div>
          )}
        </section>

        {/* FAQs */}
        {config?.faq && config.faq.length > 0 && (
          <section className="mt-16 rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Nog vragen?
                </p>
                <h2 className="text-2xl font-bold text-gray-900">Veelgestelde vragen</h2>
                <p className="text-sm text-gray-600">
                  Snel antwoord op twijfels over levering, budget of retourbeleid. Cadeaucoach (AI)
                  gebruikt dezelfde informatie om je suggesties slimmer te maken.
                </p>
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                  <p className="text-sm font-semibold text-primary">Extra hulp nodig?</p>
                  <p className="text-sm text-primary/80">
                    Start Cadeaucoach en krijg binnen 30 seconden een shortlist met cadeaus.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo('giftFinder')}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 transition"
                  >
                    Cadeaucoach starten
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {config.faq.map((item, i) => (
                  <details
                    key={i}
                    className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between text-left font-semibold text-gray-900">
                      <span>{item.q}</span>
                      <span
                        aria-hidden
                        className="ml-4 text-primary transition duration-200 group-open:rotate-180"
                      >
                        ⌃
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-gray-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {config?.internalLinks && config.internalLinks.length > 0 && (
          <section className="mt-16">
            <div className="rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm">
              <div className="flex flex-col gap-3 mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Verder browsen
                </p>
                <h2 className="text-2xl font-bold text-gray-900">Andere gidsen bij dit thema</h2>
                <p className="text-sm text-gray-600">
                  Verken aanvullende cadeaulijsten voor ontvangers met vergelijkbaar budget of
                  gelegenheid.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {config.internalLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-primary/40 hover:bg-white hover:text-primary"
                  >
                    {link.label}
                    <span aria-hidden className="transition group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </Container>
  )
}

// ==================== Product Card ====================

interface ProductCardProps {
  product: ClassifiedProduct
  spotlightReason?: string
  variantSlug: string
  position: number
  context: 'editor' | 'grid'
}

/**
 * Format merchant name for display
 * "Coolblue NL" → "Coolblue"
 * "Shop Like You Give A Damn - NL & BE" → "Shop Like You Give A Damn"
 */
function formatMerchantName(merchant?: string): string {
  if (!merchant) return 'onze partner'

  // Remove country suffixes and regional indicators
  return merchant
    .replace(/\s*-\s*(NL|BE|NL\s*&\s*BE)$/i, '')
    .replace(/\s+NL$/i, '')
    .replace(/\s+BE$/i, '')
    .trim()
}

function ProductCard({
  product,
  spotlightReason,
  variantSlug,
  position,
  context,
}: ProductCardProps) {
  const originalPrice = typeof product.originalPrice === 'number' ? product.originalPrice : null
  const hasDiscount = originalPrice !== null && originalPrice > product.price
  const discountPercentage =
    hasDiscount && originalPrice !== null
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0
  const primaryImage = product.images?.[0]
  const performanceSource = buildProgrammaticSourceDescriptor(variantSlug, context, product)

  // Add affiliate tracking to product URL
  const affiliateUrl = withAffiliate(product.url, {
    retailer: product.merchant?.toLowerCase() || product.source,
    pageType: 'programmatic-guide',
    placement: context === 'editor' ? 'editor-pick-card' : 'product-card',
    theme: variantSlug,
    cardIndex: position,
  })

  const handleAffiliateClick = () => {
    const analyticsProduct = {
      id: product.id,
      name: product.title,
      title: product.title,
      category: product.facets.category,
      price: product.price,
      retailer: product.merchant || product.source,
      affiliateUrl,
    }

    AnalyticsEvents.clickAffiliate(
      analyticsProduct,
      'programmatic-guide',
      context === 'editor' ? 'editor-pick' : 'grid',
      position
    )

    void PerformanceInsightsService.trackClick(product.id, performanceSource)
  }

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleAffiliateClick}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {spotlightReason && (
          <div className="absolute top-3 left-3 bg-white/90 text-primary px-3 py-1 rounded-full text-xs font-semibold shadow">
            {spotlightReason}
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            -{discountPercentage}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1 font-semibold">
            {product.brand}
          </p>
        )}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem]">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-gray-900">€{product.price.toFixed(2)}</span>
          {hasDiscount && originalPrice !== null && (
            <span className="text-sm text-gray-400 line-through">€{originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {product.facets.category && (
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
              {product.facets.category}
            </span>
          )}
          {product.deliveryDays && product.deliveryDays <= 2 && (
            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
              ⚡ Snel
            </span>
          )}
          {product.facets.interests?.includes('duurzaam') && (
            <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">
              🌱 Duurzaam
            </span>
          )}
        </div>

        {/* Source */}
        <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
          Via {formatMerchantName(product.merchant)}
        </div>
      </div>
    </a>
  )
}

export default ProgrammaticLandingPage
