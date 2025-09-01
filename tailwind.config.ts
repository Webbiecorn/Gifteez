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
