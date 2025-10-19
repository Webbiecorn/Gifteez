import type { ReactElement } from 'react'
import { AuthProvider } from '@contexts/AuthContext'
import { CartProvider } from '@contexts/CartContext'
import { FavoritesProvider } from '@contexts/FavoritesContext'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import type { RenderOptions } from '@testing-library/react'

/**
 * Custom render function with all providers
 *
 * @example
 * ```tsx
 * import { renderWithProviders, screen } from '@/tests/test-utils'
 *
 * test('renders component', () => {
 *   renderWithProviders(<MyComponent />)
 *   expect(screen.getByText('Hello')).toBeInTheDocument()
 * })
 * ```
 */

// All providers wrapper
interface AllProvidersProps {
  children: React.ReactNode
}

function AllProviders({ children }: AllProvidersProps) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>{children}</FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

// Custom render function
function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything
export * from '@testing-library/react'
export { renderWithProviders }

// Export user event
export { default as userEvent } from '@testing-library/user-event'

/**
 * Mock functions for common services
 */

// Mock analytics
export const mockAnalytics = {
  trackViewProduct: vi.fn(),
  trackClickAffiliate: vi.fn(),
  trackStartGiftFinder: vi.fn(),
  trackApplyFilter: vi.fn(),
  trackSharePin: vi.fn(),
  trackFunnelStep: vi.fn(),
  trackProductImpressions: vi.fn(),
}

// Mock funnel tracking
export const mockFunnelTracking = {
  startFunnel: vi.fn(),
  completeStep: vi.fn(),
  getFunnelMetrics: vi.fn(),
  getDropOffRate: vi.fn(),
  getAllFunnelMetrics: vi.fn(),
}

// Mock A/B testing
export const mockABTesting = {
  getVariant: vi.fn(),
  getVariantValue: vi.fn(),
  trackVariantImpression: vi.fn(),
  trackVariantConversion: vi.fn(),
  getTestMetrics: vi.fn(),
  getWinningVariant: vi.fn(),
  isStatisticallySignificant: vi.fn(),
}

// Mock product data
export const mockProduct = {
  id: 'test-product-1',
  name: 'Test Product',
  description: 'A test product description',
  price: 29.99,
  originalPrice: 39.99,
  discount: 25,
  image: '/test-image.jpg',
  category: 'test-category',
  tags: ['test', 'product'],
  rating: 4.5,
  reviewCount: 42,
  affiliateLink: 'https://example.com/affiliate/test-product',
  retailer: 'Test Retailer',
  inStock: true,
}

// Mock gift finder answers
export const mockGiftFinderAnswers = {
  recipient: 'partner',
  occasion: 'birthday',
  interests: ['technology', 'gaming'],
  priceRange: '25-50',
  gender: 'male',
  age: '25-35',
}

// Helper: wait for async updates
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0))

// Helper: create mock intersection observer entry
export const createMockIntersectionObserverEntry = (
  isIntersecting: boolean
): IntersectionObserverEntry => ({
  isIntersecting,
  boundingClientRect: {} as DOMRectReadOnly,
  intersectionRatio: isIntersecting ? 1 : 0,
  intersectionRect: {} as DOMRectReadOnly,
  rootBounds: null,
  target: document.createElement('div'),
  time: Date.now(),
})
