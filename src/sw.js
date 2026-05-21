import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// 1. PRECACHING
precacheAndRoute(self.__WB_MANIFEST);

// Risoluzione problema con la bandiera dell'Afghanistan
registerRoute(
  ({ url }) => url.host === 'upload.wikimedia.org' && url.pathname.includes('Flag_of_the_Taliban'),
  
  async () => {
    const urlGiusta = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Flag_of_Afghanistan_%282013%E2%80%932021%29.svg/960px-Flag_of_Afghanistan_%282013%E2%80%932021%29.svg.png';
    
    try {
      const response = await fetch(urlGiusta);
      return response;
    } catch (err) {
      console.error("Errore nel caricamento della bandiera sostitutiva", err);
      return fetch('/icons/192x192.png');
    }
  }
);

// 2. NAVIGATE FALLBACK: Se sei offline e ricarichi una pagina, mostra index.html
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

const firebaseConfig = {
  apiKey: 'AIzaSyBXIpv19n2NcA8uMpREfrHAgMhpVbQaKO8',
  authDomain: 'prova-mappa-f1d90.firebaseapp.com',
  projectId: 'prova-mappa-f1d90',
  storageBucket: 'prova-mappa-f1d90.firebasestorage.app',
  messagingSenderId: '657564154400',
  appId: '1:657564154400:web:8daf0ff43bd049a7c1da45',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Gestione notifiche quando l'app è chiusa o in background
onBackgroundMessage(messaging, async (payload) => {
  
  const notificationTitle = payload.data.title || 'Nuovo aggiornamento!';

  let iconUrl;
  try {
    const res = await fetch(`https://restcountries.com/v3.1/alpha/${payload.data.countryCode}`);
    if (res.ok) {
      const countryData = await res.json();
      const resIcon = await fetch(`https://hatscripts.github.io/circle-flags/flags/${countryData[0].cca2.toLowerCase()}.svg`)
      if (resIcon.ok) {
        iconUrl = `https://hatscripts.github.io/circle-flags/flags/${countryData[0].cca2.toLowerCase()}.svg`;
      }else{
        iconUrl = '/icons/192x192.png';
      }
    }
  } catch (err) {
    console.error('[sw.js] Errore nel recupero icona del paese:', err);
  }

  const notificationOptions = {
    body: payload.data.body,
    icon: iconUrl,    // Icona a colori (quella che si vede nel popup)
    badge: '/badge-72x72.png',   // Icona bianca (quella nella barra in alto)
    vibrate: [100, 50, 100],     // vibrazione personalizzata
    data: {
      url: payload.data?.url || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});