import { useEffect, useState } from "react";

// Definiamo velocemente i tipi per le props
interface CountryOverlayProps {
  country: any;
  videos: any[];
  onClose: () => void;
}

export default function CountryOverlay({ country, videos, onClose }: CountryOverlayProps) {
    const [flagUrl, setFlagUrl] = useState<string>("");

    // Filtra i video per il paese selezionato
    const countryCode = country.id;
    const countryName = country.properties.name;
    const countryVideos = videos.filter(v => v.countryCode === countryCode);

    useEffect(() => {
        let countrydata: any = null; 
        if (countryCode) countrydata = fetch(`https://restcountries.com/v3.1/alpha/${countryCode}?fullText=true`)    
        else countrydata = fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
        
        countrydata
        .then((res: { json: () => any; }) => res.json())
        .then((data: any[]) => {
        if (data && data[0]) {
            // Prendiamo la versione PNG della bandiera
            countrydata = data[0];
            console.log("Dati paese recuperati:", data[0]);
            setFlagUrl(countrydata.flags.png);
        }
        })
        .catch((err: any) => console.error("Errore recupero bandiera:", err));
        

    }, []);
    
    console.log("Country object:", country);
    console.log("Country code:", countryCode);

    return (
        <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
        >
        <div 
            className="bg-neutral-800 w-full max-w-4xl h-125 rounded-2xl flex overflow-hidden shadow-2xl border border-neutral-700"
            onClick={(e) => e.stopPropagation()} // Evita che il click dentro il modale lo chiuda
        >
            {/* Sinistra: Info Paese */}
                <div className="w-2/5 bg-neutral-950 flex flex-col items-center justify-center p-8 text-center">
                
                {/* BOX BANDIERA */}
                <div className="mb-6 w-48 h-32 bg-neutral-900 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-800 shadow-xl">
                    {flagUrl ? (
                    <img src={flagUrl} alt="Bandiera" className="w-full h-full object-cover" />
                    ) : (
                    <div className="animate-pulse bg-neutral-700 w-full h-full"></div> // Loader mentre carica
                    )}
                </div>

                <h2 className="text-4xl font-black mb-4 uppercase leading-tight tracking-tighter">
                    {countryName}
                </h2>
                <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
                
            </div>

            {/* Destra: Lista Video */}
            <div className="w-3/5 p-10 flex flex-col relative">
            <h3 className="text-xl font-semibold mb-6 border-b border-neutral-700 pb-2">
                🎥 Video Disponibili
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {countryVideos.length > 0 ? (
                countryVideos.map(v => (
                    <div 
                    key={v.id} 
                    className="bg-neutral-700/50 p-4 rounded-xl border-l-4 border-blue-500 hover:bg-neutral-700 transition-colors cursor-pointer"
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
        </div>
        </div>
    );
}