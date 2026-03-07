import { useState} from 'react';
import WorldMap from './components/WorldMap';
import CountryOverlay from './components/CountryOverlay';
import CountryList from './components/CountryList';

import sampleVideos from './assets/sample_video';
import type { Country } from './types';

// Dati finti per la demo (MVP)
const MOCK_VIDEOS = sampleVideos;

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [overCountry, setOverCountry] = useState<Country | null>(null);


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
          videos={MOCK_VIDEOS}
          SelectedCountry={selectedCountry}
          SelectCountry={setSelectedCountry} 
          OverCountry={overCountry}
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