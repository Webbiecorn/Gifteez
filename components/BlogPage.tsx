import React, { useMemo, useState, useEffect } from 'react'
import { useBlogContext } from '../contexts/BlogContext'
import ImageWithFallback from './ImageWithFallback'
import JsonLd from './JsonLd'
import Container from './layout/Container'
import Meta from './Meta'
import type { BlogPost, NavigateTo } from '../types'

/* ─────────────────────────────────────────────────────────────
   HELPER FUNCTIONS
   ───────────────────────────────────────────────────────────── */

const getReadingTime = (text: string) => {
  if (!text) return 1
  const wordCount = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/* ─────────────────────────────────────────────────────────────
   CATEGORY TABS
   ───────────────────────────────────────────────────────────── */

type CategoryTab = {
  id: string
  label: string
  emoji: string
}

const DEFAULT_CATEGORIES: CategoryTab[] = [
  { id: 'all', label: 'Alle Artikelen', emoji: '✨' },
  { id: 'Cadeaugids', label: 'Cadeaugidsen', emoji: '🎁' },
  { id: 'Tech', label: 'Tech', emoji: '🎧' },
  { id: 'Wellness', label: 'Wellness', emoji: '🧘' },
  { id: 'Duurzaam', label: 'Duurzaam', emoji: '🌱' },
  { id: 'Nieuws', label: 'Nieuws', emoji: '📰' },
]

/* ─────────────────────────────────────────────────────────────
   BLOG CARD COMPONENT
   ───────────────────────────────────────────────────────────── */

interface BlogCardProps {
  post: BlogPost
  navigateTo: NavigateTo
  featured?: boolean
}

const BlogCard: React.FC<BlogCardProps> = ({ post, navigateTo, featured = false }) => {
  const readingTime = getReadingTime(post.excerpt)

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-rose-200 ${
        featured ? 'md:col-span-2 lg:flex-row' : ''
      }`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${featured ? 'lg:w-1/2' : 'h-48'}`}>
        <ImageWithFallback
          src={post.imageUrl}
          alt={post.title}
          className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            featured ? 'h-64 lg:h-full' : 'h-48'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Category badge on image */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-gray-700">
            {post.category}
          </span>
        </div>

        {/* Reading time on image */}
        <div className="absolute bottom-4 right-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
            📖 {readingTime} min
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={`flex flex-1 flex-col p-5 ${featured ? 'lg:p-8' : ''}`}>
        <div className="flex-1">
          <h3
            className={`font-bold text-gray-900 leading-tight group-hover:text-rose-600 transition-colors ${
              featured ? 'text-xl md:text-2xl' : 'text-lg'
            }`}
          >
            {post.title}
          </h3>
          <p className={`mt-2 text-gray-600 line-clamp-3 ${featured ? 'text-base' : 'text-sm'}`}>
            {post.excerpt}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-xs font-bold">
              {post.author.name.charAt(0)}
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{post.author.name}</p>
              <p className="text-xs text-gray-500">{formatDate(post.publishedDate)}</p>
            </div>
          </div>
          <span className="text-rose-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
            Lees meer →
          </span>
        </div>
      </div>

      {/* Clickable overlay */}
      <a
        href={`/blog/${post.slug}`}
        onClick={(e) => {
          e.preventDefault()
          navigateTo('blogDetail', { slug: post.slug })
        }}
        className="absolute inset-0"
        aria-label={`Lees ${post.title}`}
      />
    </article>
  )
}

/* ─────────────────────────────────────────────────────────────
   FEATURED POST HERO
   ───────────────────────────────────────────────────────────── */

interface FeaturedHeroProps {
  post: BlogPost
  navigateTo: NavigateTo
}

const FeaturedHero: React.FC<FeaturedHeroProps> = ({ post, navigateTo }) => {
  const readingTime = getReadingTime(post.excerpt)

  return (
    <article className="group relative overflow-hidden rounded-3xl bg-gray-900 shadow-2xl">
      {/* Background image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={post.imageUrl}
          alt={post.title}
          className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/40" />
      </div>

      {/* Content */}
      <div className="relative p-8 md:p-12 lg:p-16 flex flex-col justify-end min-h-[400px] md:min-h-[500px]">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-1.5 text-sm font-semibold text-white">
            ⭐ Uitgelicht
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-white">
            {post.category}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-white">
            📖 {readingTime} min leestijd
          </span>
        </div>

        {/* Title & excerpt */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
          {post.title}
        </h2>
        <p className="text-lg text-white/80 max-w-2xl line-clamp-3 mb-6">{post.excerpt}</p>

        {/* Author & CTA */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigateTo('blogDetail', { slug: post.slug })}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-rose-50 hover:scale-105"
          >
            Lees het artikel
            <span>→</span>
          </button>
          <div className="flex items-center gap-3 text-white/80">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
              {post.author.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-white">{post.author.name}</p>
              <p className="text-sm text-white/60">{formatDate(post.publishedDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clickable overlay */}
      <a
        href={`/blog/${post.slug}`}
        onClick={(e) => {
          e.preventDefault()
          navigateTo('blogDetail', { slug: post.slug })
        }}
        className="absolute inset-0"
        aria-label={`Lees ${post.title}`}
      />
    </article>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN BLOG PAGE COMPONENT
   ───────────────────────────────────────────────────────────── */

const BlogPage: React.FC<{ navigateTo: NavigateTo }> = ({ navigateTo }) => {
  const { posts, loading } = useBlogContext()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // SEO meta tags
  useEffect(() => {
    document.title = 'Blog & Cadeaugidsen | Gifteez.nl'
  }, [])

  // Get unique categories from posts
  const categories = useMemo(() => {
    const uniqueCategories = new Set(posts.map((p) => p.category))
    return DEFAULT_CATEGORIES.filter(
      (cat) => cat.id === 'all' || uniqueCategories.has(cat.id) || uniqueCategories.has(cat.label)
    )
  }, [posts])

  // Filter posts
  const filteredPosts = useMemo(() => {
    let result = posts

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter(
        (post) => post.category === activeCategory || post.category === activeCategory
      )
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query)
      )
    }

    return result
  }, [posts, activeCategory, searchQuery])

  // Featured post (first post when no filters)
  const featuredPost = useMemo(() => {
    if (activeCategory === 'all' && !searchQuery && posts.length > 0) {
      return posts[0]
    }
    return null
  }, [posts, activeCategory, searchQuery])

  // Grid posts (exclude featured when showing)
  const gridPosts = useMemo(() => {
    if (featuredPost) {
      return filteredPosts.filter((p) => p.slug !== featuredPost.slug)
    }
    return filteredPosts
  }, [filteredPosts, featuredPost])

  // JSON-LD Schema
  const canonicalHost =
    typeof window !== 'undefined' ? window.location.origin : 'https://gifteez.nl'

  const itemListSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Gifteez Blog & Cadeaugidsen',
      itemListElement: posts.slice(0, 20).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${canonicalHost}/blog/${p.slug}`,
        name: p.title,
      })),
    }),
    [posts, canonicalHost]
  )

  // Loading state
  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Artikelen laden...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Meta
        title="Blog & Cadeaugidsen | Gifteez.nl"
        description="Ontdek de beste cadeautips, reviews en inspiratie. Van tech gadgets tot wellness producten — vind het perfecte cadeau."
        canonical="https://gifteez.nl/blog"
        ogImage="https://gifteez.nl/images/og-tech-gifts-2025.png"
      />
      <JsonLd data={itemListSchema} id="jsonld-blog-itemlist" />

      {/* ─────────────────────────────────────────────────────────
          HERO SECTION
         ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        </div>

        <Container>
          <div className="relative py-16 md:py-20">
            <div className="max-w-3xl mx-auto text-center mb-12">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm ring-1 ring-rose-100 mb-6">
                <span className="text-lg">📝</span>
                <span>{posts.length} artikelen beschikbaar</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
                Blog &{' '}
                <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                  Cadeaugidsen
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Tips, reviews en inspiratie voor het perfecte cadeau. Van tech gadgets tot wellness
                — ontdek wat anderen blij maakt.
              </p>
            </div>

            {/* Featured post */}
            {featuredPost && <FeaturedHero post={featuredPost} navigateTo={navigateTo} />}
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────
          FILTER & ARTICLES SECTION
         ───────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <Container>
          {/* Section header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Alle artikelen</h2>
            <p className="mt-2 text-gray-600">Filter op categorie of zoek op trefwoord</p>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id
              const count =
                cat.id === 'all'
                  ? posts.length
                  : posts.filter((p) => p.category === cat.id || p.category === cat.label).length

              if (count === 0 && cat.id !== 'all') return null

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                      : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-rose-300 hover:text-rose-600'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
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

          {/* Search bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
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
                placeholder="Zoek artikelen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Results count */}
          <div className="text-center mb-8">
            <span className="text-sm text-gray-500">
              {gridPosts.length} artikel{gridPosts.length !== 1 ? 'en' : ''} gevonden
              {(activeCategory !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setActiveCategory('all')
                    setSearchQuery('')
                  }}
                  className="ml-2 text-rose-600 hover:text-rose-700 font-medium"
                >
                  Reset filters
                </button>
              )}
            </span>
          </div>

          {/* Articles grid */}
          {gridPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post, index) => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  navigateTo={navigateTo}
                  featured={index === 0 && activeCategory === 'all' && !searchQuery}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen artikelen gevonden</h3>
              <p className="text-gray-600 mb-6">Probeer andere filters of zoektermen</p>
              <button
                onClick={() => {
                  setActiveCategory('all')
                  setSearchQuery('')
                }}
                className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600"
              >
                Bekijk alle artikelen
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
              Ontdek onze cadeaugidsen 🎁
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Meer dan 30 handgeselecteerde cadeaugidsen voor elke gelegenheid en elk budget
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigateTo('cadeausHub')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600 hover:scale-105"
              >
                <span>📚</span>
                Bekijk alle gidsen
              </button>
              <button
                onClick={() => navigateTo('giftFinder')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <span>🤖</span>
                AI Gift Finder
              </button>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

export default BlogPage
