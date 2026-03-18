import { useEffect, useState} from 'react';
import WorldMap from '../components/WorldMap';
import CountryOverlay from '../components/CountryOverlay';
import CountryList from '../components/CountryList';
import LoginOverlay from '../components/LoginOverlay';

//firebase
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

import type { Country, video } from '../types';

import { FaRegUserCircle } from "react-icons/fa";
import { TbWorldSearch } from "react-icons/tb";


export default function Home({ user, videos }: { user: any; videos: video[] }) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [overCountry, setOverCountry] = useState<Country | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [geoData, setGeoData] = useState(null);
  const [countriesData, setCountriesData] = useState<Country[]>([]);

  useEffect(() => {
    Promise.all([
        fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json")
            .then(res => res.json()),
        fetch("https://restcountries.com/v3.1/all?fields=name,flags,ccn3,translations,capitalInfo,languages,region,population,area,capital")
            .then(res => res.json())
    ])
    .then(([geoDataFetch, countriesInfo]) => {
        console.log("GeoData:", geoDataFetch);
        console.log("Countries Info:", countriesInfo);
        
        // Salva i dati geografici
        setGeoData(geoDataFetch);

        // Processa i dati dei paesi
        setCountriesData(countriesInfo);
        

    })
    .catch(err => console.error("Errore caricamento dati:", err));
}, []);

  



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
          countriesData={countriesData}
        />
        
        {user ? (
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all border border-blue-500/20 px-4 py-2"
          >
            <FaRegUserCircle className='h-auto w-4'/>
            {user.displayName || user.email?.split('@')[0] || 'Utente'} (Esci)
          </button>
        ) : (
          <button 
            onClick={() => setIsLoginOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all border border-blue-500/20 px-4 py-2"
          >
            Accedi o Registrati
          </button>
        )}
      </header>

      {/* Login Overlay */}
      <LoginOverlay
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* MAIN CONTENT / MAP AREA */}
      <main className="flex-1 relative bg-[#111] overflow-auto">

        <WorldMap
          videos={videos}
          SelectedCountry={selectedCountry}
          SelectCountry={setSelectedCountry} 
          OverCountry={overCountry}
          countriesData={countriesData}
          geoData={geoData}
        />

        {/* OVERLAY MODALE (SPLIT SCREEN) */}
        {selectedCountry && (
          <CountryOverlay 
            country={selectedCountry} 
            videos={videos.filter(v => v.countryCode == Number(selectedCountry.id))} 
            onClose={() => setSelectedCountry(null)} 
            user={user} 
            onLogin={() => setIsLoginOpen(true)}
            flagUrl={selectedCountry?.flagUrl}
          />
        )}
        
      </main>
    </div>
  );
}