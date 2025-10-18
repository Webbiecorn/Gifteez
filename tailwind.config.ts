import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: [
    './index.html',
    './**/*.{ts,tsx}',
    '!./node_modules/**'
  ],
  safelist: [
    // Background gradients
    'bg-gradient-to-br',
    'bg-gradient-to-r',
    'from-pink-100',
    'from-pink-200',
    'from-pink-400',
    'from-purple-50',
    'from-purple-100',
    'from-purple-400',
    'from-purple-600',
    'from-purple-900',
    'from-rose-500',
    'from-rose-600',
    'from-orange-500',
    'from-yellow-500',
    'via-purple-50',
    'via-purple-100',
    'via-purple-400',
    'via-purple-700',
    'to-blue-100',
    'to-blue-200',
    'to-blue-400',
    'to-purple-400',
    'to-purple-600',
    'to-purple-700',
    'to-pink-400',
    'to-pink-600',
    'to-red-500',
    'to-orange-500',
    // Text gradients
    'text-transparent',
    'bg-clip-text',
    // Solid fallbacks
    'bg-purple-800',
    'bg-white',
    // Border colors
    'border-purple-100',
    'border-purple-200',
    'border-purple-300',
    'border-purple-400',
    'border-orange-100',
    'border-yellow-100',
    'border-green-200',
    'border-white',
    // Hover states
    'hover:from-rose-600',
    'hover:to-purple-700',
    'hover:border-purple-400',
    'hover:scale-105',
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
        // Warm sunset palette inspired by homepage hero
        primary: '#7f1d1d', // deep crimson for headings/text
        secondary: '#fff7ed', // soft peach backdrop
        accent: '#f43f5e', // vibrant rose for CTAs
        'accent-hover': '#e11d48', // deeper rose on hover
        highlight: '#fb923c', // amber accent for badges/details
        'muted-rose': '#ffe4e6', // gentle rose background
        'light-bg': '#fff4f7',
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
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.3s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'gradient-xy': 'gradient-xy 3s ease infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'scale-in': 'scale-in 0.3s ease-out forwards',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [typography],
} satisfies Config
