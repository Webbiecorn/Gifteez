import React, { useMemo } from 'react'
import { PROGRAMMATIC_INDEX } from '../data/programmatic'
import JsonLd from './JsonLd'
import Container from './layout/Container'
import type { NavigateTo } from '../types'

const CadeausHubPage: React.FC<{ navigateTo: NavigateTo }> = () => {
  const variants = useMemo(() => Object.values(PROGRAMMATIC_INDEX), [])
  const featuredCollections = useMemo(() => variants.slice(0, 4), [variants])

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

  const quickLinks = [
    { label: 'Budget onder €25', href: '/cadeaus/sinterklaas/voor-kinderen-onder-25' },
    { label: 'Onder €50 voor haar', href: '/cadeaus/kerst/voor-haar/onder-50' },
    { label: 'Onder €50 voor hem', href: '/cadeaus/kerst/voor-hem/onder-50' },
    { label: 'Duurzame cadeaus', href: '/cadeaus/duurzamere-cadeaus-onder-50' },
    { label: 'Gamer cadeaus', href: '/cadeaus/gamer-cadeaus-onder-100' },
  ]

  const breadcrumbSchema = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gifteez.nl'
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Cadeaus', item: `${baseUrl}/cadeaus` },
      ],
    }
  }, [])

  const itemListSchema = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gifteez.nl'
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Cadeaus voor elk Moment',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: variants.map((v, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${baseUrl}/cadeaus/${v.slug}`,
        item: { '@type': 'WebPage', name: v.title, url: `${baseUrl}/cadeaus/${v.slug}` },
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

        <section className="mt-12">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Meest gekozen cadeaugidsen
              </h2>
              <p className="mt-1 text-sm md:text-base text-gray-600 max-w-2xl">
                Curated hubs met de beste producten. De juiste mix van merken zoals Coolblue,
                Amazon, Bol en duurzame partners.
              </p>
            </div>
          </header>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredCollections.map((v) => (
              <a
                key={v.slug}
                href={`/cadeaus/${v.slug}`}
                className="group relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_10px_35px_-25px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_-30px_rgba(219,39,119,0.45)]"
                aria-label={`Open ${v.title}`}
              >
                <span className="inline-flex w-fit items-center rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-600">
                  {v.occasion || v.recipient || v.interest || 'Cadeaugids'}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-primary transition line-clamp-2 min-h-[3.4rem]">
                  {v.title}
                </h3>
                {v.intro && <p className="mt-3 text-sm text-gray-600 line-clamp-3">{v.intro}</p>}
                {v.highlights && v.highlights.length > 0 && (
                  <ul className="mt-4 space-y-1.5 text-xs text-gray-600">
                    {v.highlights.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                          +
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
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
                href={`/cadeaus/${v.slug}`}
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
                  href={`/cadeaus/${v.slug}`}
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
                  href={`/cadeaus/${v.slug}`}
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
                href="/cadeaus"
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
              >
                Alle cadeaugidsen
              </a>
            </div>
          </div>
        </section>
      </div>

      <JsonLd id="jsonld-breadcrumbs-cadeaus" data={breadcrumbSchema} />
      <JsonLd id="jsonld-itemlist-cadeaus" data={itemListSchema} />
    </Container>
  )
}

export default CadeausHubPage
