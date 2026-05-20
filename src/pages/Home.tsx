import { useEffect, useState} from 'react';
import WorldMap from '../components/home/WorldMap';
import CountryOverlay from '../components/home/CountryOverlay';
import CountryList from '../components/home/CountryList';
import LoginOverlay from '../components/common/LoginOverlay';
import RegionList from '../components/home/RegionList';

import type { Country, Region, user, video } from '../types';

import Header from '../components/common/Header';
import { GiCastle } from 'react-icons/gi';


export default function Home({ user, videos }: { user: user | null; videos: video[] }) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [overCountry, setOverCountry] = useState<Country | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const europe : Region =   {
      name: "Europa",
      icon: <GiCastle className="text-2xl" />,
      coordinates: [40, 15],
      zoom: 5,
  }
  const [selectedRegion, setSelectedRegion] = useState<Region>(europe);

  const [geoData, setGeoData] = useState<any>(null);
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

  // Quando cambia SelectedCountry, aggiorna i suoi dati completi (bandiera, nome italiano, coordinate)
  useEffect(() => {
      if (!selectedCountry || countriesData.length === 0) return;
      const found : any = countriesData.find((c:any) => c.ccn3 === selectedCountry.id) || countriesData.find((c: any) => String(c.name.common) === String(selectedCountry.name));
      if (!found) return;

      const latlng = found?.capitalInfo?.latlng;
      const coordinates =
          Array.isArray(latlng) && latlng.length === 2
              ? [latlng[0], latlng[1]] // [lng, lat]
              : undefined;

      const nextCountry: Country = {
          ...selectedCountry,
          flagUrl: found.flags?.png,
          itName: found?.translations?.ita?.common,
          coordinates: coordinates as any,
      };

      const same =
          selectedCountry.flagUrl === nextCountry.flagUrl &&
          selectedCountry.itName === nextCountry.itName &&
          JSON.stringify(selectedCountry.coordinates) === JSON.stringify(nextCountry.coordinates);

      if (!same) {
          setSelectedCountry(nextCountry);
      }
  }, [selectedCountry, countriesData, setSelectedCountry]);



  return (
    <div className="flex flex-col w-screen h-screen bg-neutral-900 text-white overflow-hidden font-sans">

      <Header user={user} page='Home' ></Header>

      {/* Login Overlay */}
      <LoginOverlay
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* MAIN CONTENT / MAP AREA */}
      <main className="flex relative bg-[#111] h-full w-full overflow-hidden">

        <RegionList
          onRegionSelect={setSelectedRegion}
          selectedRegion={selectedRegion?.name || null}
        />

        <WorldMap
          videos={videos}
          SelectedCountry={selectedCountry}
          SelectCountry={setSelectedCountry} 
          OverCountry={overCountry}
          countriesData={countriesData}
          geoData={geoData}
          selectedRegion={selectedRegion}
        />

        <CountryList 
          SelectCountry={setSelectedCountry} 
          SetOverCountry={setOverCountry}
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