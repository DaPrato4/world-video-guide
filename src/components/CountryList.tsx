import { useEffect, useState } from "react";
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
        <>
            <div className="absolute top-4 right-4 bg-neutral-800/80 backdrop-blur-sm rounded-lg p-4 max-h-96 overflow-y-auto shadow-lg border border-neutral-700 z-20 w-100 flex flex-col items-center justify-center">
                <div className="flex flex-row items-center justify-around w-full">
                <h2 className="text-lg font-semibold m-0">Cerca stato</h2>
                <input 
                    type="text" 
                    placeholder="Cerca un paese..." 
                    className="bg-neutral-700 text-neutral-400 placeholder:text-neutral-500 border border-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
                <ul className="text-sm space-y-1 flex-1 w-full overflow-y-auto">
                {filteredCountries.map((country) => {
                    const key = country.id || country.name?.common || JSON.stringify(country);
                    const displayName = country?.translations?.ita?.common || country?.name?.common || country?.name?.official || "Nome sconosciuto";
                    const id = country.ccn3; // codice numerico
                    return (
                    <li key={key} className="hover:bg-blue-600 cursor-pointer">
                        <span 
                            className="flex items-center" 
                            onMouseOver={() => {
                                const countryData: Country = {
                                    id: country.ccn3,
                                    name: country.name?.common || "Nome sconosciuto",
                                    itName: country?.translations?.ita?.common,
                                    flagUrl: country.flags?.png,
                                };
                                SetOverCountry(countryData)
                            }}
                            onMouseLeave={() => SetOverCountry(null as any)}
                            onClick={() => {
                                const countryData: Country = {
                                    id: country.ccn3,
                                    name: country.name?.common || "Nome sconosciuto",
                                    itName: country?.translations?.ita?.common,
                                    flagUrl: country.flags?.png,
                                };
                                SelectCountry(countryData);
                            }}
                        >
                        <img src={country.flags?.png} alt={displayName} className="w-8 h-6 mr-2" />
                        {displayName}
                        {id}
                        </span>
                    </li>
                    );
                })}
                </ul>
            </div>
        </>
    );
}