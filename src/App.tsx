import { useState, useEffect } from 'react';
import WorldMap from './components/WorldMap';
import CountryOverlay from './components/CountryOverlay';

// Dati finti per la demo (MVP)
const MOCK_VIDEOS = [
  { id: 1, title: "Roma: Passeggiata al Colosseo", countryCode: "ITA", url: "https://www.youtube.com/watch?v=example1" },
  { id: 2, title: "Tokyo: Luci di Shibuya", countryCode: "JPN", url: "https://www.youtube.com/watch?v=example2" },
  { id: 3, title: "NYC: Central Park Tour", countryCode: "USA", url: "https://www.youtube.com/watch?v=example3" },
  { id: 4, title: "Brasile: Carnevale a Rio", countryCode: "BRA", url: "https://www.youtube.com/watch?v=example4" }
];

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