import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      devOptions: { enabled: false },
      registerType: 'autoUpdate', 
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', '/icons/192x192.png', '/offline.html'],
      manifest: {
        name: 'World Video Guide', // Il nome visualizzato nel banner di installazione
        short_name: 'WorldVGuide', // Versione abbreviata per la schermata home
        description: 'Esplora video da tutto il mondo',
        theme_color: '#171717', // Il colore del tema (da abbinare al tuo CSS)
        display: 'standalone', // Fa sembrare l'app un'app nativa, nascondendo l'interfaccia del browser
        start_url: '/', // Indica al browser da quale pagina iniziare 
        icons: [
          {
            src: '/icons/192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },

      workbox: {
        // 1. PRECACHING: Salva subito i file base dell'app (HTML, JS, CSS)
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html', // Se la navigazione fallisce, mostra index.html
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        
        // 2. RUNTIME CACHING: Gestisce i dati esterni (video, API)
        runtimeCaching: [
          {
            // Cache per i dati dei video (es. thumbnail, video stesso)
            urlPattern: ({ url }) => url.pathname.startsWith('/oembed'),
            handler: 'CacheFirst', // Leggi prima dalla cache, salva banda
            options: {
              cacheName: 'videos-cache',
              cacheableResponse: {
                statuses: [200] // Cache solo risposte valide
              },
              expiration: { maxEntries: 200 }  //
            }
          },
          {
            // Esempio: Cache per le immagini dei video
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst', // Leggi prima dalla cache, salva banda
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 50 }
            }
          },
          {
            // Cache dei dati geografici (geoData)
            urlPattern: ({ url }) => url.pathname.startsWith('/npm/world-atlas@2.0.2'), 
            handler: 'CacheFirst',
            options: {
              cacheName: 'geo-cache',
              cacheableResponse: {
                statuses: [200] // Cache solo risposte valide
              }
            }
          },
          {
            // Cache dei dati degli stati
            urlPattern: ({ url }) => url.pathname.startsWith('/v3.1/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'countries-cache',
              cacheableResponse: {
                statuses: [200]
              }
            }

          }
        ]
      }
    })
  ]
})