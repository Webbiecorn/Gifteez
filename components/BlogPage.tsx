import React, { useMemo, useState } from 'react'
import { useBlogContext } from '../contexts/BlogContext'
import Breadcrumbs from './Breadcrumbs'
import Card from './Card'
import {
  SearchIcon,
  BookOpenIcon,
  CalendarIcon,
  UserIcon,
  SparklesIcon,
  MenuIcon,
  TargetIcon,
  TagIcon,
} from './IconComponents'
import ImageWithFallback from './ImageWithFallback'
import JsonLd from './JsonLd'
import { Container } from './layout/Container'
import Meta from './Meta'
import { NewsletterSignup } from './NewsletterSignup'
import type { BlogPost, NavigateTo } from '../types'

// Cache-bust version: 2025-10-26-v3-fixed-author-join
const getReadingTime = (text: string) => {
  if (!text) return 1
  const wordCount = text.split(/\s+/).filter(Boolean).length
  const wordsPerMinute = 200 // Average reading speed
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

const SpotlightHeroCard: React.FC<{ post: BlogPost; navigateTo: NavigateTo }> = ({
  post,
  navigateTo,
}) => {
  const formattedDate = new Date(post.publishedDate).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const readingTime = getReadingTime(post.excerpt)

  return (
    <article className="relative h-full">
      <div className="group relative flex h-full flex-col overflow-hidden rounded-[36px] border border-white/10 bg-slate-900 text-white shadow-[0_50px_110px_-70px_rgba(15,23,42,0.75)] transition-transform duration-500 hover:-translate-y-1">
        <ImageWithFallback
          src={post.imageUrl}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/20" />

        <div className="relative flex h-full flex-col justify-end gap-6 p-8 md:p-12">
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 backdrop-blur">
            Spotlight
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-white/80">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
              <TagIcon className="h-4 w-4" />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
              <CalendarIcon className="h-4 w-4" />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
              <BookOpenIcon className="h-4 w-4" />
              {readingTime} min leestijd
            </span>
          </div>

          <div>
            <h2 className="font-display text-[2rem] font-bold leading-tight text-white md:text-[2.5rem]">
              {post.title}
            </h2>
            <p className="mt-4 text-base text-white/80 md:text-lg md:leading-relaxed line-clamp-5">
              {post.excerpt}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-6 py-2 font-semibold shadow-lg">
              <SparklesIcon className="h-4 w-4" />
              Uitgelicht door Gifteez
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 font-semibold text-white/90 backdrop-blur-sm">
              <TargetIcon className="h-4 w-4" />
              Ontdek de gids
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('blogDetail', { slug: post.slug })}
          className="absolute inset-0"
          aria-label={`Lees ${post.title}`}
        />
      </div>
    </article>
  )
}

const SpotlightSupportCard: React.FC<{ post: BlogPost; navigateTo: NavigateTo; index: number }> = ({
  post,
  navigateTo,
  index,
}) => {
  const formattedDate = new Date(post.publishedDate).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const readingTime = getReadingTime(post.excerpt)

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100/80 bg-white/90 shadow-[0_40px_90px_-70px_rgba(15,23,42,0.55)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_50px_110px_-70px_rgba(244,63,94,0.35)]">
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={post.imageUrl}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-wide text-white/90">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
            <SparklesIcon className="h-3 w-3" />
            {index === 0 ? 'Nieuw' : 'Aanrader'}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
            <BookOpenIcon className="h-3 w-3" />
            {readingTime} min
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-4 p-6">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
          <TagIcon className="h-3 w-3" /> {post.category}
        </span>
        <h3 className="font-display text-xl font-bold text-primary leading-tight">{post.title}</h3>
        <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">{post.excerpt}</p>

        <div className="flex items-center gap-3 pt-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white font-bold text-sm shadow-sm">
            ✍️
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-900">{post.author.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CalendarIcon className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigateTo('blogDetail', { slug: post.slug })}
        className="absolute inset-0"
        aria-label={`Lees ${post.title}`}
      />
    </article>
  )
}

const ArchiveListItem: React.FC<{ post: BlogPost; navigateTo: NavigateTo }> = ({
  post,
  navigateTo,
}) => {
  const formattedDate = new Date(post.publishedDate).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <li className="relative pl-10">
      <div className="absolute left-0 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-accent" />
      <button
        type="button"
        onClick={() => navigateTo('blogDetail', { slug: post.slug })}
        className="text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-wide text-accent/80">
          {post.category}
        </span>
        <p className="mt-2 font-display text-lg font-semibold text-primary transition-colors duration-200 hover:text-accent">
          {post.title}
        </p>
      </button>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span className="inline-flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {formattedDate}
        </span>
        <span className="inline-flex items-center gap-2">
          <BookOpenIcon className="h-4 w-4" />
          {getReadingTime(post.excerpt)} min leestijd
        </span>
      </div>
      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
    </li>
  )
}

const BlogCard: React.FC<{ post: BlogPost; navigateTo: NavigateTo; isFeatured?: boolean }> = ({
  post,
  navigateTo,
  isFeatured = false,
}) => {
  const formattedDate = new Date(post.publishedDate).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const readingTime = getReadingTime(post.excerpt)

  return (
    <Card
      as="article"
      variant={isFeatured ? 'highlight' : 'interactive'}
      className={`group relative overflow-hidden rounded-[28px] border border-slate-100/80 bg-white/90 shadow-[0_40px_100px_-70px_rgba(15,23,42,0.65)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_55px_140px_-80px_rgba(244,63,94,0.35)] ${isFeatured ? 'md:col-span-2 lg:col-span-2' : ''}`}
    >
      <div
        className="relative overflow-hidden"
        onClick={() => navigateTo('blogDetail', { slug: post.slug })}
      >
        <ImageWithFallback
          src={post.imageUrl}
          alt={post.title}
          className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${isFeatured ? 'h-64 md:h-80' : 'h-48'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />

        <div className="absolute top-4 left-4 flex flex-wrap gap-2 text-xs font-semibold text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur">
            <TagIcon className="h-3 w-3" />
            {post.category}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur">
            <BookOpenIcon className="h-3 w-3" />
            {readingTime} min
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="rounded-full bg-white/90 p-4 shadow-lg">
            <TargetIcon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      <div className={`flex flex-col p-6 md:p-7 ${isFeatured ? 'md:p-9' : ''}`}>
        <h3
          className={`font-display font-bold text-primary leading-tight transition-colors duration-300 group-hover:text-accent ${isFeatured ? 'text-xl md:text-2xl' : 'text-lg'}`}
        >
          <button
            onClick={() => navigateTo('blogDetail', { slug: post.slug })}
            className="text-left"
          >
            {post.title}
          </button>
        </h3>

        <p
          className={`mt-3 text-gray-600 leading-relaxed ${isFeatured ? 'text-base' : 'text-sm line-clamp-4'}`}
        >
          {post.excerpt}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100/70 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white font-bold text-sm shadow-sm">
              ✍️
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CalendarIcon className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigateTo('blogDetail', { slug: post.slug })}
            className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors duration-300 hover:border-accent/30 hover:text-accent"
          >
            <span>Lees meer</span>
            <BookOpenIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </Card>
  )
}

const BlogPage: React.FC<{ navigateTo: NavigateTo }> = ({ navigateTo }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedAuthor, setSelectedAuthor] = useState('All')
  const [selectedYear, setSelectedYear] = useState('All')
  const { posts, loading } = useBlogContext()

  const publishedPosts = posts

  const itemListSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Cadeaugidsen',
      itemListElement: publishedPosts.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${typeof window !== 'undefined' ? window.location.origin : ''}/blog/${p.slug}`,
        name: p.title,
        datePublished: p.publishedDate,
      })),
    }),
    [publishedPosts]
  )

  const categories = useMemo(
    () => ['All', ...new Set(publishedPosts.map((p) => p.category))],
    [publishedPosts]
  )
  const authors = useMemo(
    () => ['All', ...new Set(publishedPosts.map((p) => p.author.name))],
    [publishedPosts]
  )
  const years = useMemo(() => {
    const allYears = new Set(
      publishedPosts.map((p) => new Date(p.publishedDate).getFullYear().toString())
    )
    const sortedYears = Array.from(allYears).sort((a, b) => Number(b) - Number(a))
    return ['All', ...sortedYears]
  }, [publishedPosts])

  const categoryHighlights = useMemo(() => {
    const counts = new Map<string, number>()
    publishedPosts.forEach((post) => {
      counts.set(post.category, (counts.get(post.category) ?? 0) + 1)
    })
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [publishedPosts])

  const featuredPost = publishedPosts[0]
  const otherPosts = featuredPost ? publishedPosts.slice(1) : publishedPosts

  const filteredPosts = useMemo(() => {
    return otherPosts
      .filter((post) => selectedCategory === 'All' || post.category === selectedCategory)
      .filter((post) => selectedAuthor === 'All' || post.author.name === selectedAuthor)
      .filter(
        (post) =>
          selectedYear === 'All' ||
          new Date(post.publishedDate).getFullYear().toString() === selectedYear
      )
      .filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [otherPosts, searchQuery, selectedCategory, selectedAuthor, selectedYear])

  const isFilteringActive =
    selectedCategory !== 'All' ||
    selectedAuthor !== 'All' ||
    selectedYear !== 'All' ||
    searchQuery.trim() !== ''

  const spotlightPrimaryPost = useMemo(() => {
    if (isFilteringActive || filteredPosts.length === 0) {
      return undefined
    }
    return filteredPosts[0]
  }, [filteredPosts, isFilteringActive])

  const supportingSpotlightPosts = useMemo(() => {
    if (isFilteringActive) {
      return []
    }
    const startIndex = spotlightPrimaryPost ? 1 : 0
    return filteredPosts.slice(startIndex, startIndex + 2)
  }, [filteredPosts, isFilteringActive, spotlightPrimaryPost])

  const remainingPostsForGrid = useMemo(() => {
    if (isFilteringActive) {
      return filteredPosts
    }
    const offset = (spotlightPrimaryPost ? 1 : 0) + supportingSpotlightPosts.length
    return filteredPosts.slice(offset)
  }, [filteredPosts, isFilteringActive, spotlightPrimaryPost, supportingSpotlightPosts])

  const curatedGridPosts = useMemo(() => {
    if (isFilteringActive) {
      return remainingPostsForGrid
    }
    return remainingPostsForGrid.slice(0, 6)
  }, [remainingPostsForGrid, isFilteringActive])

  const archivePosts = useMemo(() => {
    if (isFilteringActive) {
      return []
    }
    return remainingPostsForGrid.slice(6)
  }, [remainingPostsForGrid, isFilteringActive])

  const handleCategoryQuickSelect = (category: string) => {
    setSelectedCategory(category)
    if (typeof window !== 'undefined') {
      // Small delay to ensure state update and re-render
      setTimeout(() => {
        const resultsEl = document.getElementById('blog-results')
        resultsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const handleCategoryFilterClick = (category: string) => {
    setSelectedCategory(category)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const resultsEl = document.getElementById('blog-results')
        resultsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const resultsHeadline = isFilteringActive ? 'Gefilterde cadeaugidsen' : 'Nieuwste cadeaugidsen'
  const resultsDescription = isFilteringActive
    ? 'Pas je filters aan of wis ze om alle cadeaugidsen weer te geven.'
    : 'Vers van de pers — dit zijn de meest recente cadeaugidsen van het Gifteez-team.'
  const resultsCountLabel = `${isFilteringActive ? filteredPosts.length : curatedGridPosts.length} ${isFilteringActive ? (filteredPosts.length === 1 ? 'gids' : 'gidsen') : curatedGridPosts.length === 1 ? 'gids' : 'gidsen'}`

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedAuthor('All')
    setSelectedYear('All')
  }

  if (loading && publishedPosts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-muted-rose/40 to-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Blogposts laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-muted-rose/40 to-white">
      <Meta
        title="Cadeaugidsen & Blog — Gifteez.nl"
        description="Inspiratie, tips en de beste cadeau-ideeën voor elke gelegenheid. Ontdek onze nieuwste cadeaugidsen op Gifteez."
        canonical="https://gifteez.nl/blog"
        ogImage="https://gifteez.nl/images/og-tech-gifts-2025.png"
      />
      <JsonLd data={itemListSchema} id="jsonld-blog-itemlist" />

      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#f43f5e1f,transparent_55%),radial-gradient(circle_at_bottom_right,#0f172a22,transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-muted-rose/40" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-24 h-56 w-56 rounded-full bg-white/50 blur-3xl" />
          <div className="absolute right-10 bottom-16 h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
        </div>

        <Container size="xl" className="relative z-10 py-20 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_minmax(0,0.9fr)]">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/20 ring-4 ring-accent/20 lg:h-24 lg:w-24">
                <BookOpenIcon className="h-10 w-10 lg:h-12 lg:w-12" />
              </div>
              <div className="space-y-4">
                <h1 className="typo-h1 leading-[1.05] text-slate-900">
                  Cadeau <span className="text-accent">Inspiratie</span> voor elke gelegenheid
                </h1>
                <p className="typo-lead mx-auto max-w-2xl text-slate-600 lg:mx-0">
                  Jouw bron voor inspiratie, tips en de beste cadeau-ideeën voor elke gelegenheid.
                  Ontdek onze nieuwste cadeaugidsen en tover een glimlach op elk gezicht.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 text-sm font-medium text-accent/90 lg:justify-start">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2">
                  <SparklesIcon className="h-4 w-4" />
                  Expert tips
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2">
                  <UserIcon className="h-4 w-4" />
                  Voor ieder budget
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2">
                  <BookOpenIcon className="h-4 w-4" />
                  Gratis cadeaugidsen
                </div>
              </div>
            </div>
            {featuredPost ? (
              <article className="group relative h-full overflow-hidden rounded-[40px] border border-white/10 bg-slate-900/80 shadow-[0_50px_100px_-60px_rgba(15,23,42,0.7)] backdrop-blur">
                <div className="absolute inset-0">
                  <ImageWithFallback
                    src={featuredPost.imageUrl}
                    alt={featuredPost.title}
                    className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-900/20" />
                </div>
                <div className="relative flex h-full flex-col justify-end gap-6 p-8 md:p-10">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/80">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                      <TagIcon className="h-3 w-3" />
                      {featuredPost.category}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(featuredPost.publishedDate).toLocaleDateString('nl-NL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                      <BookOpenIcon className="h-3 w-3" />
                      {getReadingTime(featuredPost.excerpt)} min leestijd
                    </span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                      Uitgelicht
                    </p>
                    <h2 className="font-display text-2xl font-bold leading-snug text-white md:text-3xl">
                      {featuredPost.title}
                    </h2>
                    <p className="text-sm text-white/80 line-clamp-4 md:text-base">
                      {featuredPost.excerpt}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigateTo('blogDetail', { slug: featuredPost.slug })}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-white/40 transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      <TargetIcon className="h-4 w-4" />
                      Lees de gids
                    </button>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70">
                      <UserIcon className="h-4 w-4" />
                      {featuredPost.author.name}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('blogDetail', { slug: featuredPost.slug })}
                  className="absolute inset-0"
                  aria-label={`Lees ${featuredPost.title}`}
                />
              </article>
            ) : (
              <div className="relative rounded-[36px] border border-white/30 bg-white/60 p-8 shadow-xl shadow-white/30 backdrop-blur">
                <div className="space-y-4 text-center lg:text-left">
                  <h2 className="font-display text-2xl font-bold text-primary">
                    Publiceer je eerste gids
                  </h2>
                  <p className="text-sm text-gray-600">
                    Zodra de eerste blog live staat, verschijnt hier een uitgelichte cadeaugids met
                    tips en highlights.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
            {[
              { label: 'Cadeaugidsen', value: publishedPosts.length },
              { label: 'Categorieën', value: categories.length - 1 },
              { label: 'Experts', value: authors.length - 1 },
              { label: 'Inspiratie', value: '24/7' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/60 bg-white/80 p-5 text-slate-700 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.75)] backdrop-blur"
              >
                <div className="text-2xl font-bold text-accent md:text-3xl">{stat.value}</div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container size="xl" className="py-16 space-y-16">
        {!isFilteringActive && (
          <section className="rounded-[40px] bg-white/80 p-8 md:p-10 shadow-[0_45px_120px_-80px_rgba(15,23,42,0.35)] ring-1 ring-white/60 backdrop-blur">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary">
                  Uitgelichte cadeaugidsen
                </h2>
                <p className="max-w-2xl text-gray-600">
                  Een handpicked selectie van gidsen die vandaag in de schijnwerpers staan.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
                <SparklesIcon className="h-4 w-4" />
                Curated door Gifteez
              </div>
            </div>

            {spotlightPrimaryPost ? (
              <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <SpotlightHeroCard post={spotlightPrimaryPost} navigateTo={navigateTo} />
                <div className="flex flex-col gap-6">
                  {supportingSpotlightPosts.length > 0 ? (
                    supportingSpotlightPosts.map((post, index) => (
                      <SpotlightSupportCard
                        key={post.slug}
                        post={post}
                        index={index}
                        navigateTo={navigateTo}
                      />
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-muted-rose/70 bg-white/80 p-10 text-center shadow-inner backdrop-blur">
                      <div className="space-y-3">
                        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted-rose text-accent">
                          <BookOpenIcon className="h-7 w-7" />
                        </div>
                        <h3 className="font-display text-lg font-semibold text-primary">
                          Nog meer inspiratie volgt
                        </h3>
                        <p className="text-sm text-gray-600">
                          Publiceer extra artikelen om dit overzicht te vullen.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-10 rounded-[32px] border border-dashed border-muted-rose/80 bg-white/70 p-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted-rose text-accent">
                  <BookOpenIcon className="h-8 w-8" />
                </div>
                <h2 className="font-display text-2xl font-bold text-primary">
                  Nog geen extra gidsen
                </h2>
                <p className="mt-2 text-gray-600">
                  Zodra er meer artikelen live staan, vind je ze hier terug.
                </p>
              </div>
            )}
          </section>
        )}

        {!isFilteringActive && categoryHighlights.length > 0 && (
          <section className="rounded-[32px] bg-white/80 p-8 md:p-10 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.35)] ring-1 ring-slate-100 backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary">
                  Categorieën om te ontdekken
                </h2>
                <p className="max-w-2xl text-gray-600">
                  Kies snel een thema en wij tonen direct alle bijpassende cadeaugidsen.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
                <SparklesIcon className="h-4 w-4" />
                Trending thema's
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoryHighlights.map(({ name, count }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleCategoryQuickSelect(name)}
                  className={`group flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${selectedCategory === name ? 'ring-2 ring-accent shadow-lg' : ''}`}
                >
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-accent/80">
                      Categorie
                    </span>
                    <h3 className="mt-2 font-display text-lg font-bold text-primary">{name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {count} {count === 1 ? 'gids' : 'gidsen'}
                    </p>
                  </div>
                  <div className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                    <TagIcon className="h-5 w-5" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section
          id="blog-filters"
          className="rounded-[32px] bg-white p-6 md:p-8 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.45)] ring-1 ring-slate-100"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-primary">Categorieën:</span>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryFilterClick(category)}
                    aria-pressed={selectedCategory === category}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${selectedCategory === category ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {category === 'All' ? 'Alle' : category}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span className="sr-only lg:not-sr-only">Auteur</span>
                  <select
                    aria-label="Filter op auteur"
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                  >
                    {authors.map((author) => (
                      <option key={author} value={author}>
                        {author === 'All' ? 'Alle auteurs' : author}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span className="sr-only lg:not-sr-only">Jaar</span>
                  <select
                    aria-label="Filter op publicatiejaar"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year === 'All' ? 'Alle jaren' : year}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Zoek in gidsen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-slate-200 bg-white py-2 pl-12 pr-4 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                    aria-label="Zoek in gidsen"
                  />
                </div>

                {(searchQuery ||
                  selectedCategory !== 'All' ||
                  selectedAuthor !== 'All' ||
                  selectedYear !== 'All') && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors duration-300 hover:bg-slate-200"
                  >
                    <span>Wis filters</span>
                    <MenuIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="blog-results" className="space-y-8">
          <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary">
                {resultsHeadline}
              </h2>
              <p className="max-w-2xl text-gray-600">{resultsDescription}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <SparklesIcon className="h-4 w-4" />
              {resultsCountLabel}
            </div>
          </header>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {curatedGridPosts.map((post) => (
              <BlogCard key={post.slug} post={post} navigateTo={navigateTo} />
            ))}
          </div>

          {curatedGridPosts.length === 0 && (
            <div className="rounded-3xl border border-dashed border-muted-rose/60 bg-white/60 p-12 text-center backdrop-blur">
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted-rose text-accent">
                <SearchIcon className="h-8 w-8" />
              </div>
              <p className="text-lg font-semibold text-gray-700">Geen gidsen gevonden.</p>
              <p className="mt-1 text-sm text-gray-500">
                Pas je filters aan of wis ze om opnieuw te beginnen.
              </p>
            </div>
          )}
        </section>

        {!isFilteringActive && archivePosts.length > 0 && (
          <section className="rounded-[32px] bg-gradient-to-br from-white via-white to-muted-rose/30 p-8 md:p-10 shadow-[0_40px_120px_-90px_rgba(244,63,94,0.35)] ring-1 ring-muted-rose/40">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary">
                  Uit het archief
                </h2>
                <p className="max-w-2xl text-gray-600">
                  Blijf ontdekken met eerdere cadeaugidsen vol inspiratie.
                </p>
              </div>
              <div className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-accent backdrop-blur">
                <CalendarIcon className="h-4 w-4" />
                Historie
              </div>
            </div>
            <ul className="relative space-y-8 before:absolute before:left-[5px] before:top-0 before:h-full before:w-px before:bg-muted-rose/40">
              {archivePosts.map((post) => (
                <ArchiveListItem key={post.slug} post={post} navigateTo={navigateTo} />
              ))}
            </ul>
          </section>
        )}

        <section className="pt-4">
          <NewsletterSignup variant="inline" className="mx-auto max-w-2xl" />
        </section>
      </Container>
    </div>
  )
}

export default BlogPage
