import { ComposableMap, Geographies, Geography } from "@vnedyalk0v/react19-simple-maps";

interface WorldMapProps {
  geoData: any;
  videos: any[];
  SelectCountry: (country: any) => void;
}

export default function WorldMap({ geoData, videos, SelectCountry }: WorldMapProps) {
  
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
              const countryCode = geo.properties.ISO_A3 || geo.properties.ADMIN;
              const hasVideo = videos.some(v => v.countryCode === countryCode);
              
              return (
                <Geography
                  key={`${countryCode}-${index}`}
                  geography={geo}
                  onClick={() => handleCountryClick(geo)}
                  className="outline-none transition-colors duration-200"
                  style={{
                    default: { 
                      fill: hasVideo ? "#3b82f6" : "#262626", 
                      stroke: "#171717",
                      strokeWidth: 0.5
                    },
                    hover: { 
                      fill: hasVideo ? "#60a5fa" : "#262626", 
                      cursor: hasVideo ? "pointer" : "default" 
                    },
                    pressed: { fill: "#2563eb" }
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