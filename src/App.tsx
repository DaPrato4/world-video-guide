import { useEffect, useState} from 'react';
import WorldMap from './components/WorldMap';
import CountryOverlay from './components/CountryOverlay';
import CountryList from './components/CountryList';
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

import type { Country, video } from './types';


export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [overCountry, setOverCountry] = useState<Country | null>(null);
  const [videos, setVideos] = useState<video[]>([]);

  useEffect(() => {
    // Riferimento alla collezione "videos" su Firebase
    const videosRef = collection(db, "videos");

    // onSnapshot è magico: se aggiungi un video dal sito di Firebase, 
    // la tua mappa si aggiornerà DA SOLA in tempo reale senza ricaricare la pagina!
    const unsubscribe = onSnapshot(videosRef, async (snapshot) => {
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

    return () => unsubscribe(); // Pulizia quando il componente viene smontato
  }, []);


  return (
    <div className="flex flex-col w-screen h-screen bg-neutral-900 text-white overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="py-6 px-4 bg-neutral-800 border-b border-neutral-700 text-center shadow-lg z-10">
        <h1 className="text-3xl font-bold tracking-widest text-blue-500">
          🌍 WORLD VIDEO GUIDE
        </h1>
        <p className="text-neutral-400 mt-1">Seleziona un paese evidenziato per vedere i contenuti</p>
      </header>

      {/* MAIN CONTENT / MAP AREA */}
      <main className="flex-1 relative bg-[#111] overflow-auto">

        <CountryList 
          SelectCountry={setSelectedCountry} 
          SetOverCountry={setOverCountry}
          SelectedCountry={selectedCountry}
        />

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
          />
        )}
        
      </main>
    </div>
  );
}