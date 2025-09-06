import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';

// We use a manualChunks function to keep React tiny, keep AI lib separate, and let Firebase tree-shake per dynamic import.
export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'vendor-react';
          if (id.includes('@google/genai')) return 'vendor-ai';
          // Let firebase modules form their own smaller chunks (no grouping => better caching + less unused code)
        }
      }
    }
  }
});
