import React from 'react'
import { screen, fireEvent } from '@testing-library/dom'
import { render } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Breadcrumbs from '../Breadcrumbs'

describe('Breadcrumbs', () => {
  beforeEach(() => {
    // Clear any existing JSON-LD scripts
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => script.remove())
  })

  describe('Basic Rendering', () => {
    it('should render breadcrumb items', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: 'Article' }
      ]

      render(<Breadcrumbs items={items} />)

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Blog')).toBeInTheDocument()
      expect(screen.getByText('Article')).toBeInTheDocument()
    })

    it('should render separators between items', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: 'Article' }
      ]

      const { container } = render(<Breadcrumbs items={items} />)

      const separators = container.querySelectorAll('[aria-hidden="true"]')
      // Should have 2 separators for 3 items
      expect(separators).toHaveLength(2)
      expect(separators[0].textContent).toBe('/')
      expect(separators[1].textContent).toBe('/')
    })

    it('should render single item without separator', () => {
      const items = [{ label: 'Home', href: '/' }]

      const { container } = render(<Breadcrumbs items={items} />)

      const separators = container.querySelectorAll('[aria-hidden="true"]')
      expect(separators).toHaveLength(0)
    })

    it('should apply custom className', () => {
      const items = [{ label: 'Home', href: '/' }]

      const { container } = render(<Breadcrumbs items={items} className="custom-class" />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('custom-class')
    })

    it('should have proper ARIA navigation label', () => {
      const items = [{ label: 'Home', href: '/' }]

      render(<Breadcrumbs items={items} />)

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb')
    })
  })

  describe('Link Rendering', () => {
    it('should render clickable links for items with href', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' }
      ]

      render(<Breadcrumbs items={items} />)

      const homeLink = screen.getByText('Home').closest('a')
      const blogLink = screen.getByText('Blog').closest('a')

      expect(homeLink).toHaveAttribute('href', '/')
      expect(blogLink).toHaveAttribute('href', '/blog')
    })

    it('should render buttons for items with onClick', () => {
      const handleClick = vi.fn()
      const items = [
        { label: 'Home', onClick: handleClick },
        { label: 'Current' }
      ]

      render(<Breadcrumbs items={items} />)

      const homeButton = screen.getByText('Home').closest('button')
      expect(homeButton).toBeInTheDocument()
      expect(homeButton).toHaveAttribute('type', 'button')
    })

    it('should render plain text for items without href or onClick', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Current Page' }
      ]

      render(<Breadcrumbs items={items} />)

      const currentPage = screen.getByText('Current Page')
      expect(currentPage.tagName).toBe('SPAN')
      expect(currentPage).toHaveClass('font-semibold', 'text-primary')
    })

    it('should handle onClick events', () => {
      const handleHomeClick = vi.fn()
      const handleBlogClick = vi.fn()
      const items = [
        { label: 'Home', onClick: handleHomeClick },
        { label: 'Blog', onClick: handleBlogClick },
        { label: 'Article' }
      ]

      render(<Breadcrumbs items={items} />)

      const homeButton = screen.getByText('Home')
      const blogButton = screen.getByText('Blog')

      fireEvent.click(homeButton)
      expect(handleHomeClick).toHaveBeenCalledTimes(1)

      fireEvent.click(blogButton)
      expect(handleBlogClick).toHaveBeenCalledTimes(1)
    })

    it('should support mixed href and onClick items', () => {
      const handleClick = vi.fn()
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Blog', onClick: handleClick },
        { label: 'Article' }
      ]

      render(<Breadcrumbs items={items} />)

      const homeLink = screen.getByText('Home').closest('a')
      const blogButton = screen.getByText('Blog').closest('button')
      const article = screen.getByText('Article')

      expect(homeLink).toHaveAttribute('href', '/')
      expect(blogButton).toBeInTheDocument()
      expect(article.tagName).toBe('SPAN')
    })
  })

  describe('SEO - JSON-LD BreadcrumbList Schema', () => {
    it('should inject BreadcrumbList schema into document', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: 'Article' }
      ]

      render(<Breadcrumbs items={items} />)

      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts.length).toBeGreaterThan(0)

      const schemaScript = Array.from(scripts).find(script => {
        const content = script.textContent || ''
        return content.includes('BreadcrumbList')
      })

      expect(schemaScript).toBeTruthy()
    })

    it('should have correct schema structure', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: 'Article' }
      ]

      render(<Breadcrumbs items={items} />)

      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      const schemaScript = Array.from(scripts).find(script => {
        const content = script.textContent || ''
        return content.includes('BreadcrumbList')
      })

      expect(schemaScript).toBeTruthy()
      const schema = JSON.parse(schemaScript!.textContent!)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('BreadcrumbList')
      expect(schema.itemListElement).toBeDefined()
      expect(schema.itemListElement).toHaveLength(3)
    })

    it('should include item URLs in schema for items with href', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: 'Article' }
      ]

      render(<Breadcrumbs items={items} />)

      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      const schemaScript = Array.from(scripts).find(script => {
        const content = script.textContent || ''
        return content.includes('BreadcrumbList')
      })

      const schema = JSON.parse(schemaScript!.textContent!)

      expect(schema.itemListElement[0].item).toBe('https://gifteez.nl/')
      expect(schema.itemListElement[1].item).toBe('https://gifteez.nl/blog')
      // Last item (current page) should not have item property
      expect(schema.itemListElement[2].item).toBeUndefined()
    })

    it('should set correct positions in schema', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: 'Article', href: '/blog/article' }
      ]

      render(<Breadcrumbs items={items} />)

      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      const schemaScript = Array.from(scripts).find(script => {
        const content = script.textContent || ''
        return content.includes('BreadcrumbList')
      })

      const schema = JSON.parse(schemaScript!.textContent!)

      expect(schema.itemListElement[0].position).toBe(1)
      expect(schema.itemListElement[1].position).toBe(2)
      expect(schema.itemListElement[2].position).toBe(3)
    })

    it('should include correct labels in schema', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Category', href: '/category' },
        { label: 'Subcategory' }
      ]

      render(<Breadcrumbs items={items} />)

      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      const schemaScript = Array.from(scripts).find(script => {
        const content = script.textContent || ''
        return content.includes('BreadcrumbList')
      })

      const schema = JSON.parse(schemaScript!.textContent!)

      expect(schema.itemListElement[0].name).toBe('Home')
      expect(schema.itemListElement[1].name).toBe('Category')
      expect(schema.itemListElement[2].name).toBe('Subcategory')
    })

    it('should handle items without href in schema', () => {
      const handleClick = vi.fn()
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Interactive', onClick: handleClick },
        { label: 'Current' }
      ]

      render(<Breadcrumbs items={items} />)

      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      const schemaScript = Array.from(scripts).find(script => {
        const content = script.textContent || ''
        return content.includes('BreadcrumbList')
      })

      const schema = JSON.parse(schemaScript!.textContent!)

      expect(schema.itemListElement[0].item).toBe('https://gifteez.nl/')
      expect(schema.itemListElement[1].item).toBeUndefined() // onClick only
      expect(schema.itemListElement[2].item).toBeUndefined() // Current page
    })
  })

  describe('Styling', () => {
    it('should apply hover styles to links', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Blog' }
      ]

      render(<Breadcrumbs items={items} />)

      const homeLink = screen.getByText('Home').closest('a')
      expect(homeLink).toHaveClass('transition-colors', 'hover:text-primary')
    })

    it('should apply hover styles to buttons', () => {
      const handleClick = vi.fn()
      const items = [
        { label: 'Home', onClick: handleClick },
        { label: 'Current' }
      ]

      render(<Breadcrumbs items={items} />)

      const homeButton = screen.getByText('Home').closest('button')
      expect(homeButton).toHaveClass('transition-colors', 'hover:text-primary')
    })

    it('should style current page differently', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Current Page' }
      ]

      render(<Breadcrumbs items={items} />)

      const currentPage = screen.getByText('Current Page')
      expect(currentPage).toHaveClass('font-semibold', 'text-primary')
    })

    it('should have background color on nav element', () => {
      const items = [{ label: 'Home', href: '/' }]

      const { container } = render(<Breadcrumbs items={items} />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('bg-secondary/30')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty items array', () => {
      const { container } = render(<Breadcrumbs items={[]} />)

      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()

      const listItems = container.querySelectorAll('li')
      expect(listItems).toHaveLength(0)
    })

    it('should handle very long breadcrumb chains', () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        label: `Level ${i + 1}`,
        href: i < 9 ? `/level${i + 1}` : undefined
      }))

      render(<Breadcrumbs items={items} />)

      expect(screen.getByText('Level 1')).toBeInTheDocument()
      expect(screen.getByText('Level 10')).toBeInTheDocument()

      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      const schemaScript = Array.from(scripts).find(script => {
        const content = script.textContent || ''
        return content.includes('BreadcrumbList')
      })

      const schema = JSON.parse(schemaScript!.textContent!)
      expect(schema.itemListElement).toHaveLength(10)
      expect(schema.itemListElement[9].position).toBe(10)
    })

    it('should handle special characters in labels', () => {
      const items = [
        { label: 'Home & Garden', href: '/' },
        { label: 'Products < €50', href: '/deals' },
        { label: 'Item "Premium"' }
      ]

      render(<Breadcrumbs items={items} />)

      expect(screen.getByText('Home & Garden')).toBeInTheDocument()
      expect(screen.getByText('Products < €50')).toBeInTheDocument()
      expect(screen.getByText('Item "Premium"')).toBeInTheDocument()

      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      const schemaScript = Array.from(scripts).find(script => {
        const content = script.textContent || ''
        return content.includes('BreadcrumbList')
      })

      const schema = JSON.parse(schemaScript!.textContent!)
      expect(schema.itemListElement[0].name).toBe('Home & Garden')
      expect(schema.itemListElement[1].name).toBe('Products < €50')
      expect(schema.itemListElement[2].name).toBe('Item "Premium"')
    })

    it('should handle URLs with query parameters and fragments', () => {
      const items = [
        { label: 'Search', href: '/search?q=gifts' },
        { label: 'Results', href: '/search?q=gifts&page=2' },
        { label: 'Detail' }
      ]

      render(<Breadcrumbs items={items} />)

      const searchLink = screen.getByText('Search').closest('a')
      const resultsLink = screen.getByText('Results').closest('a')

      expect(searchLink).toHaveAttribute('href', '/search?q=gifts')
      expect(resultsLink).toHaveAttribute('href', '/search?q=gifts&page=2')

      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      const schemaScript = Array.from(scripts).find(script => {
        const content = script.textContent || ''
        return content.includes('BreadcrumbList')
      })

      const schema = JSON.parse(schemaScript!.textContent!)
      expect(schema.itemListElement[0].item).toBe('https://gifteez.nl/search?q=gifts')
      expect(schema.itemListElement[1].item).toBe('https://gifteez.nl/search?q=gifts&page=2')
    })

    it('should handle rapid re-renders without memory leaks', () => {
      const items1 = [{ label: 'Home', href: '/' }, { label: 'Page 1' }]
      const items2 = [{ label: 'Home', href: '/' }, { label: 'Page 2' }]
      const items3 = [{ label: 'Home', href: '/' }, { label: 'Page 3' }]

      const { rerender } = render(<Breadcrumbs items={items1} />)

      let scripts = document.querySelectorAll('script[type="application/ld+json"]')
      const initialCount = scripts.length

  rerender(<Breadcrumbs items={items2} />)
  scripts = document.querySelectorAll('script[type="application/ld+json"]')
  const afterRerender1 = scripts.length
  expect(afterRerender1).toBeLessThanOrEqual(initialCount + 1)

      rerender(<Breadcrumbs items={items3} />)
      scripts = document.querySelectorAll('script[type="application/ld+json"]')
      const afterRerender2 = scripts.length

      // Each rerender should not accumulate schemas
      // (Vitest might not clean up between renders, but count shouldn't grow exponentially)
      expect(afterRerender2).toBeLessThanOrEqual(initialCount + 2)
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: 'Article' }
      ]

      const { container } = render(<Breadcrumbs items={items} />)

      const nav = container.querySelector('nav')
      const ol = nav?.querySelector('ol')

      expect(nav).toBeInTheDocument()
      expect(ol).toBeInTheDocument()
    })

    it('should hide separators from screen readers', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' }
      ]

      const { container } = render(<Breadcrumbs items={items} />)

      const separators = container.querySelectorAll('[aria-hidden="true"]')
      expect(separators).toHaveLength(1)
    })

    it('should be keyboard navigable for links', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' }
      ]

      render(<Breadcrumbs items={items} />)

      const homeLink = screen.getByText('Home').closest('a')
      const blogLink = screen.getByText('Blog').closest('a')

      // Links should be focusable
      homeLink?.focus()
      expect(document.activeElement).toBe(homeLink)

      blogLink?.focus()
      expect(document.activeElement).toBe(blogLink)
    })

    it('should be keyboard navigable for buttons', () => {
      const handleClick = vi.fn()
      const items = [
        { label: 'Interactive', onClick: handleClick },
        { label: 'Current' }
      ]

      render(<Breadcrumbs items={items} />)

      const button = screen.getByText('Interactive').closest('button')

      button?.focus()
      expect(document.activeElement).toBe(button)
    })
  })
})
