import { ComposableMap, Geographies, Geography, ZoomableGroup} from "@vnedyalk0v/react19-simple-maps";
import { useEffect, useState } from "react";
import type{ Country, WorldMapProps } from "../types";

export default function WorldMap({videos, SelectedCountry, SelectCountry, OverCountry}: WorldMapProps) {

    const [geoData, setGeoData] = useState<any>(null);
    const baseColor = "blue"; // Puoi scegliere un colore di base per la scala

    useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json")
        .then(res => res.json())
        .then(data => setGeoData(data))
        .catch(err => console.error("Errore caricamento GeoJSON:", err));
    }, []);

    if (!geoData) {
        return (
        <div className="w-screen h-screen bg-neutral-900 flex items-center justify-center text-white">
            Caricamento mappa...
        </div>
        );
    }
  
    const handleCountryClick = (geo: any) => {
        const country : Country = {
            id: geo.id,
            name: geo.properties.name,
        };
        SelectCountry(country);
    };

    return (
        <>
        <ComposableMap projectionConfig={{ scale: 160 }} className="w-full h-full touch-none">
            <ZoomableGroup 
                zoom={SelectedCountry ? 8 : 1} 
                center={SelectedCountry?.coordinates ? [SelectedCountry.coordinates[1] as any, SelectedCountry.coordinates[0] as any] : undefined}
                // CONFIGURAZIONE PER BLOCCARE L'UTENTE:
                maxZoom={1} // Impedisce di zoomare oltre quello che decidi tu
                minZoom={1} // Impedisce di rimpicciolire
                filterZoomEvent={() => false} // Disabilita la rotellina del mouse
                onMoveStart={() => {}} // Ignora tentativi di trascinamento
                onMoveEnd={() => {}}
                className="transition-all duration-1000 ease-in-out touch-none" 
            >
                <Geographies geography={geoData}>
                {({ geographies }) =>
                    geographies.map((geo, index) => {
                    const countryCode = geo.id || 0-index;
                    const videoNumber = videos.filter(v => v.countryCode == countryCode).length;
                    const hasVideo = videoNumber > 0;
                    const isOver = OverCountry?.id == countryCode;
                    {isOver? console.log("stai passando sopra:", geo.properties.name) : null}
                    return (
                        <Geography
                        key={`${countryCode}`}
                        geography={geo}
                        onClick={() => handleCountryClick(geo)}
                        className="outline-none transition-colors duration-200"
                        style={{
                            default: { 
                                strokeWidth: 0.5,
                                fill: OverCountry?.id == countryCode || SelectedCountry?.id == countryCode ? "#fff" : hasVideo ? getVideoColor(videoNumber, baseColor) : "#262626",
                            },
                            hover: { 
                                fill: hasVideo ?  "#fff" : "#262626", 
                                cursor: hasVideo ? "pointer" : "default" 
                            },
                            pressed: { fill: "#fff" }
                        }}
                        />
                    );
                    })
                }
                </Geographies>
            </ZoomableGroup>
        </ComposableMap>
        <p className="absolute bottom-4 left-4 text-xs text-neutral-500">
            Dati geografici da Natural Earth | Video demo fittizi
        </p>
        </>
    );
}

function getVideoColor(videoNumber: number, color: string): string {
    const colorScale: Record<string, string[]> = {
        red: ["#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c"],
        blue: ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8"],
        green: ["#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d"],
        purple: ["#d8b4fe", "#c084fc", "#a855f7", "#9333ea", "#7e22ce"],
        orange: ["#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c"],
        yellow: ["#fef08a", "#fde047", "#facc15", "#eab308", "#ca8a04"],
        pink: ["#fbcfe8", "#f472b6", "#ec4899", "#db2777", "#be185d"],
        cyan: ["#a5f3fc", "#67e8f9", "#06b6d4", "#0891b6", "#0e7490"],
    };

    const palette = colorScale[color] ?? colorScale.blue;
    const index = Math.min(videoNumber, palette.length - 1);
    return palette[index];
}