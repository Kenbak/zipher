import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Polyfill Buffer for bip39
      buffer: 'buffer',
    },
  },
  define: {
    // Make Buffer available globally
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: 'index.html',
      },
      external: [
        // Exclude WebZjs from Vite build (loaded dynamically in service worker)
        '@chainsafe/webzjs-wallet',
        '@chainsafe/webzjs-keys',
      ],
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
});
