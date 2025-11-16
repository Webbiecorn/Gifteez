import type React from 'react'
import { useEffect, useMemo } from 'react'
import type { BlogPost } from '../types'

interface BlogPostingSchemaProps {
  post: BlogPost
}

const BlogPostingSchema: React.FC<BlogPostingSchemaProps> = ({ post }) => {
  const schema = useMemo(() => {
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
        .slice(0, 5000)
    }

    const textContent = extractTextContent()
    const wordCount = textContent.split(/\s+/).filter(Boolean).length

    const authorName = post.author?.name || 'Kevin van Gifteez'
    const authorAvatar = post.author?.avatarUrl || 'https://i.pravatar.cc/150?u=kevin'

    const imageUrl = (() => {
      const src = post.imageUrl || '/og-image.png'
      if (src.startsWith('http')) return src
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

    return {
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
        sameAs: [
          'https://www.linkedin.com/company/gifteez',
          'https://www.pinterest.com/gifteez_nl',
        ],
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
        sameAs: [
          'https://www.pinterest.com/gifteez_nl',
          'https://www.linkedin.com/company/gifteez',
        ],
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
      wordCount,
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
  }, [post])

  useEffect(() => {
    if (!schema) {
      return
    }

    const scriptId = 'jsonld-blog-posting'
    const head = document.head
    if (!head) {
      return
    }

    let script = head.querySelector(`#${scriptId}`) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = scriptId

      const firstJsonLd = head.querySelector('script[type="application/ld+json"]')
      if (firstJsonLd?.parentNode) {
        firstJsonLd.parentNode.insertBefore(script, firstJsonLd)
      } else if (head.firstChild) {
        head.insertBefore(script, head.firstChild)
      } else {
        head.appendChild(script)
      }
    }

    script.textContent = JSON.stringify(schema)

    return () => {
      // Keep script mounted for SPA navigation parity
      // Cleanup intentionally omitted
    }
  }, [schema])

  return null
}

export default BlogPostingSchema
