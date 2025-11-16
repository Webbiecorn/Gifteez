import React, { useMemo, useState } from 'react'
import { PROGRAMMATIC_INDEX } from '../data/programmatic'
import { buildGuidePath, GUIDE_BASE_PATH } from '../guidePaths'
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

const BUDGET_SEGMENTS: BudgetSegment[] = [
  { id: '0-25', label: '€0 - €25', description: 'Lootjes & collega’s', min: 0, max: 25 },
  { id: '25-50', label: '€25 - €50', description: 'Populaire cadeaus', min: 25, max: 50 },
  { id: '50-100', label: '€50 - €100', description: 'Premium picks', min: 50, max: 100 },
  { id: '100-150', label: '€100 - €150', description: 'Partner & ouders', min: 100, max: 150 },
  { id: '150+', label: '€150+', description: 'Statement gifts', min: 150, max: null },
]

const RECIPIENT_LABELS: Record<string, string> = {
  hem: 'Voor hem',
  haar: 'Voor haar',
  collegas: 'Collega’s',
  kids: 'Voor kids',
}

const INTEREST_LABELS: Record<string, string> = {
  duurzaam: 'Duurzaam',
  tech: 'Tech',
  gamer: 'Gamer',
}

const formatRecipientLabel = (recipient?: string | null) => {
  if (!recipient) return null
  return RECIPIENT_LABELS[recipient] ?? recipient.charAt(0).toUpperCase() + recipient.slice(1)
}

const formatInterestLabel = (interest?: string | null) => {
  if (!interest) return null
  return INTEREST_LABELS[interest] ?? interest.charAt(0).toUpperCase() + interest.slice(1)
}

const getBudgetValue = (config: ProgrammaticConfig) =>
  config.budgetMax ?? config.filters?.maxPrice ?? null

const CadeausHubPage: React.FC<{ navigateTo: NavigateTo }> = () => {
  const variants = useMemo(() => Object.values(PROGRAMMATIC_INDEX), [])
  const [activePersona, setActivePersona] = useState<string | null>(null)
  const [activeBudget, setActiveBudget] = useState<string | null>(null)

  const personaDefinition = activePersona
    ? (PERSONA_FILTERS.find((filter) => filter.id === activePersona) ?? null)
    : null
  const budgetDefinition = activeBudget
    ? (BUDGET_SEGMENTS.find((segment) => segment.id === activeBudget) ?? null)
    : null

  const filteredCollections = useMemo(() => {
    if (!personaDefinition && !budgetDefinition) {
      return variants
    }
    return variants.filter((variant) => {
      if (personaDefinition && !personaDefinition.predicate(variant)) {
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
  }, [variants, personaDefinition, budgetDefinition])

  const hasActiveFilters = Boolean(personaDefinition || budgetDefinition)
  const noFilterHits = hasActiveFilters && filteredCollections.length === 0

  const prioritizedVariants = useMemo(
    () => (noFilterHits ? variants : filteredCollections),
    [filteredCollections, noFilterHits, variants]
  )

  const featuredCollections = useMemo(() => prioritizedVariants.slice(0, 4), [prioritizedVariants])

  const personaOptions = useMemo(
    () =>
      PERSONA_FILTERS.map((filter) => ({
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
    if (personaDefinition) parts.push(personaDefinition.label)
    if (budgetDefinition) parts.push(budgetDefinition.label)
    return `Gefilterd op ${parts.join(' + ')}`
  }, [hasActiveFilters, personaDefinition, budgetDefinition])

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
              Altijd het juiste cadeau gevonden
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Cadeaugidsen die echt converteren
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-700 max-w-2xl">
              Kies een gids die past bij jouw moment of budget. Elke pagina toont direct shoppable
              cadeaus met snelle levering, prijsfilters en een mix van betrouwbare partners.
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
              <a
                key={v.slug}
                href={buildGuidePath(v.slug)}
                className="group relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_10px_35px_-25px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_-30px_rgba(219,39,119,0.45)]"
                aria-label={`Open ${v.title}`}
              >
                <span className="inline-flex w-fit items-center rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-600">
                  {v.occasion || v.recipient || v.interest || 'Cadeaugids'}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-primary transition line-clamp-2 min-h-[3.4rem]">
                  {v.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-gray-600">
                  {formatRecipientLabel(v.recipient) && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
                      {formatRecipientLabel(v.recipient)}
                    </span>
                  )}
                  {formatInterestLabel(v.interest) && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
                      #{formatInterestLabel(v.interest)}
                    </span>
                  )}
                  {getBudgetValue(v) && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
                      Tot €{getBudgetValue(v)}
                    </span>
                  )}
                  {v.filters?.fastDelivery && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
                      ⚡ Snelle levering
                    </span>
                  )}
                </div>
                {v.intro && <p className="mt-3 text-sm text-gray-600 line-clamp-3">{v.intro}</p>}
                {v.highlights && v.highlights.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Mini-preview
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-gray-700">
                      {v.highlights.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary">
                            {idx + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
                  Bekijk pagina
                  <span aria-hidden>→</span>
                </div>
              </a>
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
              <a
                key={v.slug}
                href={buildGuidePath(v.slug)}
                className="group relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
              >
                <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                  {v.occasion?.toUpperCase() ?? 'Seizoen'}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-primary transition line-clamp-2 min-h-[3.4rem]">
                  {v.title}
                </h3>
                {v.intro && <p className="mt-3 text-sm text-gray-600 line-clamp-3">{v.intro}</p>}
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
                  Naar gids
                  <span aria-hidden>→</span>
                </div>
              </a>
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
                <a
                  key={v.slug}
                  href={buildGuidePath(v.slug)}
                  className="group relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
                >
                  <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                    {v.interest?.toUpperCase() ?? 'Interesse'}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-primary transition line-clamp-2 min-h-[3.4rem]">
                    {v.title}
                  </h3>
                  {v.intro && <p className="mt-3 text-sm text-gray-600 line-clamp-3">{v.intro}</p>}
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
                    Naar gids
                    <span aria-hidden>→</span>
                  </div>
                </a>
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
                <a
                  key={v.slug}
                  href={buildGuidePath(v.slug)}
                  className="group relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
                >
                  <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                    Duurzaam
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-primary transition line-clamp-2 min-h-[3.4rem]">
                    {v.title}
                  </h3>
                  {v.intro && <p className="mt-3 text-sm text-gray-600 line-clamp-3">{v.intro}</p>}
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
                    Naar gids
                    <span aria-hidden>→</span>
                  </div>
                </a>
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
