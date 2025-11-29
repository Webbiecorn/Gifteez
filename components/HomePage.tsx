import React, { useEffect } from 'react'
import HeroHome from './HeroHome'
import {
  GuideShowcase,
  DealsSection,
  BlogSection,
  NewsletterSection,
  TestimonialsSection,
} from './home'
import HowItWorks from './HowItWorks'
import type { NavigateTo } from '../types'

interface HomePageProps {
  navigateTo: NavigateTo
}

const HomePage: React.FC<HomePageProps> = ({ navigateTo }) => {
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

  const handleNewsletterSubmit = (email: string) => {
    console.log('Newsletter subscription:', email)
    navigateTo('download')
  }

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <HeroHome
        onStartQuiz={() => navigateTo('giftFinder')}
        onViewGuides={() => navigateTo('cadeausHub')}
      />

      {/* How It Works */}
      <HowItWorks />

      {/* Guide Showcase - Dark section */}
      <GuideShowcase onViewAllGuides={() => navigateTo('cadeausHub')} />

      {/* Deals Section - Light section */}
      <DealsSection onViewDeals={() => navigateTo('deals')} />

      {/* Blog Section - Light gradient section */}
      <BlogSection onViewBlog={() => navigateTo('blog')} />

      {/* Newsletter Section - Dark section */}
      <NewsletterSection onSubmit={handleNewsletterSubmit} />

      {/* Testimonials - Light section */}
      <TestimonialsSection />
    </div>
  )
}

export default HomePage
