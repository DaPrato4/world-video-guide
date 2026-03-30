import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup} from "@vnedyalk0v/react19-simple-maps";
import { useMemo } from "react";
import type{ Country, WorldMapProps } from "../../types";

export default function WorldMap({videos, SelectedCountry, SelectCountry, OverCountry, countriesData, geoData}: WorldMapProps) {

    const baseColor = "purple"; // Puoi scegliere un colore di base per la scala

    // Memoizza la map dei paesi per evitare lookup ripetuti
    const countriesByCode = useMemo(() => {
        const map = new Map();
        countriesData.forEach((c: any) => {
            map.set(String(c.ccn3), c);
        });
        return map;
    }, [countriesData]);

    if (!geoData) {
        return (
        <div className="bg-black h-full text-white flex items-center justify-center font-bold tracking-widest w-full">
            <div className="flex items-center space-x-4">
            <svg
                className="w-10 h-10 text-white animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
            </svg>
            <span>CARICAMENTO MAPPA</span>
            </div>
        </div>
        );
    }
  
    const handleCountryClick = (geo: any) => {
        const country : Country = {
            id: geo.id,
            name: geo.properties.name,
            capitalName: countriesByCode.get(String(geo.id))?.capital?.[0] || ""
        };
        SelectCountry(country);
    };

    return (
        <>
        <ComposableMap projectionConfig={{ scale: 160 }} className="w-5/6 z-10 h-full touch-none">
            <ZoomableGroup 
                zoom={SelectedCountry?.coordinates ? 8 : 1} 
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
                    const videoNumber = videos.filter(v => v.countryCode == countryCode && v.status === "approved").length;
                    const hasVideo = videoNumber > 0;
                    return (
                        <Geography
                        key={countryCode}
                        geography={geo}
                        onClick={() => handleCountryClick(geo)}
                        className="outline-none"
                        style={{
                            default: { 
                            fill: String(SelectedCountry?.id) === countryCode ? "#fff" : 
                                    String(OverCountry?.id) === countryCode ? "#fff" : // Forza il bianco se OverCountry coincide
                                    hasVideo ? getVideoColor(videoNumber, baseColor) : "#262626",
                            stroke: "#111",
                            strokeWidth: 0.5,
                            outline: "none"
                            },
                            hover: { fill: "#fff", outline: "none" },
                            pressed: { fill: "#fff", outline: "none" }
                        }}
                        />
                    );
                    })
                }
                </Geographies>
                {OverCountry?.coordinates?.[0] || SelectedCountry?.coordinates?.[0] ?(  
                <Marker
                    key={`marker-${OverCountry?.id || SelectedCountry?.id}`}
                    coordinates={[
                        OverCountry?.coordinates?.[1] ?? SelectedCountry?.coordinates?.[1],
                        OverCountry?.coordinates?.[0] ?? SelectedCountry?.coordinates?.[0],
                    ] as any}
                    >
                    <circle 
                        r={3} 
                        fill="#F00" 
                        stroke="#fff" 
                        strokeWidth={2} 
                        style={{ pointerEvents: "none" }}
                    />
                    <text
                        textAnchor="middle"
                        y={-10}
                        style={{
                            fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                            fill: "#0b0b0b",
                            fontSize: "9px",
                            fontWeight: 700,
                            pointerEvents: "none",
                            paintOrder: "stroke fill",
                            mixBlendMode: "normal"
                        }}
                        stroke="#ffffff"
                        strokeWidth={3}
                        strokeOpacity={0.95}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                    >
                        {OverCountry?.capitalName || SelectedCountry?.capitalName}
                    </text>
                </Marker>
                ): null}
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