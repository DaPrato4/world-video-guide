import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', 
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/icon-192x192.png'],
      manifest: {
        name: 'World Video Guide', // Il nome visualizzato nel banner di installazione
        short_name: 'WorldVGuide', // Versione abbreviata per la schermata home
        description: 'Esplora video da tutto il mondo',
        theme_color: '#171717', // Il colore del tema (da abbinare al tuo CSS)
        display: 'standalone', // Fa sembrare l'app un'app nativa, nascondendo l'interfaccia del browser
        start_url: '/', // Indica al browser da quale pagina iniziare 
        icons: [
          {
            src: 'icons/192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },

      workbox: {
        // 1. PRECACHING: Salva subito i file base dell'app (HTML, JS, CSS)
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html', // Per supportare il routing client-side (React Router)
        
        // 2. RUNTIME CACHING: Gestisce i dati esterni (video, API)
        runtimeCaching: [
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
            // Esempio: Cache per i dati dei video (Firebase/API)
            urlPattern: ({ url }) => url.pathname.startsWith('/api'), 
            handler: 'CacheFirst',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: {
                statuses: [200] // Cache solo risposte valide
              }
            }
          }
        ]
      }
    })
  ]
})