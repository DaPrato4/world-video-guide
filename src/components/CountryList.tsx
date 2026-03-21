import { useEffect, useState } from "react";
import type { Country } from "../types";

interface CountryListProps {
    SelectCountry: (country: Country) => void
    SetOverCountry: (country: Country) => void
    SelectedCountry: Country | null
    countriesData: any[]
}

export default function CountryList({SelectCountry, SetOverCountry, SelectedCountry, countriesData}: CountryListProps) {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredCountries, setFilteredCountries] = useState<any[]>([]); // Per memorizzare i paesi filtrati in base alla ricerca

    
    useEffect(() => {
        const filteredCountries = countriesData.filter((country: { translations: { ita: { common: any; }; }; name: { common: any; official: any; }; }) => {
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
    }, [searchTerm, countriesData]);

    // Quando cambia SelectedCountry, aggiorna i suoi dati completi (bandiera, nome italiano, coordinate)
    useEffect(() => {
        if (!SelectedCountry || countriesData.length === 0) return;
        const found = countriesData.find(c => c.ccn3 === SelectedCountry.id);
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
    }, [SelectedCountry, countriesData, SelectCountry]);

    return (
        <div className="z-50 w-1/6 h-fit mr-6 mt-6 flex flex-col"> 
            {/* CONTENITORE RICERCA */}
            <div className="bg-neutral-800/90 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/10 flex items-center gap-3">
                <span className="text-neutral-500 text-lg">🔍</span>
                <input 
                    type="text" 
                    placeholder="Cerca un paese..." 
                    className="bg-transparent text-white placeholder:text-neutral-500 flex-1 focus:outline-none text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={(e) => e.target.select()}
                />
            </div>

            {/* MENU RISULTATI*/}
            <ul 
                className="w-full bg-neutral-800/95 backdrop-blur-xl rounded-xl mt-2 shadow-2xl border border-white/10 overflow-y-auto max-h-[calc(100vh-13.9rem)] min-h-[calc(100vh-13.9rem)] scrollbar-none"
            >
                {searchTerm.trim() !== "" ? (
                    filteredCountries.length > 0 ? (
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
                                            coordinates: country.capitalInfo.latlng,
                                            capitalName: country.capital
                                        };
                                        SelectCountry(countryData);
                                        SetOverCountry(null as any);
                                        setSearchTerm("");
                                        console.log("Paese selezionato:", country);
                                    }}
                                    onMouseEnter={() => {SetOverCountry({ id: country.ccn3, coordinates: country.capitalInfo.latlng, capitalName: country.capital } as Country) }}
                                    onMouseLeave={() => SetOverCountry(null as any)}
                                >
                                    <span className="w-8 flex justify-center">
                                        <img src={country.flags?.png} alt={displayName} className="max-w-8 h-5 object-contain rounded-xs shadow-sm group-hover:scale-110 transition-transform" />
                                    </span>
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
                    )
                ) : (
                    countriesData.map((country) => {
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
                                        coordinates: country.capitalInfo.latlng,
                                        capitalName: country.capital
                                    };
                                    SelectCountry(countryData);
                                    SetOverCountry(null as any);
                                    console.log("Paese selezionato:", country);
                                }}
                                onMouseEnter={() => {SetOverCountry({ id: country.ccn3, coordinates: country.capitalInfo.latlng, capitalName: country.capital } as Country) }}
                                onMouseLeave={() => SetOverCountry(null as any)}
                            >
                                <span className="w-8 flex justify-center">
                                    <img src={country.flags?.png} alt={displayName} className="max-w-8 h-5 object-contain rounded-xs shadow-sm group-hover:scale-110 transition-transform" />
                                </span>
                                <span className="text-sm font-medium text-neutral-200 group-hover:text-white">
                                    {displayName}
                                </span>
                            </li>
                        );
                    })
                )}
            </ul>
            </div>
    );
}