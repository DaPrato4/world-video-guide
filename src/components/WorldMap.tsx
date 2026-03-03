import { ComposableMap, Geographies, Geography } from "@vnedyalk0v/react19-simple-maps";

interface WorldMapProps {
  geoData: any;
  videos: any[];
  SelectCountry: (country: any) => void;
}

export default function WorldMap({ geoData, videos, SelectCountry }: WorldMapProps) {

    const baseColor = "blue"; // Puoi scegliere un colore di base per la scala
  
    const handleCountryClick = (geo: any) => {
        const countryName = geo.properties.name;
        console.log(countryName);
        SelectCountry(geo);
    };

    return (
        <>
        <ComposableMap projectionConfig={{ scale: 160 }} className="w-full h-full">
            <Geographies geography={geoData}>
            {({ geographies }) =>
                geographies.map((geo, index) => {
                const countryCode = geo.id;
                const videoNumber = videos.filter(v => v.countryCode == countryCode).length;
                const hasVideo = videoNumber > 0;
                return (
                    <Geography
                    key={`${countryCode}-${index}`}
                    geography={geo}
                    onClick={() => handleCountryClick(geo)}
                    className="outline-none transition-colors duration-200"
                    style={{
                        default: { 
                        fill: hasVideo ? getVideoColor(videoNumber, baseColor) : "#262626", 
                        stroke: "#171717",
                        strokeWidth: 0.5
                        },
                        hover: { 
                        fill: hasVideo ?  getVideoColor(videoNumber, baseColor) : "#262626", 
                        cursor: hasVideo ? "pointer" : "default" 
                        },
                        pressed: { fill: "#ffff" }
                    }}
                    />
                );
                })
            }
            </Geographies>
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