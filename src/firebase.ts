import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});


// Inizializza Firebase Cloud Messaging
export const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const currentToken = await getToken(messaging, { 
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (currentToken) {
      console.log('Token generato:', currentToken);
      // da implementare invio del token al backend per associarlo all'utente e poter inviare notifiche mirate
      return currentToken;
    } else {
      console.log('Nessun token disponibile. Richiedi il permesso.');
    }
  } catch (err) {
    console.error('Errore durante il recupero del token:', err);
  }
};

// Notifiche ad app aperta
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Messaggio ricevuto in foreground:", payload);
      resolve(payload);
    });
  });