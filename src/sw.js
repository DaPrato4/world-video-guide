import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// 1. PRECACHING
precacheAndRoute(self.__WB_MANIFEST);

// Risoluzione problema con la bandiera dell'Afghanistan
registerRoute(
  ({ url }) => url.host === 'upload.wikimedia.org' && url.pathname.includes('Flag_of_the_Taliban'),
  
  async () => {    
    // Questo è l'URL della bandiera che VUOI far vedere
    const urlGiusta = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Flag_of_Afghanistan_%282013%E2%80%932021%29.svg/960px-Flag_of_Afghanistan_%282013%E2%80%932021%29.svg.png';
    
    try {
      const response = await fetch(urlGiusta);
      return response;
    } catch (err) {
      console.error("Errore nel caricamento della bandiera sostitutiva", err);
      return fetch('/icons/icon-192x192.png');
    }
  }
);

// 2. NAVIGATE FALLBACK: Se sei offline e ricarichi una pagina, mostra index.html
// (Sostituisce navigateFallback: '/index.html')
const fallbackHandler = () => fetch('/index.html');
const navigationRoute = new NavigationRoute(fallbackHandler, {
  allowlist: [/^(?!\/__).*/],
});
registerRoute(navigationRoute);

// Cache per i dati dei video (oembed)
registerRoute(
  ({ url }) => url.pathname.startsWith('/oembed'),
  new CacheFirst({
    cacheName: 'videos-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 200 })
    ]
  })
);

// Cache per tutte le immagini (thumbnail, icone)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50 })
    ]
  })
);

// Cache dei dati geografici (atlas)
registerRoute(
  ({ url }) => url.pathname.includes('world-atlas@2.0.2'),
  new CacheFirst({
    cacheName: 'geo-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] })
    ]
  })
);

// Cache dei dati degli stati (RestCountries API)
registerRoute(
  ({ url }) => url.pathname.includes('/v3.1/'),
  new CacheFirst({
    cacheName: 'countries-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] })
    ]
  })
);
