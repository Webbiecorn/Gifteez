import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { expect, afterEach, vi } from 'vitest'

/**
 * Global test setup file
 * Runs before all tests
 */

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock window.matchMedia (for responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver (for lazy loading)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}
global.localStorage = localStorageMock as Storage

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}
global.sessionStorage = sessionStorageMock as Storage

// Mock scrollTo
global.scrollTo = vi.fn()

// Mock fetch (basic implementation)
global.fetch = vi.fn()

// Extend expect matchers
expect.extend({
  toBeInTheDocument(received: any) {
    return {
      pass: document.body.contains(received),
      message: () => `Expected element ${received} to be in the document`,
    }
  },
})

// Suppress console errors during tests (optional)
// Uncomment if you want cleaner test output
// global.console = {
//   ...console,
//   error: vi.fn(),
//   warn: vi.fn()
// }
