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
      includeAssets: ['favicon.png', 'assets/*.png', 'wasm/*.wasm', 'corpus/*.json'],
      manifest: {
        name: 'Lex Corporativo PWA',
        short_name: 'Lex PWA',
        description: 'Estación de Trabajo Jurídica PWA con SQLite WASM - Búsqueda normativa offline-first',
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
        shortcuts: [
          {
            name: 'Buscar Normativa',
            short_name: 'Buscar',
            description: 'Búsqueda en leyes federales mexicanas',
            url: '/buscador',
            icons: [{ src: '/favicon.png', sizes: '192x192' }],
          },
          {
            name: 'Historial & Favoritos',
            short_name: 'Historial',
            description: 'Ver búsquedas recientes y artículos guardados',
            url: '/historial',
            icons: [{ src: '/favicon.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,wasm,json}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            // Fuentes y assets estáticos: Cache-First
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // API de Google Gemini: Network-First con timeout
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gemini-api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
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
});
