import type React from 'react'
import { useEffect } from 'react'

interface MetaProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  pinterestImage?: string // Pinterest-specific image (with text overlay)
  type?: 'website' | 'article'
  // Pinterest Rich Pins - Article metadata
  author?: string
  publishedDate?: string
  category?: string
  keywords?: string[]
}

// Lightweight meta tag manager without extra dependency
export const Meta: React.FC<MetaProps> = ({
  title,
  description,
  canonical,
  ogImage,
  pinterestImage,
  type = 'website',
  author,
  publishedDate,
  category,
  keywords,
}) => {
  useEffect(() => {
    document.title = title

    const ensureTag = (selector: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(selector) as HTMLElement | null
      if (!el) {
        el = create()
        document.head.appendChild(el)
      }
      return el
    }

    // Description
    const descTag = ensureTag('meta[name="description"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'description')
      return m
    })
    descTag.setAttribute('content', description)

    // Keywords for Pinterest SEO
    if (keywords && keywords.length > 0) {
      const keywordsTag = ensureTag('meta[name="keywords"]', () => {
        const m = document.createElement('meta')
        m.setAttribute('name', 'keywords')
        return m
      })
      keywordsTag.setAttribute('content', keywords.join(', '))
    }

    if (canonical) {
      const linkCanonical = ensureTag('link[rel="canonical"]', () => {
        const l = document.createElement('link')
        l.setAttribute('rel', 'canonical')
        return l
      })
      linkCanonical.setAttribute('href', canonical)
    }

    // Open Graph tags (used by Pinterest)
    const ogPairs: Array<[string, string]> = [
      ['og:title', title],
      ['og:description', description],
      ['og:type', type],
      ['og:site_name', 'Gifteez.nl'],
    ]
    if (ogImage) ogPairs.push(['og:image', ogImage])
    if (canonical) ogPairs.push(['og:url', canonical])

    // Pinterest Rich Pins - Article metadata
    if (type === 'article') {
      if (author) ogPairs.push(['article:author', author])
      if (publishedDate) ogPairs.push(['article:published_time', publishedDate])
      if (category) ogPairs.push(['article:section', category])
      if (keywords && keywords.length > 0) {
        keywords.forEach((keyword) => {
          ogPairs.push(['article:tag', keyword])
        })
      }
    }

    ogPairs.forEach(([prop, value]) => {
      const tag = ensureTag(`meta[property='${prop}']`, () => {
        const m = document.createElement('meta')
        m.setAttribute('property', prop)
        return m
      })
      tag.setAttribute('content', value)
    })

    // Twitter Card tags (also supported by Pinterest)
    const twitterCard = ensureTag("meta[name='twitter:card']", () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'twitter:card')
      return m
    })
    twitterCard.setAttribute('content', 'summary_large_image')

    const twitterTitle = ensureTag("meta[name='twitter:title']", () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'twitter:title')
      return m
    })
    twitterTitle.setAttribute('content', title)

    const twitterDesc = ensureTag("meta[name='twitter:description']", () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'twitter:description')
      return m
    })
    twitterDesc.setAttribute('content', description)

    if (ogImage) {
      const twitterImage = ensureTag("meta[name='twitter:image']", () => {
        const m = document.createElement('meta')
        m.setAttribute('name', 'twitter:image')
        return m
      })
      twitterImage.setAttribute('content', ogImage)
    }

    // Pinterest-specific meta tags
    const pinterestDesc = ensureTag("meta[name='pinterest:description']", () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'pinterest:description')
      return m
    })
    pinterestDesc.setAttribute('content', description)

    // Pinterest-specific image (if provided, otherwise falls back to ogImage)
    if (pinterestImage || ogImage) {
      const pinterestImg = ensureTag("meta[property='pinterest:image']", () => {
        const m = document.createElement('meta')
        m.setAttribute('property', 'pinterest:image')
        return m
      })
      pinterestImg.setAttribute('content', pinterestImage || ogImage || '')
    }

    // Enable Pinterest Rich Pins
    const richPin = ensureTag("meta[name='pinterest-rich-pin']", () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'pinterest-rich-pin')
      return m
    })
    richPin.setAttribute('content', 'true')
  }, [title, description, canonical, ogImage, pinterestImage, type, author, publishedDate, category, keywords])

  return null // Head side-effects only
}

export default Meta
