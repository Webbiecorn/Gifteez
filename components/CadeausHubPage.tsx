import React, { useMemo, useState, useEffect } from 'react'
import { PROGRAMMATIC_INDEX } from '../data/programmatic'
import { buildGuidePath, GUIDE_BASE_PATH } from '../guidePaths'
import GuideCard from './GuideCard'
import JsonLd from './JsonLd'
import Container from './layout/Container'
import type { ProgrammaticConfig } from '../data/programmatic'
import type { NavigateTo } from '../types'

/* ─────────────────────────────────────────────────────────────
   FILTER DEFINITIONS
   ───────────────────────────────────────────────────────────── */

type CategoryTab = {
  id: string
  label: string
  emoji: string
  description: string
  predicate: (config: ProgrammaticConfig) => boolean
}

const CATEGORY_TABS: CategoryTab[] = [
  {
    id: 'all',
    label: 'Alle Gidsen',
    emoji: '✨',
    description: 'Bekijk alle cadeaugidsen',
    predicate: () => true,
  },
  {
    id: 'sinterklaas',
    label: 'Sinterklaas',
    emoji: '🎁',
    description: 'Pakjesavond cadeaus',
    predicate: (config) => config.occasion === 'sinterklaas' || config.slug.includes('sinterklaas'),
  },
  {
    id: 'kerst',
    label: 'Kerst',
    emoji: '🎄',
    description: 'Kerstcadeaus',
    predicate: (config) => config.occasion === 'kerst' || config.slug.includes('kerst'),
  },
  {
    id: 'haar',
    label: 'Voor Haar',
    emoji: '🌸',
    description: 'Beauty, wellness & lifestyle',
    predicate: (config) => config.recipient === 'haar',
  },
  {
    id: 'hem',
    label: 'Voor Hem',
    emoji: '🕺',
    description: 'Tech, gadgets & meer',
    predicate: (config) => config.recipient === 'hem',
  },
  {
    id: 'kids',
    label: 'Kids',
    emoji: '🧸',
    description: 'Speelgoed & educatief',
    predicate: (config) => config.recipient === 'kids',
  },
  {
    id: 'duurzaam',
    label: 'Duurzaam',
    emoji: '🌱',
    description: 'Eco & vegan selectie',
    predicate: (config) => config.interest === 'duurzaam',
  },
]

type BudgetOption = {
  id: string
  label: string
  min: number
  max: number | null
}

const BUDGET_OPTIONS: BudgetOption[] = [
  { id: 'all', label: 'Alle budgetten', min: 0, max: null },
  { id: '0-25', label: 'Tot €25', min: 0, max: 25 },
  { id: '25-50', label: '€25 - €50', min: 25, max: 50 },
  { id: '50-100', label: '€50 - €100', min: 50, max: 100 },
  { id: '100+', label: '€100+', min: 100, max: null },
]

const getBudgetValue = (config: ProgrammaticConfig) =>
  config.budgetMax ?? config.filters?.maxPrice ?? null

/* ─────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────── */

const CadeausHubPage: React.FC<{ navigateTo: NavigateTo }> = ({ navigateTo }) => {
  const allGuides = useMemo(() => Object.values(PROGRAMMATIC_INDEX), [])
  const [activeTab, setActiveTab] = useState('all')
  const [activeBudget, setActiveBudget] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // SEO meta tags
  useEffect(() => {
    document.title = 'Cadeaugidsen | Gifteez — Vind het Perfecte Cadeau'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Ontdek 30+ cadeaugidsen voor Sinterklaas, Kerst en elke gelegenheid. Filter op budget, ontvanger of thema en vind direct het perfecte cadeau.'
      )
    }
  }, [])

  // Filter logic
  const filteredGuides = useMemo(() => {
    let result = allGuides

    // Category filter
    const activeCategory = CATEGORY_TABS.find((tab) => tab.id === activeTab)
    if (activeCategory && activeTab !== 'all') {
      result = result.filter((guide) => activeCategory.predicate(guide))
    }

    // Budget filter
    if (activeBudget !== 'all') {
      const budgetOption = BUDGET_OPTIONS.find((b) => b.id === activeBudget)
      if (budgetOption) {
        result = result.filter((guide) => {
          const budget = getBudgetValue(guide)
          if (!budget) return false
          const max = budgetOption.max ?? Number.POSITIVE_INFINITY
          return budget > budgetOption.min && budget <= max
        })
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (guide) =>
          guide.title.toLowerCase().includes(query) ||
          guide.intro.toLowerCase().includes(query) ||
          guide.recipient?.toLowerCase().includes(query) ||
          guide.interest?.toLowerCase().includes(query)
      )
    }

    return result
  }, [allGuides, activeTab, activeBudget, searchQuery])

  // Popular guides (for featured section)
  const popularGuides = useMemo(
    () =>
      allGuides
        .filter(
          (g) =>
            g.slug.includes('kerst') ||
            g.slug.includes('sinter') ||
            g.slug.includes('haar') ||
            g.slug.includes('hem')
        )
        .slice(0, 4),
    [allGuides]
  )

  // Quick links for hero
  const quickLinks = [
    { label: 'Sinterklaas onder €25', slug: 'sinterklaas-voor-kinderen-onder-25' },
    { label: 'Kerst voor haar', slug: 'kerst-voor-haar-onder-50' },
    { label: 'Kerst voor hem', slug: 'kerst-voor-hem-onder-50' },
    { label: 'Duurzame cadeaus', slug: 'duurzamere-cadeaus-onder-50' },
  ]

  // JSON-LD Schema
  const breadcrumbSchema = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gifteez.nl'
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Cadeaugidsen',
          item: `${baseUrl}${GUIDE_BASE_PATH}`,
        },
      ],
    }
  }, [])

  const itemListSchema = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gifteez.nl'
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Cadeaugidsen voor elk Moment',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: allGuides.map((v, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${baseUrl}${buildGuidePath(v.slug)}`,
        item: { '@type': 'WebPage', name: v.title, url: `${baseUrl}${buildGuidePath(v.slug)}` },
      })),
    }
  }, [allGuides])

  return (
    <>
      {/* ─────────────────────────────────────────────────────────
          HERO SECTION
         ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-rose-100/20 to-amber-100/20 rounded-full blur-3xl" />
        </div>

        <Container>
          <div className="relative py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm ring-1 ring-rose-100 mb-6">
                <span className="text-lg">🎁</span>
                <span>{allGuides.length}+ cadeaugidsen beschikbaar</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
                Vind het{' '}
                <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                  perfecte cadeau
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Ontdek onze handgeselecteerde cadeaugidsen voor Sinterklaas, Kerst en elke
                gelegenheid. Filter op budget of ontvanger en shop direct bij betrouwbare partners.
              </p>

              {/* Quick links */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {quickLinks.map((link) => (
                  <a
                    key={link.slug}
                    href={buildGuidePath(link.slug)}
                    className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:ring-rose-300 hover:text-rose-600 hover:shadow-md"
                  >
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-12 flex justify-center gap-8 md:gap-16">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900">
                    {allGuides.length}+
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Cadeaugidsen</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900">5</div>
                  <div className="text-sm text-gray-500 mt-1">Partners</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900">€5-€500</div>
                  <div className="text-sm text-gray-500 mt-1">Budgetrange</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────
          FEATURED GUIDES (Popular picks)
         ───────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <Container>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">🔥 Populair deze week</h2>
            <p className="mt-2 text-gray-600">De meest bezochte cadeaugidsen van het moment</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularGuides.map((guide) => (
              <GuideCard key={guide.slug} config={guide} />
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────
          FILTER & BROWSE SECTION
         ───────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <Container>
          {/* Section header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Blader door alle gidsen
            </h2>
            <p className="mt-2 text-gray-600">Filter op categorie, budget of zoek op trefwoord</p>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab.id
              const count =
                tab.id === 'all'
                  ? allGuides.length
                  : allGuides.filter((g) => tab.predicate(g)).length

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                      : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-rose-300 hover:text-rose-600'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20' : 'bg-gray-100'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search and budget filter row */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-3xl mx-auto">
            {/* Search */}
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="w-full rounded-xl border-0 bg-white py-3 pl-11 pr-4 text-gray-900 ring-1 ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500"
                placeholder="Zoek op trefwoord..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Budget select */}
            <select
              value={activeBudget}
              onChange={(e) => setActiveBudget(e.target.value)}
              className="rounded-xl border-0 bg-white py-3 px-4 text-gray-900 ring-1 ring-gray-200 focus:ring-2 focus:ring-rose-500 md:w-48"
            >
              {BUDGET_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="text-center mb-8">
            <span className="text-sm text-gray-500">
              {filteredGuides.length} gids{filteredGuides.length !== 1 ? 'en' : ''} gevonden
              {(activeTab !== 'all' || activeBudget !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setActiveTab('all')
                    setActiveBudget('all')
                    setSearchQuery('')
                  }}
                  className="ml-2 text-rose-600 hover:text-rose-700 font-medium"
                >
                  Reset filters
                </button>
              )}
            </span>
          </div>

          {/* Guide grid */}
          {filteredGuides.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGuides.map((guide) => (
                <GuideCard
                  key={guide.slug}
                  config={guide}
                  displayMode={guide.interest === 'duurzaam' ? 'sustainable' : 'default'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen gidsen gevonden</h3>
              <p className="text-gray-600 mb-6">Probeer andere filters of zoektermen</p>
              <button
                onClick={() => {
                  setActiveTab('all')
                  setActiveBudget('all')
                  setSearchQuery('')
                }}
                className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600"
              >
                Bekijk alle gidsen
              </button>
            </div>
          )}
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────
          CTA SECTION
         ───────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Nog geen idee? Laat ons helpen! 🎯
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Beantwoord een paar vragen en onze AI vindt het perfecte cadeau voor jou
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigateTo('giftFinder')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600 hover:scale-105"
              >
                <span>🤖</span>
                Start de Gift Finder
              </button>
              <button
                onClick={() => navigateTo('quiz')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <span>📝</span>
                Doe de Cadeau Quiz
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────
          PARTNERS MENTION
         ───────────────────────────────────────────────────────── */}
      <section className="py-12 bg-white border-t border-gray-100">
        <Container>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">Producten van betrouwbare partners</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <span className="text-lg font-semibold text-gray-400">Coolblue</span>
              <span className="text-lg font-semibold text-gray-400">Holland & Barrett</span>
              <span className="text-lg font-semibold text-gray-400">Amazon</span>
              <span className="text-lg font-semibold text-gray-400">SLYGAD</span>
              <span className="text-lg font-semibold text-gray-400">PartyPro</span>
            </div>
            <a
              href="/deals"
              className="inline-flex items-center gap-1 mt-4 text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              Meer over onze partners →
            </a>
          </div>
        </Container>
      </section>

      {/* JSON-LD */}
      <JsonLd id="jsonld-breadcrumbs-cadeaugidsen" data={breadcrumbSchema} />
      <JsonLd id="jsonld-itemlist-cadeaugidsen" data={itemListSchema} />
    </>
  )
}

export default CadeausHubPage
