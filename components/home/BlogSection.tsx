import React from 'react'
import { useBlogContext } from '../../contexts/BlogContext'
import ImageWithFallback from '../ImageWithFallback'
import type { BlogPost } from '../../types'

interface BlogSectionProps {
  onViewBlog: () => void
}

// Categorie kleuren matching BlogPage stijl
const getCategoryStyle = (category: string) => {
  const styles: Record<string, { bg: string; text: string }> = {
    'Gift Guides': { bg: 'bg-rose-100', text: 'text-rose-700' },
    Trends: { bg: 'bg-blue-100', text: 'text-blue-700' },
    Tips: { bg: 'bg-amber-100', text: 'text-amber-700' },
    Inspiratie: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    Lifestyle: { bg: 'bg-purple-100', text: 'text-purple-700' },
    Seizoen: { bg: 'bg-orange-100', text: 'text-orange-700' },
  }
  return styles[category] || { bg: 'bg-slate-100', text: 'text-slate-700' }
}

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const categoryStyle = getCategoryStyle(post.category)

  return (
    <a
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-rose-200/30 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Afbeelding */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <ImageWithFallback
          src={post.heroImage || post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Categorie & datum */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${categoryStyle.bg} ${categoryStyle.text}`}
          >
            {post.category}
          </span>
          <span className="text-xs text-slate-400">
            {new Date(post.publishedDate).toLocaleDateString('nl-NL', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>

        {/* Titel */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 mb-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-slate-600 line-clamp-2 flex-1">{post.excerpt}</p>

        {/* CTA */}
        <div className="mt-4 flex items-center text-sm font-semibold text-rose-600 group-hover:text-rose-700">
          Lees artikel
          <svg
            className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </a>
  )
}

const BlogSection: React.FC<BlogSectionProps> = ({ onViewBlog }) => {
  const { posts, loading } = useBlogContext()

  // Neem de 3 nieuwste posts
  const latestPosts = posts
    .filter((post) => !post.isDraft && post.published !== false)
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, 3)

  // Geen posts of nog aan het laden
  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-6 w-32 bg-slate-200 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-10 w-64 bg-slate-200 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-80 bg-slate-100 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="aspect-[16/10] bg-slate-200 animate-pulse" />
                <div className="p-5">
                  <div className="h-4 w-20 bg-slate-200 rounded-full mb-3 animate-pulse" />
                  <div className="h-6 w-full bg-slate-200 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Geen posts beschikbaar
  if (latestPosts.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-700 text-sm font-semibold mb-4">
            📝 Nieuw op de blog
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
            Inspiratie &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
              Cadeau Tips
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ontdek de nieuwste trends, handige tips en creatieve cadeau-ideeën in onze blog.
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {latestPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onViewBlog}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            Bekijk alle artikelen
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default BlogSection
