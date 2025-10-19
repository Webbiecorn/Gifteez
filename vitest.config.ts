import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',

    // Global test APIs (describe, it, expect)
    globals: true,

    // Setup files
    setupFiles: ['./tests/setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '.firebase/',
        'functions/',
        'scripts/',
        'public/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types.ts',
        '**/__tests__/**',
        '**/test-utils.tsx',
      ],
      // Coverage thresholds
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },

    // Test file patterns
    include: ['**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}', '**/*.{test,spec}.{js,ts,jsx,tsx}'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', 'build', '.firebase', 'functions', 'e2e'],

    // Test timeout (ms)
    testTimeout: 10000,

    // Hook timeout (ms)
    hookTimeout: 10000,

    // Reporter
    reporters: ['verbose'],

    // Watch mode (development)
    watch: false,

    // CSS handling
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },

    // Mock configuration
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },

  // Resolve configuration (match vite.config.ts)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@components': path.resolve(__dirname, './components'),
      '@services': path.resolve(__dirname, './services'),
      '@hooks': path.resolve(__dirname, './hooks'),
      '@lib': path.resolve(__dirname, './lib'),
      '@contexts': path.resolve(__dirname, './contexts'),
      '@types': path.resolve(__dirname, './types.ts'),
    },
  },
})
