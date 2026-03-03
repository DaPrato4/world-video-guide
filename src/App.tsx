import { useState, useEffect } from 'react';
import WorldMap from './components/WorldMap';
import CountryOverlay from './components/CountryOverlay';
import sampleVideos from './assets/sample_video';

// Dati finti per la demo (MVP)
const MOCK_VIDEOS = sampleVideos;

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [geoData, setGeoData] = useState<any>(null);

  // Fetch dei dati della mappa al primo caricamento
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json")
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Errore caricamento GeoJSON:", err));
  }, []);

  // Schermata di caricamento
  if (!geoData) {
    return (
      <div className="w-screen h-screen bg-neutral-900 flex items-center justify-center text-white">
        Caricamento mappa...
      </div>
    );
  }

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
        
        <WorldMap 
          geoData={geoData} 
          videos={MOCK_VIDEOS} 
          SelectCountry={setSelectedCountry} 
        />

        {/* OVERLAY MODALE (SPLIT SCREEN) */}
        {selectedCountry && (
          <CountryOverlay 
            country={selectedCountry} 
            videos={MOCK_VIDEOS} 
            onClose={() => setSelectedCountry(null)} 
          />
        )}
        
      </main>
    </div>
  );
}