import { useEffect, useState} from 'react';
import WorldMap from './components/WorldMap';
import CountryOverlay from './components/CountryOverlay';
import CountryList from './components/CountryList';

//firebase
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { auth } from "./firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

import type { Country, video } from './types';

import { FaRegUserCircle } from "react-icons/fa";
import { TbWorldSearch } from "react-icons/tb";


export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [overCountry, setOverCountry] = useState<Country | null>(null);
  const [videos, setVideos] = useState<video[]>([]);

  // stato per l'utente loggato
  const [user, setUser] = useState<any>(null);

  // Unico useEffect che registra sia l'auth listener che l'onSnapshot dei video
  useEffect(() => {
    // Listener autenticazione
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // onSnapshot per la collection "videos"
    const videosRef = collection(db, "videos");
    const unsubscribeVideos = onSnapshot(videosRef, async (snapshot) => {
      const videoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as video[];

      const enrichedVideos = await Promise.all(
        videoList.map(async (element) => {
          try {
            const res = await fetch(`https://www.youtube.com/oembed?url=${element.url}&format=json`);
            const data = await res.json();

            return {
              ...element,
              title: data.title,
              thumbnail: data.thumbnail_url,
            };
          } catch (err) {
            console.error("Errore recupero titolo video:", err);
            return element;
          }
        })
      );

      setVideos(enrichedVideos);
    });

    // Cleanup: annulla entrambi gli iscritti quando il componente viene smontato
    return () => {
      try { unsubscribeAuth(); } catch (e) { /* noop */ }
      try { unsubscribeVideos(); } catch (e) { /* noop */ }
    };
  }, []);

  // Funzione per fare Login con Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Errore durante il login:", error);
    }
  };


  return (
    <div className="flex flex-col w-screen h-screen bg-neutral-900 text-white overflow-hidden font-sans">

      {/* HEADER */}
      <header className="py-6 px-4 bg-neutral-800 border-b border-neutral-700 text-center shadow-lg z-10 flex flex-row items-center justify-around gap-4">
        
      <div>

        <span className='flex flex-row gap-3 text-blue-500'>
          <TbWorldSearch className='h-auto w-8'/>
          <h1 className="text-3xl font-bold tracking-widest text-blue-500">
            WORLD GUIDE
          </h1>
        </span>
        <p className="text-neutral-400 mt-1">Seleziona un paese evidenziato per vedere i contenuti</p>
      </div>
        
        <CountryList 
          SelectCountry={setSelectedCountry} 
          SetOverCountry={setOverCountry}
          SelectedCountry={selectedCountry}
        />


        {/* Simple auth UI: mostra login/logout e nome utente (minima integrazione) */}
        <div className="mt-3 flex justify-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-neutral-300">Ciao, {user.displayName ?? user.email}</span>
              <button
                onClick={async () => { try { await signOut(auth); } catch (e) { console.error(e); } }}
                className="px-3 py-1 bg-neutral-700 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <button onClick={loginWithGoogle} className="px-3 py-1 bg-blue-500 rounded">Accedi con Google</button>
          )}
            <FaRegUserCircle className="text-2xl text-neutral-400" />
        </div>
      </header>

      {/* MAIN CONTENT / MAP AREA */}
      <main className="flex-1 relative bg-[#111] overflow-auto">

        {/* <CountryList 
          SelectCountry={setSelectedCountry} 
          SetOverCountry={setOverCountry}
          SelectedCountry={selectedCountry}
        /> */}

        <WorldMap
          videos={videos}
          SelectedCountry={selectedCountry}
          SelectCountry={setSelectedCountry} 
          OverCountry={overCountry}
        />

        {/* OVERLAY MODALE (SPLIT SCREEN) */}
        {selectedCountry && (
          <CountryOverlay 
            country={selectedCountry} 
            videos={videos.filter(v => v.countryCode == Number(selectedCountry.id))} 
            onClose={() => setSelectedCountry(null)} 
            user={user} 
            onLogin={loginWithGoogle}
          />
        )}
        
      </main>
    </div>
  );
}