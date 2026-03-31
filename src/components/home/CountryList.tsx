import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Country } from "../../types";
import { FiArrowDown, FiSearch } from "react-icons/fi";

interface CountryListProps {
    SelectCountry: (country: Country) => void
    SetOverCountry: (country: Country) => void
    SelectedCountry: Country | null
    countriesData: any[]
}

export default function CountryList({SelectCountry, SetOverCountry, SelectedCountry, countriesData}: CountryListProps) {
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
        <>
            {/* VERSIONE DESKTOP - Pannello laterale */}
            <div className="hidden lg:flex z-20 w-1/6 h-fit mr-6 mt-6 flex-col"> 
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

            {/* VERSIONE MOBILE - Pulsante in basso */}
            {!isModalOpen && 
                <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-3xl p-4 shadow-lg transition-all active:scale-70"
                        title="Cerca un paese"
                    >
                        <span className="text-xl flex items-center gap-2">Cerca paese <FiSearch /></span>
                    </button>
                </div>
            }

            {/* MODALE RICERCA MOBILE - A schermo intero */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-50"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 top-0 bg-neutral-900/60 flex flex-col-reverse gap-3 p-5 h-full"
                            onClick={(e) => e.stopPropagation()}
                        >

                            {/* CONTENITORE RICERCA */}
                            <div className="z-20 flex border-b border-white/10 w-full gap-3 self-center">
                                <div className="flex items-center">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        aria-label="Chiudi"
                                        className="bg-red-600 active:bg-red-700 text-white rounded-xl p-5 shadow-lg active:scale-95 transition active:border-2 active:border-white text-2xl"
                                        title="Torna indietro"
                                    >
                                        <FiArrowDown />
                                    </button>
                                </div>
                                
                                <div className="bg-neutral-800 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/10 flex items-center gap-3 w-full">
                                    <span className="text-neutral-500 text-lg">🔍</span>
                                    <input 
                                        type="text" 
                                        placeholder="Cerca un paese..." 
                                        className="bg-transparent text-white placeholder:text-neutral-500 flex-1 focus:outline-none text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                            </div>

                            {/* MENU RISULTATI */}
                            <motion.ul 
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={{
                                    hidden: { opacity: 0, y: 12 },
                                    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.03 } }
                                }}
                                transition={{ type: "spring", stiffness: 320, damping: 25 }}
                                layout
                                key={searchTerm.trim() !== "" ? "filtered" : "all"}
                                className="w-full h-auto max-h-full overflow-y-auto scrollbar-none backdrop-blur-md border border-white/10 rounded-xl"
                            >
                                {searchTerm.trim() !== "" ? (
                                    filteredCountries.length > 0 ? (
                                        filteredCountries.map((country) => {
                                            const displayName = country?.translations?.ita?.common || country?.name?.common;
                                            return (
                                                <li 
                                                    key={country.ccn3} 
                                                    className="group flex items-center gap-3 px-4 py-3 hover:bg-blue-600 transition-colors cursor-pointer border-b border-white/10 active:bg-blue-600"
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
                                                        setIsModalOpen(false);
                                                        console.log("Paese selezionato:", country);
                                                    }}
                                                >
                                                    <span className="w-8 flex justify-center">
                                                        <img src={country.flags?.png} alt={displayName} className="max-w-8 h-5 object-contain rounded-xs shadow-sm" />
                                                    </span>
                                                    <span className="text-sm font-medium text-neutral-200 group-active:text-white">
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
                                                className="group flex items-center gap-3 px-4 py-3 hover:bg-blue-600 transition-colors cursor-pointer border-b border-white/10 active:bg-blue-600"
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
                                                    setIsModalOpen(false);
                                                    console.log("Paese selezionato:", country);
                                                }}
                                            >
                                                <span className="w-8 flex justify-center">
                                                    <img src={country.flags?.png} alt={displayName} className="max-w-8 h-5 object-contain rounded-xs shadow-sm" />
                                                </span>
                                                <span className="text-sm font-medium text-neutral-200 group-active:text-white">
                                                    {displayName}
                                                </span>
                                            </li>
                                        );
                                    })
                                )}
                            </motion.ul>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}