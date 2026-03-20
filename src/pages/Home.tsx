import { useEffect, useState} from 'react';
import WorldMap from '../components/WorldMap';
import CountryOverlay from '../components/CountryOverlay';
import CountryList from '../components/CountryList';
import LoginOverlay from '../components/LoginOverlay';

//firebase
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

import type { Country, user, video } from '../types';

import { FaRegUserCircle } from "react-icons/fa";
import { TbWorldSearch } from "react-icons/tb";


export default function Home({ user, videos }: { user: user | null; videos: video[] }) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [overCountry, setOverCountry] = useState<Country | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [geoData, setGeoData] = useState(null);
  const [countriesData, setCountriesData] = useState<Country[]>([]);

  useEffect(() => {
    const fetchGeo = async () => {
      try {
        const res = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json");
        const geo = await res.json();
        setGeoData(geo);
      } catch (err) {
        console.error("Errore caricamento geoData:", err);
      }
    };

    const fetchCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,flags,ccn3,translations,capitalInfo,languages,region,population,area,capital");
        const countriesInfo = await res.json();
        setCountriesData(countriesInfo);
      } catch (err) {
        console.error("Errore caricamento countriesInfo:", err);
      }
    };

    // Avvia le due fetch in modo indipendente
    fetchGeo();
    fetchCountries();
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
      <main className="flex relative bg-[#111] h-full w-full overflow-hidden">

        <WorldMap
          videos={videos}
          SelectedCountry={selectedCountry}
          SelectCountry={setSelectedCountry} 
          OverCountry={overCountry}
          countriesData={countriesData}
          geoData={geoData}
        />

        <CountryList 
          SelectCountry={setSelectedCountry} 
          SetOverCountry={setOverCountry}
          SelectedCountry={selectedCountry}
          countriesData={countriesData}
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