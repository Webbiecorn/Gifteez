import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: [
    './index.html',
    './**/*.{ts,tsx}',
    '!./node_modules/**'
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        md: '1.5rem',
        lg: '2rem'
      },
      screens: {
        xs: '480px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px'
      }
    },
    extend: {
      screens: {
        xs: '480px',
        '3xl': '1680px'
      },
      colors: {
        // Calmer, higher-contrast palette
        primary: '#0f172a', // slate-900 (for headings/text)
        secondary: '#f8fafc', // slate-50 (background)
        accent: '#059669', // emerald-600 (action buttons)
        'accent-hover': '#047857', // emerald-700
        'light-bg': '#f8fafc',
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        'serif-italic': ['Playfair Display', 'serif'],
      },
      fontSize: {
        // Semantic scale for consistent headings
        h1: ['clamp(2.5rem,4.5vw,3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }], // ~40–56px
        h2: ['clamp(2rem,3.5vw,2.75rem)', { lineHeight: '1.08', letterSpacing: '-0.015em', fontWeight: '700' }], // ~32–44px
        h3: ['clamp(1.625rem,2.5vw,2.125rem)', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '600' }], // ~26–34px
        h4: ['clamp(1.375rem,1.8vw,1.75rem)', { lineHeight: '1.2', fontWeight: '600' }], // ~22–28px
        h5: ['1.125rem', { lineHeight: '1.35', fontWeight: '600' }], // 18px
        lead: ['clamp(1.125rem,1.4vw,1.375rem)', { lineHeight: '1.55', fontWeight: '400' }], // Leading paragraph
        body: ['1rem', { lineHeight: '1.6' }],
        small: ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.005em' }],
        micro: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.04em', fontWeight: '500' }]
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.3s ease-out forwards',
      },
    },
  },
  plugins: [typography],
} satisfies Config
