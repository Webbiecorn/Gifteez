import React, { useMemo, useState } from 'react'
import { PROGRAMMATIC_INDEX } from '../data/programmatic'
import { buildGuidePath, GUIDE_BASE_PATH } from '../guidePaths'
import GuideCard from './GuideCard'
import JsonLd from './JsonLd'
import Container from './layout/Container'
import type { ProgrammaticConfig } from '../data/programmatic'
import type { NavigateTo } from '../types'

type PersonaFilter = {
  id: string
  label: string
  description: string
  emoji: string
  predicate: (config: ProgrammaticConfig) => boolean
}

type BudgetSegment = {
  id: string
  label: string
  description: string
  min: number
  max: number | null
}

type OccasionFilter = {
  id: string
  label: string
  description: string
  emoji: string
  predicate: (config: ProgrammaticConfig) => boolean
}

const PERSONA_FILTERS: PersonaFilter[] = [
  {
    id: 'haar',
    label: 'Voor haar',
    description: 'Beauty, wellness & cosy home',
    emoji: '🌸',
    predicate: (config) => config.recipient === 'haar',
  },
  {
    id: 'hem',
    label: 'Voor hem',
    description: 'Tech, gadgets & borrel',
    emoji: '🕺',
    predicate: (config) => config.recipient === 'hem',
  },
  {
    id: 'collegas',
    label: 'Collega’s',
    description: 'Secret Santa & kantoor',
    emoji: '💼',
    predicate: (config) => config.recipient === 'collegas',
  },
  {
    id: 'kids',
    label: 'Kids',
    description: 'Pakjesavond & educatief',
    emoji: '🧸',
    predicate: (config) => config.recipient === 'kids',
  },
  {
    id: 'duurzaam',
    label: 'Duurzaam',
    description: 'Eco & vegan selectie',
    emoji: '🌱',
    predicate: (config) => config.interest === 'duurzaam',
  },
  {
    id: 'tech',
    label: 'Tech & gamers',
    description: 'Smart home & gear',
    emoji: '🎧',
    predicate: (config) => config.interest === 'tech' || config.interest === 'gamer',
  },
]

const OCCASION_FILTERS: OccasionFilter[] = [
  {
    id: 'sinterklaas',
    label: 'Sinterklaas',
    description: '5 december',
    emoji: '🎁',
    predicate: (config) => config.occasion === 'sinterklaas' || config.slug.includes('sinterklaas'),
  },
  {
    id: 'kerst',
    label: 'Kerst',
    description: '25 & 26 december',
    emoji: '🎄',
    predicate: (config) => config.occasion === 'kerst' || config.slug.includes('kerst'),
  },
]

const BUDGET_SEGMENTS: BudgetSegment[] = [
  { id: '0-25', label: '€0 - €25', description: 'Lootjes & collega’s', min: 0, max: 25 },
  { id: '25-50', label: '€25 - €50', description: 'Populaire cadeaus', min: 25, max: 50 },
  { id: '50-100', label: '€50 - €100', description: 'Premium picks', min: 50, max: 100 },
  { id: '100-150', label: '€100 - €150', description: 'Partner & ouders', min: 100, max: 150 },
  { id: '150+', label: '€150+', description: 'Statement gifts', min: 150, max: null },
]

const getBudgetValue = (config: ProgrammaticConfig) =>
  config.budgetMax ?? config.filters?.maxPrice ?? null

const CadeausHubPage: React.FC<{ navigateTo: NavigateTo }> = () => {
  const variants = useMemo(() => Object.values(PROGRAMMATIC_INDEX), [])
  const [activePersona, setActivePersona] = useState<string | null>(null)
  const [activeBudget, setActiveBudget] = useState<string | null>(null)
  const [activeOccasion, setActiveOccasion] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<'default' | 'price-asc' | 'price-desc' | 'a-z'>(
    'default'
  )

  const personaDefinition = activePersona
    ? (PERSONA_FILTERS.find((filter) => filter.id === activePersona) ?? null)
    : null
  const budgetDefinition = activeBudget
    ? (BUDGET_SEGMENTS.find((segment) => segment.id === activeBudget) ?? null)
    : null
  const occasionDefinition = activeOccasion
    ? (OCCASION_FILTERS.find((filter) => filter.id === activeOccasion) ?? null)
    : null

  const filteredCollections = useMemo(() => {
    let result = variants

    // 1. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(query) ||
          v.intro.toLowerCase().includes(query) ||
          v.recipient?.toLowerCase().includes(query) ||
          v.interest?.toLowerCase().includes(query) ||
          v.occasion?.toLowerCase().includes(query)
      )
    }

    // 2. Facet Filters
    if (!personaDefinition && !budgetDefinition && !occasionDefinition) {
      return result
    }

    return result.filter((variant) => {
      if (personaDefinition && !personaDefinition.predicate(variant)) {
        return false
      }
      if (occasionDefinition && !occasionDefinition.predicate(variant)) {
        return false
      }
      if (budgetDefinition) {
        const budgetValue = getBudgetValue(variant)
        if (!budgetValue) return false
        const max = budgetDefinition.max ?? Number.POSITIVE_INFINITY
        return budgetValue > budgetDefinition.min && budgetValue <= max
      }
      return true
    })
  }, [variants, personaDefinition, budgetDefinition, occasionDefinition, searchQuery])

  const hasActiveFilters = Boolean(
    personaDefinition || budgetDefinition || occasionDefinition || searchQuery
  )
  const noFilterHits = hasActiveFilters && filteredCollections.length === 0

  const prioritizedVariants = useMemo(() => {
    const result = noFilterHits ? variants : filteredCollections

    // Sorting
    switch (sortOption) {
      case 'price-asc':
        return [...result].sort((a, b) => (getBudgetValue(a) || 0) - (getBudgetValue(b) || 0))
      case 'price-desc':
        return [...result].sort((a, b) => (getBudgetValue(b) || 0) - (getBudgetValue(a) || 0))
      case 'a-z':
        return [...result].sort((a, b) => a.title.localeCompare(b.title))
      default:
        return result
    }
  }, [filteredCollections, noFilterHits, variants, sortOption])

  const featuredCollections = useMemo(() => prioritizedVariants.slice(0, 4), [prioritizedVariants])

  const personaOptions = useMemo(
    () =>
      PERSONA_FILTERS.map((filter) => ({
        ...filter,
        count: variants.filter((variant) => filter.predicate(variant)).length,
      })),
    [variants]
  )

  const occasionOptions = useMemo(
    () =>
      OCCASION_FILTERS.map((filter) => ({
        ...filter,
        count: variants.filter((variant) => filter.predicate(variant)).length,
      })),
    [variants]
  )

  const budgetOptions = useMemo(
    () =>
      BUDGET_SEGMENTS.map((segment) => ({
        ...segment,
        count: variants.filter((variant) => {
          const budgetValue = getBudgetValue(variant)
          if (!budgetValue) return false
          const max = segment.max ?? Number.POSITIVE_INFINITY
          return budgetValue > segment.min && budgetValue <= max
        }).length,
      })),
    [variants]
  )

  const filterSummary = useMemo(() => {
    if (!hasActiveFilters) return 'Top selectie op basis van performance en vraag.'
    const parts = []
    if (searchQuery) parts.push(`"${searchQuery}"`)
    if (personaDefinition) parts.push(personaDefinition.label)
    if (occasionDefinition) parts.push(occasionDefinition.label)
    if (budgetDefinition) parts.push(budgetDefinition.label)
    return `Gefilterd op ${parts.join(' + ')}`
  }, [hasActiveFilters, personaDefinition, budgetDefinition, occasionDefinition, searchQuery])

  const quickLinks = useMemo(
    () =>
      [
        { label: 'Budget onder €25', slug: 'sinterklaas-voor-kinderen-onder-25' },
        { label: 'Onder €50 voor haar', slug: 'kerst-voor-haar-onder-50' },
        { label: 'Onder €50 voor hem', slug: 'kerst-voor-hem-onder-50' },
        { label: 'Duurzame cadeaus', slug: 'duurzamere-cadeaus-onder-50' },
        { label: 'Duurzaam kerstcadeau', slug: 'kerst-duurzaam-onder-50' },
        { label: 'Gamer cadeaus', slug: 'gamer-cadeaus-onder-100' },
      ].map((link) => ({
        label: link.label,
        href: buildGuidePath(link.slug),
      })),
    []
  )

  const totalVisible = prioritizedVariants.length
  const featuredCount = featuredCollections.length

  const handleResetFilters = () => {
    setActivePersona(null)
    setActiveBudget(null)
    setActiveOccasion(null)
    setSearchQuery('')
    setSortOption('default')
  }

  const holidayCollections = useMemo(
    () => variants.filter((v) => v.occasion === 'kerst' || v.slug.includes('sinter')),
    [variants]
  )

  const interestCollections = useMemo(
    () => variants.filter((v) => v.interest && v.interest !== 'duurzaam'),
    [variants]
  )

  const sustainableCollections = useMemo(
    () => variants.filter((v) => v.interest === 'duurzaam'),
    [variants]
  )

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
      itemListElement: variants.map((v, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${baseUrl}${buildGuidePath(v.slug)}`,
        item: { '@type': 'WebPage', name: v.title, url: `${baseUrl}${buildGuidePath(v.slug)}` },
      })),
    }
  }, [variants])

  return (
    <Container>
      <div className="py-8 md:py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-100 via-white to-blue-50 border border-rose-100 shadow-[0_25px_70px_-40px_rgba(219,39,119,0.6)]">
          {/* Subtle Mascot Background */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <img
              src="/images/mascotte-hero-new-v4.png"
              alt=""
              className="w-64 h-64 object-contain translate-y-10 translate-x-10"
            />
          </div>
          <div
            className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-rose-200/40 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl"
            aria-hidden
          />

          <div className="relative px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-rose-600 shadow-sm ring-1 ring-rose-100">
              🎁 {variants.length}+ cadeaugidsen beschikbaar
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Vind het perfecte cadeau in minuten
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-700 max-w-2xl">
              Kies een gids op budget, persoon of gelegenheid. Elke gids bevat handgeselecteerde
              producten van betrouwbare partners met snelle levering en scherpe prijzen.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-primary hover:text-primary"
                >
                  <span>→</span>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          {/* Search & Sort Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full rounded-xl border-gray-200 pl-10 text-sm focus:border-primary focus:ring-primary"
                placeholder="Zoek op trefwoord (bijv. 'Harry Potter', 'Koffie')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="rounded-xl border-gray-200 text-sm focus:border-primary focus:ring-primary"
              >
                <option value="default">Aanbevolen</option>
                <option value="price-asc">Prijs: Laag → Hoog</option>
                <option value="price-desc">Prijs: Hoog → Laag</option>
                <option value="a-z">Alfabetisch</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-gray-100 pt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Filter je cadeaugidsen
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                Voor wie shop je en wat is je budget?
              </h2>
              <p className="text-sm text-gray-600">{filterSummary}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">
                {totalVisible} gidsen zichtbaar
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
                className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reset filters
              </button>
            </div>
          </div>

          {noFilterHits && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Geen gids gevonden voor deze combinatie. We tonen tijdelijk alle cadeaugidsen.
            </div>
          )}

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Gelegenheid
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {occasionOptions.map((option) => {
                const isActive = activeOccasion === option.id
                const isDisabled = option.count === 0
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setActiveOccasion(isActive ? null : option.id)}
                    aria-pressed={isActive}
                    disabled={isDisabled}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 bg-gray-50 text-gray-800'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-2xl" aria-hidden>
                      {option.emoji}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{option.count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Voor wie shop je?
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {personaOptions.map((option) => {
                const isActive = activePersona === option.id
                const isDisabled = option.count === 0
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setActivePersona(isActive ? null : option.id)}
                    aria-pressed={isActive}
                    disabled={isDisabled}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 bg-gray-50 text-gray-800'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-2xl" aria-hidden>
                      {option.emoji}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{option.count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Budget check
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-5">
              {budgetOptions.map((segment) => {
                const isActive = activeBudget === segment.id
                const isDisabled = segment.count === 0
                return (
                  <button
                    key={segment.id}
                    type="button"
                    onClick={() => setActiveBudget(isActive ? null : segment.id)}
                    aria-pressed={isActive}
                    disabled={isDisabled}
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 bg-gray-50 text-gray-800'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <p className="text-sm font-semibold">{segment.label}</p>
                    <p className="text-xs text-gray-500">{segment.description}</p>
                    <span className="mt-2 inline-flex items-center text-xs font-semibold text-gray-500">
                      {segment.count} gidsen
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Meest gekozen cadeaugidsen
              </h2>
              <p className="mt-1 text-sm md:text-base text-gray-600 max-w-2xl">
                {filterSummary} ({featuredCount} van {totalVisible} getoond)
              </p>
            </div>
          </header>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredCollections.map((v) => (
              <GuideCard key={v.slug} config={v} />
            ))}
          </div>
        </section>

        <section className="mt-14">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Feestdagen & seizoenen
              </h2>
              <p className="mt-1 text-sm md:text-base text-gray-600 max-w-2xl">
                Direct naar kerst- en sinterklaasgidsen, inclusief budgetfilters en snelle levering.
              </p>
            </div>
          </header>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {holidayCollections.map((v) => (
              <GuideCard key={v.slug} config={v} />
            ))}
          </div>
        </section>

        {interestCollections.length > 0 && (
          <section className="mt-14">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Interesse & hobby cadeaus
                </h2>
                <p className="mt-1 text-sm md:text-base text-gray-600 max-w-2xl">
                  Gamer, tech of lifestyle? Deze gidsen groeperen producten per interesse zodat je
                  direct relevantie behoudt in campagnes.
                </p>
              </div>
            </header>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {interestCollections.map((v) => (
                <GuideCard key={v.slug} config={v} />
              ))}
            </div>
          </section>
        )}

        {sustainableCollections.length > 0 && (
          <section className="mt-14">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Duurzame selectie</h2>
                <p className="mt-1 text-sm md:text-base text-gray-600 max-w-2xl">
                  Vegan, eco en fair trade partners uit AWIN en Shop Like You Give A Damn, met
                  strenge merchantfilters.
                </p>
              </div>
            </header>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sustainableCollections.map((v) => (
                <GuideCard key={v.slug} config={v} displayMode="sustainable" />
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 rounded-3xl border border-gray-100 bg-slate-900 px-6 py-10 text-slate-100 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.9)] lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Snel starten met cadeaugidsen</h2>
              <p className="mt-3 text-sm md:text-base text-slate-300">
                Kies een budget of thema en ontdek direct cadeaus die passen. Onze gidsen worden
                continu aangevuld en komen uit betrouwbare winkels.
              </p>
              <ul className="mt-5 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    +
                  </span>
                  Budget- en themagidsen voor elk moment
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    +
                  </span>
                  Geselecteerd op kwaliteit en prijs
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    +
                  </span>
                  Betrouwbare winkels, direct klikbaar
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    +
                  </span>
                  Slimme filters voor snel resultaat
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="text-sm uppercase tracking-widest text-slate-400">Snel starten</div>
              {quickLinks.slice(0, 3).map((link) => (
                <a
                  key={`cta-${link.href}`}
                  href={link.href}
                  className="group flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-white"
                >
                  {link.label}
                  <span className="text-emerald-400 transition group-hover:translate-x-1">→</span>
                </a>
              ))}
              <a
                href={GUIDE_BASE_PATH}
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
              >
                Alle cadeaugidsen
              </a>
            </div>
          </div>
        </section>
      </div>

      <JsonLd id="jsonld-breadcrumbs-cadeaugidsen" data={breadcrumbSchema} />
      <JsonLd id="jsonld-itemlist-cadeaugidsen" data={itemListSchema} />
    </Container>
  )
}

export default CadeausHubPage
