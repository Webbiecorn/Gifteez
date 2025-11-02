import React from 'react'
import type { BlogPost } from '../types'

interface BlogPostingSchemaProps {
  post: BlogPost
}

const BlogPostingSchema: React.FC<BlogPostingSchemaProps> = ({ post }) => {
  // Extract text content from blog for wordCount and articleBody
  const extractTextContent = () => {
    if (!post.content || (Array.isArray(post.content) && post.content.length === 0)) {
      return post.excerpt || ''
    }

    if (typeof post.content === 'string') {
      return post.content
        .replace(/<[^>]*>/g, ' ')
        .trim()
        .slice(0, 5000)
    }

    return post.content
      .map((block) => {
        if (block.type === 'paragraph' && typeof block.content === 'string') {
          return block.content.replace(/<[^>]*>/g, ' ').trim()
        }
        if (block.type === 'heading' && typeof block.content === 'string') {
          return block.content
        }
        return ''
      })
      .filter(Boolean)
      .join(' ')
      .slice(0, 5000) // Limit for performance
  }

  const textContent = extractTextContent()
  const wordCount = textContent.split(/\s+/).filter(Boolean).length

  // Get proper author info
  const authorName = post.author?.name || 'Kevin van Gifteez'
  const authorAvatar = post.author?.avatarUrl || 'https://i.pravatar.cc/150?u=kevin'

  // Ensure proper image URLs (handle both relative and absolute) with safe fallback
  const imageUrl = (() => {
    const src = post.imageUrl || '/og-image.png'
    if (src.startsWith('http')) return src
    // ensure leading slash
    const normalized = src.startsWith('/') ? src : `/${src}`
    return `https://gifteez.nl${normalized}`
  })()

  const mentions: Array<Record<string, unknown>> = []

  const normalizedSlug = post.slug?.toLowerCase() ?? ''
  if (normalizedSlug.includes('partypro')) {
    mentions.push({
      '@type': 'Organization',
      name: 'PartyPro.nl',
      url: 'https://www.partypro.nl',
      sameAs: ['https://www.instagram.com/partypronl', 'https://www.facebook.com/partypronl'],
      image: 'https://gifteez.nl/images/blog-partypro-headerafb.png',
      description:
        'PartyPro.nl levert complete feestdecoratie, ballonbogen en themapakketten die we in onze Partner Spotlight uitlichten.',
    })
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    alternativeHeadline: post.excerpt?.slice(0, 110) || post.title,
    description: post.excerpt || post.title,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1536,
      height: 1024,
      caption: post.title,
    },
    datePublished: post.publishedDate,
    dateModified: post.publishedDate,
    author: {
      '@type': 'Person',
      name: authorName,
      url: 'https://gifteez.nl/over-ons',
      image: authorAvatar,
      sameAs: ['https://www.linkedin.com/company/gifteez', 'https://www.pinterest.com/gifteez_nl'],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gifteez',
      url: 'https://gifteez.nl',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gifteez.nl/images/gifteez-logo.png',
        width: 512,
        height: 512,
      },
      sameAs: ['https://www.pinterest.com/gifteez_nl', 'https://www.linkedin.com/company/gifteez'],
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://gifteez.nl/blog/${post.slug}`,
      url: `https://gifteez.nl/blog/${post.slug}`,
      name: post.title,
      description: post.excerpt,
    },
    articleSection: post.category || 'Cadeaus',
    keywords: post.tags?.join(', ') || 'cadeaus, cadeau-ideeën, sinterklaas, kerst, gifteez',
    wordCount: wordCount,
    articleBody: textContent,
    inLanguage: 'nl-NL',
    copyrightYear: new Date(post.publishedDate).getFullYear(),
    copyrightHolder: {
      '@type': 'Organization',
      name: 'Gifteez',
      url: 'https://gifteez.nl',
    },
    isAccessibleForFree: true,
    isPartOf: {
      '@type': 'Blog',
      '@id': 'https://gifteez.nl/blog',
      name: 'Gifteez Blog',
      description: 'Cadeau-ideeën, gift guides en inspiratie voor elk moment',
    },
    ...(post.tags &&
      post.tags.length > 0 && {
        about: post.tags.slice(0, 5).map((tag) => ({
          '@type': 'Thing',
          name: tag,
        })),
      }),
    ...(mentions.length > 0 && { mentions }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default BlogPostingSchema
