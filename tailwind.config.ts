import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: [
    './index.html',
    './**/*.{ts,tsx}',
    '!./node_modules/**'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2C6E7F',
        secondary: '#F5E6CC',
        accent: '#E63946',
        'accent-hover': '#D62828',
        'light-bg': '#FFFBF5',
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        'serif-italic': ['Playfair Display', 'serif'],
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
        'cta-pulse': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(44,110,127,0.0)' },
          '50%': { transform: 'scale(1.02)', boxShadow: '0 8px 24px rgba(44,110,127,0.25)' },
        },
        'card-pop': {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'shine': {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'card-pop': 'card-pop 0.5s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.3s ease-out forwards',
        'cta-pulse': 'cta-pulse 2.4s ease-in-out 1.2s infinite',
        'shine': 'shine 1.2s linear forwards',
      },
    },
  },
  plugins: [typography],
} satisfies Config
