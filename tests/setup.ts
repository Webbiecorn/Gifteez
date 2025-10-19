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

// Mock localStorage with actual storage (for services that persist data)
const localStorageData: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageData[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageData[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageData[key]
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageData).forEach((key) => delete localStorageData[key])
  }),
  key: vi.fn((index: number) => Object.keys(localStorageData)[index] || null),
  get length() {
    return Object.keys(localStorageData).length
  },
}
global.localStorage = localStorageMock as Storage

// Mock sessionStorage with actual storage (for services that persist data)
const sessionStorageData: Record<string, string> = {}
const sessionStorageMock = {
  getItem: vi.fn((key: string) => sessionStorageData[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    sessionStorageData[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete sessionStorageData[key]
  }),
  clear: vi.fn(() => {
    Object.keys(sessionStorageData).forEach((key) => delete sessionStorageData[key])
  }),
  key: vi.fn((index: number) => Object.keys(sessionStorageData)[index] || null),
  get length() {
    return Object.keys(sessionStorageData).length
  },
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
