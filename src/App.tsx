import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import { auth, db } from "./firebase";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { user, video } from "./types";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { requestForToken } from './firebase';
import { EXPRESS_API_URL } from "./apiConfig";
import Alert from "./components/common/Alert";
import { getMessaging, onMessage } from "firebase/messaging";


// App.tsx
export default function App() {
  const [user, setUser] = useState<user | null>(null);
  const [videos, setVideos] = useState<video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);
  const [notificationAlert, setNotificationAlert] = useState<{ title: string; message: string } | null>(null);

  const prevSubscriptionsRef = useRef<string[] | null>(null);

  useEffect(() => {
    requestForToken();

    const messaging = getMessaging();

    const unsubscribeForeground = onMessage(messaging, (payload: any) => {
      
      const title = payload?.notification?.title ?? payload?.data?.title ?? "Notifica";
      const body = payload?.notification?.body ?? payload?.data?.body ?? "Hai una nuova notifica! Controlla il tuo profilo.";

      // Mostriamo l'Alert a schermo
      setNotificationAlert({
        title: `${title}`,
        message: `${body}`
      });
    });

    return () => {
      unsubscribeForeground();
    };

  }, []);

  //Gestione autenticazione e dati utente in tempo reale
  useEffect(() => {
    let unsubscribeUserDoc: () => void = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);

        const setupNotifications = async () => {
          try {
            const currentToken = await requestForToken();
            
            if (currentToken) {
              await fetch(`${EXPRESS_API_URL}/subscribeAll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  token: currentToken, 
                  uid: firebaseUser.uid 
                })
              });
              
            }
          } catch (error) {
            console.error("Errore durante la registrazione per le notifiche:", error);
          }
        };
        setupNotifications();

        // Ascolta i cambiamenti in tempo reale sul documento dell'utente
        unsubscribeUserDoc = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const newSubscriptions = userData.subscriptions || [];

            if (prevSubscriptionsRef.current !== null) {
              const addedCountries = newSubscriptions.filter(
                (country : string) => !prevSubscriptionsRef.current!.includes(country)
              );

              const removedCountries = prevSubscriptionsRef.current.filter(
                (country : string) => !newSubscriptions.includes(country)
              );

              if (addedCountries.length > 0 || removedCountries.length > 0) {
                console.log("Rilevate nuove iscrizioni da un altro dispositivo:", addedCountries);
                console.log("Rilevate cancellazioni da un altro dispositivo:", removedCountries);

                try {
                  const currentToken = await requestForToken();
                  if (currentToken) {
                    // eseguiamo tutte le iscrizioni ai nuovi paesi aggiunti
                    for (const country of addedCountries) {
                      await fetch(`${EXPRESS_API_URL}/subscribe`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          token: currentToken, 
                          country: country, 
                          uid: firebaseUser.uid 
                        })
                      });
                    }

                    // eseguiamo tutte le cancellazioni dai paesi rimossi
                    for (const country of removedCountries) {
                      await fetch(`${EXPRESS_API_URL}/unsubscribe`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          token: currentToken, 
                          country: country, 
                          uid: firebaseUser.uid 
                        })
                      });
                    }
                    console.log("Dispositivo auto-sincronizzato con i nuovi paesi!");
                  }
                } catch (error) {
                  console.error("Errore di auto-sincronizzazione in background:", error);
                }
              }
            }
            prevSubscriptionsRef.current = newSubscriptions;
            console.log("Dati utente aggiornati in tempo reale:", userData);

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: userData.displayName ?? "",
              role: (userData.role as "user" | "moderator" | "admin") ?? "user",
              photoURL: firebaseUser.photoURL ?? "",
              stats: userData.stats || { pendingVideos: 0, approvedVideos: 0, rejectedVideos: 0, suggestedVideos: 0 },
              subscriptions: userData.subscriptions || [],
              reportedComments: userData.reportedComments || [],
              reportedVideos: userData.reportedVideos || [],
            });
          } else {
            // Se il documento non esiste, lo creiamo (fatto una sola volta)
            const newUser: user = {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "",
              role: "user",
              photoURL: firebaseUser.photoURL ?? "",
              stats: { pendingVideos: 0, approvedVideos: 0, rejectedVideos: 0, suggestedVideos: 0 },
              subscriptions: [],
              reportedComments: [],
              reportedVideos: [],
            };
            setDoc(userDocRef, newUser);
            setUser(newUser);
          }
          setLoading(false);
        });
      } else {
        // L'utente ha fatto logout
        if (unsubscribeUserDoc) unsubscribeUserDoc();
        setUser(null);
        setLoading(false);
      }
    });

    // 2. Caricamento Video
    const unsubscribeVideos = onSnapshot(collection(db, "videos"), (snapshot) => {
      const vList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as video[];
      setVideos(vList);
    });

    return () => { 
      unsubscribeAuth(); 
      unsubscribeVideos(); 
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  // Gestione stato online/offline
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const offlineBanner = isOffline ? (
    <div
      className="fixed top-20 max-[345px]:top-28 left-3 right-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-2xl rounded-2xl border border-amber-400/30 bg-amber-500/95 px-3 py-2 text-xs font-semibold text-black shadow-lg backdrop-blur-md md:top-28 sm:px-4 sm:py-3 sm:text-sm"
    >
      <div className="mx-auto flex items-center justify-center gap-2 text-center leading-tight">
        <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-black/80 animate-pulse sm:h-2.5 sm:w-2.5" />
        <span className="sm:hidden">Sei offline. Riconnettiti a internet.</span>
        <span className="hidden sm:inline">Sei offline. Connettiti a internet per aggiornare video, immagini e sincronizzare i dati.</span>
      </div>
    </div>
  ) : null;


  if (loading) return (
  <>
    <div className="bg-black h-screen text-white flex items-center justify-center font-bold tracking-widest pt-12">
      <div className="flex items-center space-x-4">
        <svg
          className="w-10 h-10 text-white animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span>CARICAMENTO...</span>
      </div>
    </div>
  </>);

  return (
    <>
      {offlineBanner}
      {notificationAlert && (
        <Alert
          type="info"
          message={notificationAlert.message}
          duration={5000}
          onClose={() => setNotificationAlert(null)}
        />
      )}
      <Router>
        <Routes>
          <Route path="/" element={<Home user={user} videos={videos} />} />
          <Route path="/admin" element={<Admin user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="*" element={
            <div className="min-h-screen bg-black text-white">
              <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
                <div className="space-y-2">
                  <p className="text-sm sm:text-2xl font-medium uppercase tracking-[0.4em] text-slate-400">404</p>
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Page not found</h1>
                </div>

                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Back to home
                </Link>
              </div>
            </div> }
          />
        </Routes>
      </Router>
    </>
  );
}