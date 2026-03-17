import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Country } from "../types";

interface CountryListProps {
    SelectCountry: (country: Country) => void
    SetOverCountry: (country: Country) => void
    SelectedCountry: Country | null
}

export default function CountryList({SelectCountry, SetOverCountry, SelectedCountry}: CountryListProps) {
    const [allCountriesData, setAllCountriesData] = useState<any[]>([]); // Per memorizzare i dati di tutti i paesi
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredCountries, setFilteredCountries] = useState<any[]>([]); // Per memorizzare i paesi filtrati in base alla ricerca

    // Fetch di tutte le bandiere e stati
    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all?fields=name,flags,ccn3,translations,capitalInfo")
        .then(res => res.json())
        .then(data => {
            // Processare i dati delle bandiere e degli stati
            setAllCountriesData(data);
        })
        .catch(err => console.error("Errore caricamento dati paesi:", err));
    }, []);
    
    useEffect(() => {
        const filteredCountries = allCountriesData.filter((country) => {
        const term = searchTerm.trim().toLowerCase();
        if (term == '') return null;

        const candidates = [
            country?.translations?.ita?.common,
            country?.name?.common,
            country?.name?.official,
        ].filter(Boolean).map((s:any) => String(s).toLowerCase());

        return candidates.some((n:any) => n.includes(term));
        });
        setFilteredCountries(filteredCountries);
    }, [searchTerm, allCountriesData]);

    // Quando cambia SelectedCountry, aggiorna i suoi dati completi (bandiera, nome italiano, coordinate)
    useEffect(() => {
        if (!SelectedCountry || allCountriesData.length === 0) return;

        const found = allCountriesData.find(c => c.ccn3 === SelectedCountry.id);
        if (!found) return;

        const latlng = found?.capitalInfo?.latlng;
        const coordinates =
            Array.isArray(latlng) && latlng.length === 2
                ? [latlng[0], latlng[1]] // [lng, lat]
                : undefined;

        const nextCountry: Country = {
            ...SelectedCountry,
            flagUrl: found.flags?.png,
            itName: found?.translations?.ita?.common,
            coordinates: coordinates as any,
        };

        const same =
            SelectedCountry.flagUrl === nextCountry.flagUrl &&
            SelectedCountry.itName === nextCountry.itName &&
            JSON.stringify(SelectedCountry.coordinates) === JSON.stringify(nextCountry.coordinates);

        if (!same) {
            SelectCountry(nextCountry);
        }
    }, [SelectedCountry, allCountriesData, SelectCountry]);

    return (
        <div className="relative z-50 w-3/5"> 
            {/* CONTENITORE RICERCA */}
            <div className="bg-neutral-800/90 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/10 flex items-center gap-3">
                <span className="text-neutral-500 text-lg">🔍</span>
                <input 
                    type="text" 
                    placeholder="Cerca un paese..." 
                    className="bg-transparent text-white placeholder:text-neutral-500 flex-1 focus:outline-none text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* MENU RISULTATI (Stile Amazon) */}
            {searchTerm.trim() !== "" && (
                <>
                <ul 
                    className="absolute w-full bg-neutral-800/95 backdrop-blur-xl rounded-xl mt-2 max-h-80 overflow-y-auto shadow-2xl border border-white/10 custom-scrollbar overflow-x-hidden"
                >
                        {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => {
                                const displayName = country?.translations?.ita?.common || country?.name?.common;
                                return (
                                    <li 
                                        key={country.ccn3} 
                                        className="group flex items-center gap-3 px-4 py-3 hover:bg-blue-600 transition-colors cursor-pointer border-b border-white/5 last:border-0"
                                        onClick={() => {
                                            const countryData: Country = {
                                                id: country.ccn3,
                                                name: country.name?.common,
                                                itName: country?.translations?.ita?.common,
                                                flagUrl: country.flags?.png,
                                            };
                                            SelectCountry(countryData);
                                            SetOverCountry(null as any);
                                            setSearchTerm(""); // Pulisce come Amazon
                                        }}
                                        onMouseEnter={() => SetOverCountry({ id: country.ccn3 } as any)}
                                        onMouseLeave={() => SetOverCountry(null as any)}
                                    >
                                        <img src={country.flags?.png} alt="pu" className="w-8 h-5 object-cover rounded shadow-sm group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium text-neutral-200 group-hover:text-white">
                                            {displayName}
                                        </span>
                                    </li>
                                );
                            })
                        ) : (
                            <li className="px-4 py-8 text-center text-neutral-500 text-sm">
                                🏜️ Nessun paese trovato
                            </li>
                        )}
                    </ul>
                    {typeof document !== "undefined" && createPortal(
                        <div className="fixed inset-0 bg-black/65">
                            <div
                                className="w-full h-full"
                                role="button"
                                tabIndex={0}
                                onClick={() => setSearchTerm("")}
                                onKeyDown={(e) => { if (e.key === "Enter") setSearchTerm(""); }}
                                aria-label="clear-search-overlay"
                            />
                        </div>,
                        document.body
                    )}
                    </>
                )}
            </div>
    );
}