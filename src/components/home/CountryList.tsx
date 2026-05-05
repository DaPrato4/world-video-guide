import { useEffect, useState } from "react";
import {  motion } from "motion/react";
import type { Country } from "../../types";
import {  FiSearch } from "react-icons/fi";

interface CountryListProps {
    SelectCountry: (country: Country) => void
    SetOverCountry: (country: Country) => void
    countriesData: any[]
}

export default function CountryList({SelectCountry, SetOverCountry, countriesData}: CountryListProps) {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredCountries, setFilteredCountries] = useState<any[]>([]); // Per memorizzare i paesi filtrati in base alla ricerca
    const [isModalOpen, setIsModalOpen] = useState(false); // Per gestire l'apertura del modale su mobile

    
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

    return (
        <>
            {/* VERSIONE DESKTOP - Pannello laterale */}
            <div className="hidden lg:flex z-20 w-1/6 h-fit mr-6 mt-6 flex-col"> 
                {/* ... (codice desktop invariato) ... */}
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

            {/* VERSIONE MOBILE - Bottom Sheet Trascinabile */}
            <div className={`lg:hidden fixed inset-x-0 bottom-0 z-20 flex flex-col items-center transition-all ${isModalOpen ? 'h-[80vh]' : 'h-17.5'}`}>
                <motion.div
                    initial={{ y: "calc(100% - 70px)" }}
                    animate={{ y: isModalOpen ? 0 : "calc(100% - 70px)" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-full max-w-md bg-neutral-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden h-[80vh]"
                >
                    {/* Handle per il drag visivo */}
                    <div 
                        className="w-full py-3 flex flex-col items-center cursor-pointer"
                        onClick={() => setIsModalOpen(!isModalOpen)}
                    >
                        <div className="w-12 h-1.5 bg-neutral-700 rounded-full mb-2" />
                        <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-widest">
                            {isModalOpen ? "Chiudi" : "Cerca Paese"} 
                            {!isModalOpen && <FiSearch className="text-blue-500" />}
                        </div>
                    </div>

                    {/* Contenuto della ricerca */}
                    <div className="px-6 pb-4 flex flex-col h-full overflow-hidden">
                        <div className="bg-neutral-800/50 rounded-2xl p-3 border border-white/5 flex items-center gap-3 mb-4">
                            <FiSearch className="text-neutral-500" />
                            <input 
                                type="text" 
                                placeholder="Dove vuoi andare?" 
                                className="bg-transparent text-white placeholder:text-neutral-500 flex-1 focus:outline-none text-base"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsModalOpen(true)}
                            />
                        </div>

                        {/* Lista Risultati */}
                        <div className="flex-1 overflow-y-auto scrollbar-none pb-20">
                            <ul className="space-y-1">
                                {(searchTerm.trim() !== "" ? filteredCountries : countriesData).map((country) => {
                                    const displayName = country?.translations?.ita?.common || country?.name?.common;
                                    return (
                                        <motion.li 
                                            key={country.ccn3}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-800 transition-colors active:bg-blue-600/20"
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
                                                setIsModalOpen(false);
                                                setSearchTerm("");
                                            }}
                                        >
                                            <img src={country.flags?.png} alt="" className="w-10 h-7 object-cover rounded-lg shadow-md" />
                                            <span className="text-base font-medium text-neutral-200">
                                                {displayName}
                                            </span>
                                        </motion.li>
                                    );
                                })}
                                {searchTerm.trim() !== "" && filteredCountries.length === 0 && (
                                    <div className="py-20 text-center">
                                        <span className="text-4xl block mb-2">🏜️</span>
                                        <p className="text-neutral-500">Nessun paese trovato</p>
                                    </div>
                                )}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}