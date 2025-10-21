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
        // Brand Colors - Primary palette
        primary: {
          DEFAULT: '#7f1d1d', // deep crimson for headings/text
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        
        // Secondary Colors - Backgrounds
        secondary: {
          DEFAULT: '#fff7ed', // soft peach backdrop
          50: '#fffbf5',
          100: '#fff7ed',
          200: '#fef3e2',
          300: '#fde8c8',
          400: '#fcd9a6',
        },
        
        // Accent Colors - CTAs & Interactive elements
        accent: {
          DEFAULT: '#f43f5e', // vibrant rose for CTAs
          hover: '#e11d48', // deeper rose on hover
          light: '#fb7185',
          dark: '#be123c',
        },
        
        // Highlight Colors - Badges & accents
        highlight: {
          DEFAULT: '#fb923c', // amber accent
          light: '#fdba74',
          dark: '#ea580c',
        },
        
        // Muted Colors - Subtle backgrounds
        muted: {
          rose: '#ffe4e6',
          purple: '#f3e8ff',
          blue: '#dbeafe',
          green: '#d1fae5',
          yellow: '#fef3c7',
        },
        
        // Neutral Colors - Text & UI elements
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        
        // Semantic Colors - Status & feedback
        success: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
          bg: '#d1fae5',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          bg: '#fee2e2',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          bg: '#fef3c7',
        },
        info: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
          bg: '#dbeafe',
        },
        
        // Legacy colors (keep for backwards compatibility)
        'light-bg': '#fff4f7',
        'accent-hover': '#e11d48',
        'muted-rose': '#ffe4e6',
      },
      
      // Spacing scale - Consistent spacing tokens
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
        '34': '8.5rem',   // 136px
        '38': '9.5rem',   // 152px
        '42': '10.5rem',  // 168px
        '46': '11.5rem',  // 184px
        '50': '12.5rem',  // 200px
      },
      
      // Border Radius - Consistent rounding
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',    // 4px
        DEFAULT: '0.5rem',  // 8px - default for most elements
        'md': '0.75rem',    // 12px
        'lg': '1rem',       // 16px - cards, modals
        'xl': '1.25rem',    // 20px - prominent cards
        '2xl': '1.5rem',    // 24px - hero sections
        '3xl': '2rem',      // 32px - extra large
        'full': '9999px',   // pills, badges
      },
      fontFamily: {
        sans: ['Inter', 'Open Sans', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        body: ['Open Sans', 'system-ui', 'sans-serif'],
        'serif-italic': ['Playfair Display', 'serif'],
      },
      
      // Font weights
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      
      // Line height scale
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      
      // Letter spacing scale
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      
      // Font sizes with corresponding line heights
      
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
        'subtle-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.5' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(10px, -10px) rotate(5deg)' },
          '66%': { transform: 'translate(-8px, 8px) rotate(-5deg)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(-12px, 12px) rotate(-7deg)' },
          '66%': { transform: 'translate(8px, -15px) rotate(7deg)' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-12px) scale(1.01)' },
        },
        'pulse-slower': {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '0.15' },
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
        'subtle-float': 'subtle-float 6s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'float-delayed': 'float-delayed 10s ease-in-out infinite 1s',
        'float-gentle': 'float-gentle 5s ease-in-out infinite',
        'pulse-slower': 'pulse-slower 6s ease-in-out infinite',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      
      // Box Shadow tokens - Elevation system
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(244, 63, 94, 0.3)', // Accent glow for CTAs
        'glow-lg': '0 0 40px rgba(244, 63, 94, 0.4)', // Larger accent glow
        'none': 'none',
      },
      
      // Z-index scale - Layering system
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50', // Modals, overlays
        '60': '60', // Tooltips
        '70': '70', // Dropdowns
        '80': '80', // Fixed navigation
        '90': '90', // Cookie banners
        '100': '100', // Top layer (urgent notifications)
      },
      
      // Typography scale classes
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(64 64 64)',
            '--tw-prose-headings': 'rgb(127 29 29)',
            '--tw-prose-links': 'rgb(244 63 94)',
            '--tw-prose-bold': 'rgb(38 38 38)',
            '--tw-prose-quotes': 'rgb(115 115 115)',
            '--tw-prose-code': 'rgb(244 63 94)',
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config
