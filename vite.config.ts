import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      devOptions: { enabled: false, type: 'module'},
      registerType: 'autoUpdate', 
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
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
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      }
    })
  ]
})