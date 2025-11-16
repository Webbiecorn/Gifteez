import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React vendor bundle
          'react-vendor': ['react', 'react-dom'],

          // Split Firebase into multiple chunks to reduce individual size
          'firebase-core': ['firebase/app'],
          'firebase-auth': ['firebase/auth'],
          'firebase-firestore': ['firebase/firestore'],
          'firebase-storage': ['firebase/storage'],
          'firebase-analytics': ['firebase/analytics'],

          // AI services
          'ai-services': ['@google/genai'],

          // Route-based code splitting
          'pages-core': ['./components/Header', './components/Footer', './components/Toast'],
          'pages-home': [
            './components/HomePage',
            './components/PlannerIllustration',
            './components/QuizIllustration',
          ],
          'pages-blog': ['./components/BlogPage', './components/BlogDetailPage'],
          'pages-shop': [
            './components/ShopPage',
            './components/CartPage',
            './components/CheckoutSuccessPage',
          ],
          'pages-auth': [
            './components/LoginPage',
            './components/SignUpPage',
            './components/AccountPage',
          ],
        },
      },
    },
    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 2000,
  },
  // Add preload hints for critical chunks
  optimizeDeps: {
    include: ['react', 'react-dom', '@google/genai'],
  },
})
