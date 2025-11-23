import type { FormEvent } from 'react'
import React, { useState, useEffect, useMemo } from 'react'
import { useBlogContext } from '../contexts/BlogContext'
import { buildGuidePath } from '../guidePaths'
import Button from './Button'
import HeroHome from './HeroHome'
import { BlogPostSkeleton } from './HomePageSkeletons'
import HowItWorks from './HowItWorks'
import { BookOpenIcon, TagIcon, CalendarIcon } from './IconComponents'
import ImageWithFallback from './ImageWithFallback'
import { Container } from './layout/Container'
import LazyViewport from './LazyViewport'
import TestimonialCard from './TestimonialCard'
import type { Testimonial, NavigateTo } from '../types'

interface HomePageProps {
  navigateTo: NavigateTo
}

const testimonials: Testimonial[] = [
  {
    quote: 'Super handige gidsen, vond binnen 1 minuut iets voor mijn zus. Een echte aanrader!',
    author: 'Linda de Vries',
  },
  {
    quote: 'De AI Cadeaucoach is geniaal. Nooit meer keuzestress voor verjaardagen.',
    author: 'Mark Jansen',
  },
  {
    quote:
      'Eindelijk een site die begrijpt wat ik zoek. Binnen 30 seconden had ik 5 perfecte ideeën!',
    author: 'Sophie van Dijk',
  },
  {
    quote:
      'De collecties zijn echt goed samengesteld. Kwaliteit voorop, niet zomaar wat producten bij elkaar.',
    author: 'Thomas Bakker',
  },
  {
    quote: 'Ik gebruik Gifteez nu voor alle cadeaus. De Cadeaucoach is super leuk en accuraat!',
    author: 'Emma Peters',
  },
  {
    quote: 'Als je niet weet wat te geven, moet je hier zijn. Simpel, snel en effectief.',
    author: 'Ruben Visser',
  },
]

const guideShowcase = [
  {
    slug: 'kerst-voor-haar-onder-50',
    badge: 'Budget < €50',
    title: 'Warm & persoonlijk voor haar',
    summary: 'Beauty, wellness en designcadeaus die klaarstaan voor Kerst.',
    chips: ['Beauty', 'Wellness', 'Design'],
  },
  {
    slug: 'kerst-voor-hem-onder-150',
    badge: 'Premium',
    title: 'Voor hem die alles al heeft',
    summary: 'Mix van tech, whisky en ervaringstips tot €150.',
    chips: ['Tech', 'Whisky', 'Ervaring'],
  },
  {
    slug: 'duurzamere-cadeaus-onder-50',
    badge: 'Groene keuze',
    title: 'Duurzame cadeaus onder €50',
    summary: 'Keurmerken, lokale makers en herbruikbare materialen.',
    chips: ['Eco', 'Bewust', 'Lokaal'],
  },
  {
    slug: 'last-minute-kerstcadeaus-vandaag-bezorgd',
    badge: '⚡ Spoed',
    title: 'Last-minute vandaag bezorgd',
    summary: 'Snelle cadeaus bij Coolblue, Bol en Amazon vóór de feestdagen.',
    chips: ['Same-day', 'Gadgets', 'Gezellig'],
  },
]

const budgetShortcuts = [
  {
    slug: 'kerst-voor-collegas-onder-25',
    label: '€0 - €25',
    description: 'Collega & surprise cadeaus',
    emoji: '🎁',
  },
  {
    slug: 'kerst-voor-haar-onder-50',
    label: '€25 - €50',
    description: 'Vriendinnen & schoonfamilie',
    emoji: '🌸',
  },
  {
    slug: 'kerst-voor-hem-onder-150',
    label: '€50 - €150',
    description: 'Partners & ouders',
    emoji: '🕺',
  },
  {
    slug: 'wonen-decoratie-cadeaus',
    label: 'Home & design',
    description: 'Sfeer, interieur & lifestyle',
    emoji: '🏡',
  },
]

const getReadingTimeMinutes = (text: string): number => {
  const words = text ? text.trim().split(/\s+/).length : 0
  return Math.max(1, Math.round(words / 200))
}

const HomePage: React.FC<HomePageProps> = ({ navigateTo }) => {
  const { posts: blogPosts, loading: blogLoading } = useBlogContext()

  const [newsletterEmail, setNewsletterEmail] = useState('')

  const partyProPost = useMemo(
    () => blogPosts.find((post) => post.slug === 'partypro-feestdecoratie-partner'),
    [blogPosts]
  )

  // Trending: Most recent posts (simulates popularity - could track views in future)
  const trendingPosts = useMemo(() => {
    const sorted = [...blogPosts].sort(
      (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    )

    if (partyProPost) {
      return sorted.filter((post) => post.slug !== partyProPost.slug).slice(0, 3)
    }

    return sorted.slice(0, 3)
  }, [blogPosts, partyProPost])

  // Latest: Same as trending for now, but separated for future differentiation
  const latestPosts = useMemo(() => {
    return [...blogPosts]
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
      .slice(0, 3)
  }, [blogPosts])

  useEffect(() => {
    document.title = 'Gifteez.nl — Trending Gifts & Expert Gift Guides voor Elk Moment'

    const ensure = (selector: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(selector) as HTMLElement | null
      if (!el) {
        el = create()
        document.head.appendChild(el)
      }
      return el
    }

    const description =
      'Ontdek expert gift guides voor Sinterklaas, Kerst en elke gelegenheid. Van tech gadgets tot wellness — vind het perfecte cadeau met directe kooplinks.'
    const metaDesc = ensure('meta[name="description"]', () =>
      Object.assign(document.createElement('meta'), { name: 'description' })
    )
    metaDesc.setAttribute('content', description)

    const canonical = ensure('link[rel="canonical"]', () => {
      const link = document.createElement('link')
      link.rel = 'canonical'
      return link
    })
    canonical.setAttribute('href', window.location.origin + '/')

    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      const selector = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`
      const element = ensure(selector, () => {
        const meta = document.createElement('meta')
        meta.setAttribute(attr, key)
        return meta
      })
      element.setAttribute('content', content)
    }

    setMeta(
      'property',
      'og:title',
      'Gifteez.nl — Trending Gifts & Expert Gift Guides voor Elk Moment'
    )
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:url', window.location.origin + '/')
    setMeta('property', 'og:image', window.location.origin + '/og-image.png')
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta(
      'name',
      'twitter:title',
      'Gifteez.nl — Trending Gifts & Expert Gift Guides voor Elk Moment'
    )
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', window.location.origin + '/og-image.png')
  }, [])

  const handleNewsletterSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (newsletterEmail && /\S+@\S+\.\S+/.test(newsletterEmail)) {
      // console.log('Subscribing email:', newsletterEmail)
      navigateTo('download')
    }
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <HeroHome
        onStartQuiz={() => navigateTo('giftFinder')}
        onViewGuides={() => navigateTo('cadeausHub')}
      />
      <HowItWorks />

      {/* Guide showcase */}
      <section className="py-16 bg-white">
        <Container size="xl" className="space-y-10">
          <div className="text-center max-w-3xl mx-auto">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              🎯 Kies je startpunt
            </p>
            <h2 className="typo-h2 mt-4">Begin met onze populairste cadeaugidsen</h2>
            <p className="typo-body text-slate-600">
              Selecties per budget, persoon en leveringssnelheid. Klik door, bestel direct en keer
              terug naar de hub voor nieuwe inspiratie.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {guideShowcase.map((guide) => (
              <a
                key={guide.slug}
                href={buildGuidePath(guide.slug)}
                className="group relative flex h-full flex-col rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-[0_25px_55px_-35px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:border-primary/40"
              >
                <span className="inline-flex w-fit items-center rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-600">
                  {guide.badge}
                </span>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{guide.title}</h3>
                <p className="mt-2 text-sm text-gray-600 flex-1">{guide.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {guide.chips.map((chip) => (
                    <span
                      key={`${guide.slug}-${chip}`}
                      className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
                <span className="mt-6 inline-flex items-center text-sm font-semibold text-primary">
                  Bekijk gids
                  <span aria-hidden="true" className="ml-2 transition group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </a>
            ))}
          </div>

          <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 shadow-inner">
            <div className="flex flex-col gap-4 text-center lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Budget & deliverability
                </p>
                <h3 className="text-2xl font-bold text-gray-900">Of check snel je budget range</h3>
                <p className="text-sm text-gray-600">
                  Kies een budgettile en je landt direct in de juiste gids. Filters staan al klaar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('cadeausHub')}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:border-primary/40 hover:text-primary"
              >
                Bekijk alle cadeaugidsen
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {budgetShortcuts.map((shortcut) => (
                <a
                  key={shortcut.slug}
                  href={buildGuidePath(shortcut.slug)}
                  className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow hover:-translate-y-0.5 hover:border-primary/30 transition"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {shortcut.emoji}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-primary/80">{shortcut.label}</p>
                  <h4 className="text-lg font-bold text-gray-900">{shortcut.description}</h4>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary/80">
                    Open gids
                    <span aria-hidden="true" className="ml-1 transition group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Container>
      </section>
      {/* Trending Guides */}
      <Container
        size="xl"
        className="opacity-0 animate-fade-in-up"
        style={{ animationDelay: '200ms' }}
      >
        <div className="text-center mb-12">
          <h2 className="typo-h2 mb-4">Trending cadeaugidsen & verhalen</h2>
          <p className="typo-body text-slate-600 max-w-2xl mx-auto">
            Onze redactie vult deze gidsen dagelijks aan met nieuwe data en partnerdeals.
          </p>
        </div>
        {partyProPost && (
          <div className="mb-12 overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-r from-rose-50 via-white to-orange-50 shadow-xl">
            <div className="flex flex-col md:flex-row">
              <div className="relative md:w-1/2">
                <ImageWithFallback
                  src={partyProPost.imageUrl}
                  alt={partyProPost.title}
                  className="h-64 w-full object-cover md:h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-4 p-8 md:w-1/2 md:p-12">
                <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow">
                  Nieuwe partner
                </span>
                <h3 className="font-display text-2xl font-bold text-primary md:text-3xl">
                  {partyProPost.title}
                </h3>
                <p className="text-sm text-gray-700 md:text-base">{partyProPost.excerpt}</p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="accent"
                    onClick={() => navigateTo('blogDetail', { slug: partyProPost.slug })}
                    className="sm:w-auto"
                  >
                    Lees de spotlight
                  </Button>
                  <a
                    href="https://www.awin1.com/cread.php?awinmid=102231&awinaffid=2566111&ued=https%3A%2F%2Fwww.partypro.nl"
                    rel="nofollow sponsored noopener"
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-white px-6 py-3 text-sm font-semibold text-primary shadow-md transition-all hover:border-primary/60 hover:bg-rose-50"
                  >
                    Bekijk PartyPro collectie
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <BlogPostSkeleton key={`trending-skeleton-${index}`} />
            ))
          ) : trendingPosts.length > 0 ? (
            trendingPosts.map((post, i) => {
              const formattedDate = new Date(post.publishedDate).toLocaleDateString('nl-NL', {
                month: 'short',
                day: 'numeric',
              })

              return (
                <LazyViewport key={post.slug}>
                  {(visible) => (
                    <div
                      className="flex flex-col h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group cursor-pointer opacity-0 animate-fade-in-up transform hover:scale-105 transition-all duration-300 border border-gray-100"
                      style={{ animationDelay: `${200 + i * 100}ms` }}
                      onClick={() => navigateTo('blogDetail', { slug: post.slug })}
                    >
                      <div className="relative overflow-hidden">
                        {visible && (
                          <ImageWithFallback
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-primary text-xs font-semibold">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col flex-grow p-6">
                        <div className="flex-grow space-y-3">
                          <h3 className="font-display text-xl font-bold text-primary group-hover:text-accent transition-colors duration-300">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="inline-flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              {formattedDate}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <BookOpenIcon className="w-4 h-4" />
                              {getReadingTimeMinutes(post.excerpt)} min
                            </span>
                          </div>
                        </div>
                        {/* Pinterest Share Button */}
                        <div className="pt-3 mt-auto border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const url = `${window.location.origin}/blog/${post.slug}`
                              const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(window.location.origin + post.imageUrl)}&description=${encodeURIComponent(post.title)}`
                              window.open(pinterestUrl, '_blank', 'width=750,height=550')
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#E60023] hover:bg-[#c5001d] text-white text-xs font-semibold rounded-lg transition-colors duration-200"
                            aria-label={`Deel ${post.title} op Pinterest`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                            </svg>
                            Pin op Pinterest
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </LazyViewport>
              )
            })
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white/70 p-10 text-center shadow-inner">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpenIcon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary">
                Nog geen cadeaugidsen
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Publiceer je eerste blogpost om deze sectie te vullen.
              </p>
            </div>
          )}
        </div>
      </Container>

      {/* Deals CTA Section - Modern Redesign */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-24 opacity-0 animate-fade-in-up"
        style={{ animationDelay: '800ms' }}
      >
        {/* Decorative blur elements - hidden on mobile for performance */}
        <div className="absolute inset-0 overflow-hidden hidden md:block">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-primary/10 to-rose-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-pink-500/5 to-orange-500/5 blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Header section */}
            <div className="mb-16 text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm">
                <TagIcon className="h-4 w-4" />
                🔝 Topdeals & cadeaucolllecties
              </div>

              <h2 className="typo-h1 bg-gradient-to-r from-primary via-rose-600 to-orange-600 bg-clip-text text-transparent">
                Onze beste cadeaudeals van dit moment
              </h2>

              <p className="typo-lead mx-auto mt-6 max-w-3xl text-gray-700">
                Ontdek zorgvuldig samengestelde cadeau-collecties met de beste combinaties van
                prijs, kwaliteit en originaliteit. Ideaal als je snel iets moois wilt vinden zonder
                eindeloos te scrollen.
              </p>
            </div>

            {/* Feature cards grid */}
            <div className="mb-12 grid gap-6 md:grid-cols-3">
              {/* Card 1 - Beste Prijzen */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 blur-2xl transition-opacity group-hover:opacity-70 hidden md:block" />

                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg transition-transform group-hover:scale-110">
                    <svg
                      className="h-7 w-7 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-gray-900">Expert Selectie</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    Zorgvuldig samengesteld door onze gift experts. Elk product getest op kwaliteit,
                    originaliteit en cadeauwaarde.
                  </p>
                </div>
              </div>

              {/* Card 2 - Top Kwaliteit */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/10 to-yellow-500/10 blur-2xl transition-opacity group-hover:opacity-70 hidden md:block" />

                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg transition-transform group-hover:scale-110">
                    <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-gray-900">Top Kwaliteit</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    Alleen het beste van het beste. Producten met uitstekende reviews en hoge
                    tevredenheidscores.
                  </p>
                </div>
              </div>

              {/* Card 3 - Expert Selectie */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 blur-2xl transition-opacity group-hover:opacity-70 hidden md:block" />

                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg transition-transform group-hover:scale-110">
                    <svg
                      className="h-7 w-7 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-gray-900">Expert Selectie</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    Handmatig geselecteerd door ons team. Elk cadeau getest op originaliteit en
                    presentatie.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="mb-12 overflow-hidden rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="text-center">
                  <div className="mb-1 text-3xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-gray-600">Geselecteerde cadeaus</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-gray-600">Categorieën</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-3xl font-bold text-primary">20+</div>
                  <div className="text-sm text-gray-600">Webshops</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-3xl font-bold text-primary">Dagelijks</div>
                  <div className="text-sm text-gray-600">Vernieuwd</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button
                variant="primary"
                onClick={() => navigateTo('deals')}
                className="group px-10 py-5 text-lg font-semibold shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
              >
                <TagIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
                Bekijk alle Topdeals
              </Button>

              <p className="mt-4 text-sm text-gray-600">
                Handmatig geselecteerde cadeaus • Voor elke gelegenheid het perfecte idee
              </p>
              <p className="mt-1 text-xs text-gray-500">
                We werken met affiliate-partners. Jij betaalt niets extra, soms ontvangen wij een
                kleine commissie als je via onze links bestelt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts Section */}
      <section
        className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up"
        style={{ animationDelay: '1000ms' }}
      >
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
            Laatste Blogs & Cadeaugidsen
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Blijf op de hoogte van de nieuwste cadeau-trends en tips
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogLoading ? (
            // Show skeleton loaders while blog posts are loading
            <>
              <BlogPostSkeleton />
              <BlogPostSkeleton />
              <BlogPostSkeleton />
            </>
          ) : latestPosts.length > 0 ? (
            latestPosts.map((post, index) => (
              <LazyViewport key={post.slug}>
                {(visible) => (
                  <div
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group cursor-pointer opacity-0 animate-fade-in-up transform hover:scale-105 transition-all duration-300 border border-gray-100"
                    style={{ animationDelay: `${1200 + index * 200}ms` }}
                    onClick={() => navigateTo('blogDetail', { slug: post.slug })}
                  >
                    <div className="relative overflow-hidden">
                      {visible && (
                        <ImageWithFallback
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-primary text-sm font-medium">
                          Blog
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-xl font-bold text-primary group-hover:text-accent transition-colors duration-300 mb-3">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">Lees meer</span>
                        <span className="text-accent font-medium text-sm">→</span>
                      </div>
                      {/* Pinterest Share Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const url = `${window.location.origin}/blog/${post.slug}`
                          const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(window.location.origin + post.imageUrl)}&description=${encodeURIComponent(post.title)}`
                          window.open(pinterestUrl, '_blank', 'width=750,height=550')
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#E60023] hover:bg-[#c5001d] text-white text-xs font-semibold rounded-lg transition-colors duration-200"
                        aria-label={`Deel ${post.title} op Pinterest`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                        </svg>
                        Pin op Pinterest
                      </button>
                    </div>
                  </div>
                )}
              </LazyViewport>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white/70 p-10 text-center shadow-inner">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpenIcon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary">
                Nog geen extra guides
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Zodra er meerdere artikelen beschikbaar zijn, tonen we hier de nieuwste
                cadeaugidsen.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lead Magnet Section */}
      <section className="bg-gradient-to-r from-light-bg to-white">
        <div
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '1400ms' }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-6">
                <span className="text-2xl">📅</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
                Download je GRATIS Cadeau Planner
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Meld je aan voor onze nieuwsbrief en ontvang direct de 'Ultieme Cadeau Planner'. Mis
                nooit meer een verjaardag en sta altijd klaar met het perfecte cadeau!
              </p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Jouw e-mailadres"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-gray-800"
                    required
                  />
                  <Button
                    type="submit"
                    variant="accent"
                    className="px-8 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
                  >
                    Download Nu
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Geen spam, alleen waardevolle cadeau-tips. Je kunt je altijd uitschrijven.
                </p>
              </form>
            </div>

            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-primary/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-secondary to-light-bg rounded-2xl p-8 shadow-2xl border border-gray-100">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🎁</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-primary mb-2">
                      Ultieme Cadeau Planner
                    </h3>
                    <p className="text-gray-600 text-sm">PDF gids met 365 cadeau-ideeën</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Enhanced with 6 testimonials */}
      <section className="bg-gradient-to-b from-white to-light-bg pb-8">
        <div
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '1600ms' }}
        >
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
              Wat Gebruikers Zeggen
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ontdek waarom duizenden mensen Gifteez gebruiken voor hun cadeau-ideeën
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 opacity-0 animate-fade-in-up transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${1600 + index * 100}ms` }}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
