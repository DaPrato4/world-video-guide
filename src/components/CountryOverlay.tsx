import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CountryOverlayProps {
  country: any;
  videos: any[];
  onClose: () => void;
}

export default function CountryOverlay({ country, videos, onClose }: CountryOverlayProps) {
    const [flagUrl, setFlagUrl] = useState<string>("");

    const countryCode = country.id;
    const countryName = country.itName || country.name || "Nome sconosciuto";
    const countryVideos = videos.filter(v => v.countryCode == countryCode);

    useEffect(() => {
        let fetchUrl = countryCode 
            ? `https://restcountries.com/v3.1/alpha/${countryCode}?fullText=true`
            : `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;
            
        fetch(fetchUrl)
        .then(res => res.json())
        .then(data => {
            if (data && data[0]) {
                setFlagUrl(data[0].flags.png);
            }
        })
        .catch(err => console.error("Errore recupero bandiera:", err));
    }, [countryCode, countryName]);

    return (
        // 1. IL BACKDROP: Aspetta 0.8 secondi (il tempo dello zoom della mappa) e poi fa un fade-in
        <motion.div 
            // Partiamo con 0 blur letteralmente
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
            
            // Arriviamo al blur desiderato (equivale a backdrop-blur-sm)
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }} 
            
            exit={{ 
                opacity: 0, 
                backdropFilter: "blur(0px)", 
                transition: { delay: 0, duration: 0.2 } 
            }} 
            transition={{ duration: 0.4, delay: 1 }} 
            
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-100 p-4"
            onClick={onClose}
        >
            {/* 2. IL MODALE: Parte da scale 0 (minuscolo) e dopo 0.8s fa un "pop" verso scale 1 */}
            <motion.div 
                initial={{ scale: 0, opacity: 0 }} // Parte letteralmente da un pixel invisibile
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0, transition: { delay: 0, duration: 0.2 } }}
                transition={{ 
                    duration: 0.9, 
                    delay: 1,
                    type: "spring",
                    bounce: 0.5
                }} 
                className="bg-neutral-800 w-full max-w-4xl h-128 rounded-2xl flex overflow-hidden shadow-2xl border border-neutral-700"
                onClick={(e) => e.stopPropagation()} 
            >
                
                <div className="w-2/5 bg-neutral-950 flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-6 bg-neutral-900 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-800 shadow-xl">
                        {flagUrl ? (
                            <img src={flagUrl} alt="Bandiera" className="max-w-full max-h-40 object-contain" />
                        ) : (
                            <div className="animate-pulse bg-neutral-700 h-24 w-48 rounded"></div>
                        )}
                    </div>
                    <h2 className="text-4xl font-black mb-4 uppercase leading-tight tracking-tighter text-white">
                        {countryName}
                    </h2>
                    <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
                </div>

                <div className="w-3/5 p-10 flex flex-col relative text-white">
                    <h3 className="text-xl font-semibold mb-6 border-b border-neutral-700 pb-2">
                        🎥 Video Disponibili
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {countryVideos.length > 0 ? (
                            countryVideos.map(v => (
                                <div 
                                    key={v.id} 
                                    className="bg-neutral-700/50 p-4 rounded-xl border-l-4 border-blue-500 hover:bg-neutral-600 transition-colors cursor-pointer"
                                    onClick={() => window.open(v.url, "_blank")}
                                >
                                    <p className="font-medium">▶ {v.title}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-neutral-400">Nessun video disponibile per questo paese.</p>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                    >
                        CHIUDI
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}