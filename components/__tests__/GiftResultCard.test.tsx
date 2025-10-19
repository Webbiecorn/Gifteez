import React from 'react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { screen, fireEvent, waitFor, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import GiftResultCard from '../GiftResultCard'
import { AuthContext } from '../../contexts/AuthContext'
import type { Gift, AuthContextType } from '../../types'
import * as affiliateModule from '../../services/affiliate'
import * as analyticsModule from '../../services/giftFinderAnalyticsService'

// Mock modules
vi.mock('../../services/affiliate', () => ({
  withAffiliate: vi.fn((url: string) => `${url}?affiliate=test`)
}))

vi.mock('../../services/giftFinderAnalyticsService', () => ({
  logClickEvent: vi.fn()
}))

// Mock ImageWithFallback component
vi.mock('../ImageWithFallback', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className: string }) => (
    <img src={src} alt={alt} className={className} data-testid="gift-image" />
  )
}))

// Mock Button component
vi.mock('../Button', () => ({
  default: ({ children, variant, className, ...props }: any) => (
    <button className={`${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}))

// Mock SocialShare component
vi.mock('../SocialShare', () => ({
  default: ({ item }: { item: Gift }) => (
    <div data-testid="social-share">Share {item.productName}</div>
  )
}))

// Mock GiftExplainer component
vi.mock('../GiftExplainer', () => ({
  GiftExplainerCompact: ({ explanations, totalScore }: { explanations: string[]; totalScore?: number }) => (
    <div data-testid="gift-explainer">
      {explanations.map((exp, i) => (
        <div key={i}>{exp}</div>
      ))}
      {totalScore && <div>Score: {totalScore}</div>}
    </div>
  )
}))

// Mock IconComponents
vi.mock('../IconComponents', () => ({
  HeartIcon: ({ className }: { className: string }) => (
    <span className={className} data-testid="heart-icon">♡</span>
  ),
  HeartIconFilled: ({ className }: { className: string }) => (
    <span className={className} data-testid="heart-icon-filled">♥</span>
  )
}))

describe('GiftResultCard', () => {
  const mockGift: Gift = {
    productName: 'Luxury Gift Box',
    description: 'A premium gift box with assorted treats',
    priceRange: '€50 - €75',
    imageUrl: 'https://example.com/gift.jpg',
    retailers: [
      {
        name: 'Amazon',
        affiliateLink: 'https://amazon.com/product/123'
      },
      {
        name: 'Coolblue',
        affiliateLink: 'https://coolblue.nl/product/456'
      }
    ],
    relevanceScore: 8.5
  }

  const mockShowToast = vi.fn()
  const mockOnFavoriteChange = vi.fn()
  const mockOnCompareToggle = vi.fn()

  let mockAuthContext: AuthContextType

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks()
    localStorage.clear()

    // Setup mock auth context
    mockAuthContext = {
      currentUser: null,
      loading: false,
      isFavorite: vi.fn(() => false),
      toggleFavorite: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
      resetPassword: vi.fn(),
      addProfile: vi.fn(),
      updateProfile: vi.fn(),
      deleteProfile: vi.fn(),
      updateUserPreferences: vi.fn(),
      updateNotificationSettings: vi.fn(),
      syncFavorites: vi.fn(),
      updateAvatar: vi.fn(),
      getFavoritesByCategory: vi.fn(() => ({})),
      exportFavorites: vi.fn(),
      importFavorites: vi.fn()
    }

    // Reset dataLayer
    // @ts-ignore
    window.dataLayer = []
  })

  afterEach(() => {
    // Clean up any remaining JSON-LD scripts
    const scripts = document.head.querySelectorAll('script[type="application/ld+json"]')
    scripts.forEach((script) => script.remove())
  })

  describe('Basic Rendering', () => {
    it('should render gift name and description', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByText('Luxury Gift Box')).toBeInTheDocument()
      expect(screen.getByText('A premium gift box with assorted treats')).toBeInTheDocument()
    })

    it('should render price range', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByText('€50 - €75')).toBeInTheDocument()
    })

    it('should render gift image with correct src and alt', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const image = screen.getByTestId('gift-image')
      expect(image).toHaveAttribute('src', mockGift.imageUrl)
      expect(image).toHaveAttribute('alt', mockGift.productName)
    })

    it('should not render image section when imageUrl is empty', () => {
      const giftNoImage = { ...mockGift, imageUrl: '' }
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={giftNoImage} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.queryByTestId('gift-image')).not.toBeInTheDocument()
    })

    it('should render without price range when not provided', () => {
      const giftNoPrice = { ...mockGift, priceRange: undefined }
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={giftNoPrice} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.queryByText(/€/)).not.toBeInTheDocument()
    })
  })

  describe('Retailer Links', () => {
    it('should render all retailer buttons', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByText('Bekijk bij Amazon')).toBeInTheDocument()
      expect(screen.getByText('Bekijk bij Coolblue')).toBeInTheDocument()
    })

    it('should apply affiliate tracking to retailer links', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const amazonLink = screen.getByText('Bekijk bij Amazon').closest('a')
      expect(affiliateModule.withAffiliate).toHaveBeenCalledWith(
        'https://amazon.com/product/123'
      )
      expect(amazonLink).toHaveAttribute('href', 'https://amazon.com/product/123?affiliate=test')
    })

    it('should have correct rel attributes on affiliate links', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const amazonLink = screen.getByText('Bekijk bij Amazon').closest('a')
      expect(amazonLink).toHaveAttribute('rel', 'noopener noreferrer sponsored nofollow')
      expect(amazonLink).toHaveAttribute('target', '_blank')
    })

    it('should log click event when affiliate link is clicked', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const amazonLink = screen.getByText('Bekijk bij Amazon')
      fireEvent.click(amazonLink)

      expect(analyticsModule.logClickEvent).toHaveBeenCalledWith(
        'Luxury Gift Box',
        1, // 1-indexed position
        {
          relevanceScore: 8.5,
          budgetFit: undefined,
          occasionFit: undefined,
          personaFit: undefined,
          trendScore: undefined
        }
      )
    })

    it('should push affiliate click to dataLayer', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const coolblueLink = screen.getByText('Bekijk bij Coolblue')
      fireEvent.click(coolblueLink)

      // @ts-ignore
      expect(window.dataLayer).toHaveLength(1)
      // @ts-ignore
      const event = window.dataLayer[0]
      expect(event.event).toBe('affiliate_click')
      expect(event.retailer).toBe('Coolblue')
      expect(event.product).toBe('Luxury Gift Box')
      expect(event.position).toBe(1)
    })

    it('should render without retailer buttons when no retailers provided', () => {
      const giftNoRetailers = { ...mockGift, retailers: [] }
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={giftNoRetailers} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.queryByText(/Bekijk bij/)).not.toBeInTheDocument()
    })
  })

  describe('Favorite Functionality', () => {
    it('should render favorite button by default', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const button = screen.getByLabelText('Voeg toe aan favorieten')
      expect(button).toBeInTheDocument()
      expect(within(button).getByTestId('heart-icon')).toBeInTheDocument()
    })

    it('should not render favorite button in read-only mode', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} isReadOnly={true} />
        </AuthContext.Provider>
      )

      expect(screen.queryByLabelText('Voeg toe aan favorieten')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Verwijder van favorieten')).not.toBeInTheDocument()
    })

    it('should show filled heart when gift is favorite (authenticated user)', async () => {
      mockAuthContext.isFavorite = vi.fn(() => true)
      mockAuthContext.currentUser = { uid: 'user123' } as any

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      // Wait for useEffect to update favorite state
      await waitFor(() => {
        const button = screen.getByLabelText('Verwijder van favorieten')
        expect(within(button).getByTestId('heart-icon-filled')).toBeInTheDocument()
      })
    })

    it('should toggle favorite for authenticated user', async () => {
      const user = userEvent.setup()
      mockAuthContext.currentUser = { uid: 'user123' } as any

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard
            gift={mockGift}
            index={0}
            showToast={mockShowToast}
            onFavoriteChange={mockOnFavoriteChange}
          />
        </AuthContext.Provider>
      )

      const button = screen.getByLabelText('Voeg toe aan favorieten')
      await user.click(button)

      expect(mockAuthContext.toggleFavorite).toHaveBeenCalledWith(mockGift)
      expect(mockShowToast).toHaveBeenCalledWith('Cadeau opgeslagen!')
      expect(mockOnFavoriteChange).toHaveBeenCalledWith('Luxury Gift Box', true)
    })

    it('should save favorite to localStorage for guest user', async () => {
      const user = userEvent.setup()

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard
            gift={mockGift}
            index={0}
            showToast={mockShowToast}
            onFavoriteChange={mockOnFavoriteChange}
          />
        </AuthContext.Provider>
      )

      const button = screen.getByLabelText('Voeg toe aan favorieten')
      await user.click(button)

      const favorites = JSON.parse(localStorage.getItem('gifteezFavorites') || '[]')
      expect(favorites).toHaveLength(1)
      expect(favorites[0].productName).toBe('Luxury Gift Box')
      expect(mockShowToast).toHaveBeenCalledWith('Cadeau opgeslagen!')
    })

    it('should remove favorite from localStorage for guest user', async () => {
      const user = userEvent.setup()
      localStorage.setItem('gifteezFavorites', JSON.stringify([mockGift]))

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard
            gift={mockGift}
            index={0}
            showToast={mockShowToast}
            onFavoriteChange={mockOnFavoriteChange}
          />
        </AuthContext.Provider>
      )

      // Wait for useEffect to set initial favorite state
      await waitFor(() => {
        expect(screen.getByLabelText('Verwijder van favorieten')).toBeInTheDocument()
      })

      const button = screen.getByLabelText('Verwijder van favorieten')
      await user.click(button)

      const favorites = JSON.parse(localStorage.getItem('gifteezFavorites') || '[]')
      expect(favorites).toHaveLength(0)
      expect(mockOnFavoriteChange).toHaveBeenCalledWith('Luxury Gift Box', false)
    })

    it('should handle malformed localStorage favorites gracefully', () => {
      localStorage.setItem('gifteezFavorites', 'invalid-json')

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to parse guest favorites from localStorage',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should not toggle favorite in read-only mode', async () => {
      const user = userEvent.setup()

      const { container } = render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} isReadOnly={true} />
        </AuthContext.Provider>
      )

      // No favorite button should be present
      expect(container.querySelector('button[aria-label*="favorieten"]')).not.toBeInTheDocument()
    })
  })

  describe('Badges and Labels', () => {
    it('should render trending badge', () => {
      const giftWithBadge = { ...mockGift, trendingBadge: 'trending' as const }
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={giftWithBadge} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByText('TRENDING')).toBeInTheDocument()
      expect(screen.getByText('🔥')).toBeInTheDocument()
    })

    it('should render hot-deal badge', () => {
      const giftWithBadge = { ...mockGift, trendingBadge: 'hot-deal' as const }
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={giftWithBadge} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByText('HOT DEAL')).toBeInTheDocument()
      expect(screen.getByText('💥')).toBeInTheDocument()
    })

    it('should render seasonal badge', () => {
      const giftWithBadge = { ...mockGift, trendingBadge: 'seasonal' as const }
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={giftWithBadge} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByText('SEIZOEN')).toBeInTheDocument()
      expect(screen.getByText('🎃')).toBeInTheDocument()
    })

    it('should render Amazon-only badge when all retailers are Amazon', () => {
      const amazonGift = {
        ...mockGift,
        retailers: [
          { name: 'Amazon', affiliateLink: 'https://amazon.com/1' },
          { name: 'Amazon.de', affiliateLink: 'https://amazon.de/2' }
        ]
      }

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={amazonGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByText('Alleen Amazon')).toBeInTheDocument()
    })

    it('should not render Amazon badge when hideAmazonBadge is true', () => {
      const amazonGift = {
        ...mockGift,
        retailers: [{ name: 'Amazon', affiliateLink: 'https://amazon.com/1' }]
      }

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard
            gift={amazonGift}
            index={0}
            showToast={mockShowToast}
            hideAmazonBadge={true}
          />
        </AuthContext.Provider>
      )

      expect(screen.queryByText('Alleen Amazon')).not.toBeInTheDocument()
    })

    it('should not render Amazon badge when there are non-Amazon retailers', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.queryByText('Alleen Amazon')).not.toBeInTheDocument()
    })

    it('should render match reason badge', () => {
      const giftWithMatch = { ...mockGift, matchReason: 'Perfect voor techliefhebbers' }
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={giftWithMatch} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByText('Perfect voor techliefhebbers')).toBeInTheDocument()
      expect(screen.getByText('✨')).toBeInTheDocument()
    })

    it('should render retailer badges', () => {
      const giftWithBadges = {
        ...mockGift,
        retailerBadges: [
          { label: 'Eco-vriendelijk', tone: 'success', description: 'Milieuvriendelijk product' },
          { label: 'Bestseller', tone: 'accent', description: 'Top verkocht product' }
        ]
      }

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={giftWithBadges} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByText('Eco-vriendelijk')).toBeInTheDocument()
      expect(screen.getByText('Bestseller')).toBeInTheDocument()
    })
  })

  describe('AI Features', () => {
    it('should render gift explainer when explanations are provided', () => {
      const giftWithExplanations = {
        ...mockGift,
        explanations: ['Matches your budget', 'Perfect for the occasion'],
        relevanceScore: 9.2
      }

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={giftWithExplanations} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const explainer = screen.getByTestId('gift-explainer')
      expect(explainer).toBeInTheDocument()
      expect(within(explainer).getByText('Matches your budget')).toBeInTheDocument()
      expect(within(explainer).getByText('Perfect for the occasion')).toBeInTheDocument()
      expect(within(explainer).getByText('Score: 9.2')).toBeInTheDocument()
    })

    it('should render story when provided', () => {
      const giftWithStory = {
        ...mockGift,
        story: 'Handcrafted by local artisans'
      }

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={giftWithStory} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByText('Handcrafted by local artisans')).toBeInTheDocument()
    })
  })

  describe('Compare Functionality', () => {
    it('should render compare checkbox when onCompareToggle is provided', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard
            gift={mockGift}
            index={0}
            showToast={mockShowToast}
            onCompareToggle={mockOnCompareToggle}
          />
        </AuthContext.Provider>
      )

      expect(screen.getByLabelText('Vergelijk dit cadeau')).toBeInTheDocument()
    })

    it('should not render compare checkbox when onCompareToggle is not provided', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.queryByLabelText('Vergelijk dit cadeau')).not.toBeInTheDocument()
    })

    it('should call onCompareToggle when checkbox is clicked', async () => {
      const user = userEvent.setup()

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard
            gift={mockGift}
            index={0}
            showToast={mockShowToast}
            onCompareToggle={mockOnCompareToggle}
          />
        </AuthContext.Provider>
      )

      const checkbox = screen.getByLabelText('Vergelijk dit cadeau')
      await user.click(checkbox)

      expect(mockOnCompareToggle).toHaveBeenCalledWith(mockGift)
    })

    it('should show checked state when isInCompareList is true', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard
            gift={mockGift}
            index={0}
            showToast={mockShowToast}
            onCompareToggle={mockOnCompareToggle}
            isInCompareList={true}
          />
        </AuthContext.Provider>
      )

      const checkbox = screen.getByLabelText('Vergelijk dit cadeau') as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })

    it('should not render compare in read-only mode', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard
            gift={mockGift}
            index={0}
            showToast={mockShowToast}
            onCompareToggle={mockOnCompareToggle}
            isReadOnly={true}
          />
        </AuthContext.Provider>
      )

      expect(screen.queryByLabelText('Vergelijk dit cadeau')).not.toBeInTheDocument()
    })

    it('should not render compare in embedded mode', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard
            gift={mockGift}
            index={0}
            showToast={mockShowToast}
            onCompareToggle={mockOnCompareToggle}
            isEmbedded={true}
          />
        </AuthContext.Provider>
      )

      expect(screen.queryByLabelText('Vergelijk dit cadeau')).not.toBeInTheDocument()
    })
  })

  describe('Social Share', () => {
    it('should render social share in normal mode', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByTestId('social-share')).toBeInTheDocument()
      expect(screen.getByText('Share Luxury Gift Box')).toBeInTheDocument()
    })

    it('should not render social share in read-only mode', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} isReadOnly={true} />
        </AuthContext.Provider>
      )

      expect(screen.queryByTestId('social-share')).not.toBeInTheDocument()
    })

    it('should not render social share in embedded mode', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} isEmbedded={true} />
        </AuthContext.Provider>
      )

      expect(screen.queryByTestId('social-share')).not.toBeInTheDocument()
    })
  })

  describe('SEO - JSON-LD Schema', () => {
    it('should inject Product schema in document head', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const scripts = document.head.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts.length).toBeGreaterThan(0)

      const scriptContent = scripts[0].textContent
      expect(scriptContent).toBeTruthy()

      const schema = JSON.parse(scriptContent!)
      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('Product')
      expect(schema.name).toBe('Luxury Gift Box')
      expect(schema.description).toBe('A premium gift box with assorted treats')
      expect(schema.image).toBe('https://example.com/gift.jpg')
    })

    it('should include price information in schema', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const scripts = document.head.querySelectorAll('script[type="application/ld+json"]')
      const schema = JSON.parse(scripts[0].textContent!)

      expect(schema.offers).toBeDefined()
      expect(schema.offers['@type']).toBe('AggregateOffer')
      expect(schema.offers.priceCurrency).toBe('EUR')
      expect(schema.offers.lowPrice).toBe('50')
      expect(schema.offers.highPrice).toBe('75')
      expect(schema.offers.availability).toBe('https://schema.org/InStock')
      expect(schema.offers.url).toBe('https://amazon.com/product/123')
    })

    it('should not inject schema in embedded mode', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} isEmbedded={true} />
        </AuthContext.Provider>
      )

      const scripts = document.head.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts.length).toBe(0)
    })

    it('should clean up schema script on unmount', () => {
      const { unmount } = render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      let scripts = document.head.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts.length).toBeGreaterThan(0)

      unmount()

      scripts = document.head.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts.length).toBe(0)
    })

    it('should handle single price format', () => {
      const giftSinglePrice = { ...mockGift, priceRange: '€50' }
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={giftSinglePrice} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const scripts = document.head.querySelectorAll('script[type="application/ld+json"]')
      const schema = JSON.parse(scripts[0].textContent!)

      expect(schema.offers.lowPrice).toBe('50')
      expect(schema.offers.highPrice).toBe('50')
    })
  })

  describe('Layout Variants', () => {
    it('should apply candidate variant styling', () => {
      const { container } = render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard
            gift={mockGift}
            index={0}
            showToast={mockShowToast}
            candidateVariant={true}
          />
        </AuthContext.Provider>
      )

      // Check for centered text classes in candidate variant
      const heading = container.querySelector('h3')
      expect(heading?.className).toContain('text-center')
    })

    it('should use custom image height class', () => {
      const { container } = render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard
            gift={mockGift}
            index={0}
            showToast={mockShowToast}
            imageHeightClass="h-64"
          />
        </AuthContext.Provider>
      )

      const imageContainer = container.querySelector('.h-64')
      expect(imageContainer).toBeInTheDocument()
    })

    it('should apply contain fit to image', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard
            gift={mockGift}
            index={0}
            showToast={mockShowToast}
            imageFit="contain"
          />
        </AuthContext.Provider>
      )

      // ImageWithFallback is mocked, so we just verify it renders
      expect(screen.getByTestId('gift-image')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels on favorite button', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const button = screen.getByLabelText('Voeg toe aan favorieten')
      expect(button).toHaveAttribute('aria-label')
    })

    it('should have proper ARIA label on retailer links', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const amazonLink = screen.getByLabelText('Bekijk Luxury Gift Box bij Amazon')
      expect(amazonLink).toBeInTheDocument()
    })

    it('should be keyboard accessible for favorite button', async () => {
      const user = userEvent.setup()

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const button = screen.getByLabelText('Voeg toe aan favorieten')
      button.focus()
      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockShowToast).toHaveBeenCalledWith('Cadeau opgeslagen!')
    })
  })

  describe('Edge Cases', () => {
    it('should handle gift without any optional fields', () => {
      const minimalGift: Gift = {
        productName: 'Simple Gift',
        description: 'Basic description',
        priceRange: '',
        retailers: [],
        imageUrl: ''
      }

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={minimalGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByText('Simple Gift')).toBeInTheDocument()
      expect(screen.getByText('Basic description')).toBeInTheDocument()
    })

    it('should handle very long product names gracefully', () => {
      const longNameGift = {
        ...mockGift,
        productName: 'This is an extremely long product name that should be handled properly by the component without breaking the layout or causing overflow issues'
      }

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={longNameGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByText(longNameGift.productName)).toBeInTheDocument()
    })

    it('should handle multiple retailer badges', () => {
      const giftManyBadges = {
        ...mockGift,
        retailerBadges: [
          { label: 'Badge 1', tone: 'primary', description: 'First badge' },
          { label: 'Badge 2', tone: 'accent', description: 'Second badge' },
          { label: 'Badge 3', tone: 'success', description: 'Third badge' },
          { label: 'Badge 4', tone: 'warning', description: 'Fourth badge' },
          { label: 'Badge 5', tone: 'neutral', description: 'Fifth badge' }
        ]
      }

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={giftManyBadges} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      expect(screen.getByText('Badge 1')).toBeInTheDocument()
      expect(screen.getByText('Badge 5')).toBeInTheDocument()
    })

    it('should handle hover state changes', async () => {
      const { container } = render(
        <AuthContext.Provider value={mockAuthContext}>
          <GiftResultCard gift={mockGift} index={0} showToast={mockShowToast} />
        </AuthContext.Provider>
      )

      const card = container.firstChild as HTMLElement
      
      fireEvent.mouseEnter(card)
      // Hover state is managed internally, just verify no errors

      fireEvent.mouseLeave(card)
      // Verify component handles state changes without crashing
      expect(card).toBeInTheDocument()
    })
  })
})
