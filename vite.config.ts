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
      includeAssets: [
        '/icons/192x192.png',
        '/icons/512x512.png',
        '/pwa-192x192.png',
        '/pwa-512x512.png',
        '/pwa-maskable-192x192.png',
        '/pwa-maskable-512x512.png',
        '/offline.html',
        '/badge-72x72.png'
      ],
      manifest: {
        name: 'World Video Guide',
        short_name: 'WorldGuide',
        description: 'Esplora video da tutto il mondo',
        theme_color: '#171717',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/badge-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'monochrome'
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      }
    })
  ]
})