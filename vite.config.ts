import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'assets/*.png', 'wasm/*.wasm', 'corpus/*.json', 'licitaciones/*.json'],
      manifest: {
        name: 'Lex Corporativo — Consulta Federal y Licitaciones',
        short_name: 'Lex Corporativo',
        description: 'Consulta gratuita de legislación federal y buscador de licitaciones abiertas en México (CompraNet).',
        lang: 'es-MX',
        theme_color: '#070b13',
        background_color: '#070b13',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['productivity', 'reference', 'legal'],
        screenshots: [],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,wasm,json}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        // Navegación fallback para SPA
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /\.json$/, /\.wasm$/],
      },
      // Habilitar SW en modo desarrollo para testing
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('sql.js')) {
              return 'vendor-sqljs';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('zustand')) {
              return 'vendor-framework';
            }
            return 'vendor-libs';
          }
        },
      },
    },
  },
});
