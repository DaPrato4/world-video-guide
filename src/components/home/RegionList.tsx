import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow} from "swiper/modules";
import { 
  GiSydneyOperaHouse,
  GiCactus,
  GiCastle,
  GiElephant,
  GiPalmTree,
  GiPagoda
} from "react-icons/gi";
import { FaCity } from "react-icons/fa";

import 'swiper/css';
import 'swiper/css/effect-coverflow';

interface Region {
  name: string;
  icon: React.ReactNode;
  coordinates: [number, number]; // [latitude, longitude]
  zoom: number;
}

const REGIONS: Region[] = [
  {
    name: "Nord America",
    icon: <FaCity className="text-2xl" />,
    coordinates: [15, -90],
    zoom: 4,
  },
  {
    name: "Sud America",
    icon: <GiCactus className="text-2xl" />,
    coordinates: [-40, -60],
    zoom: 4,
  },
  {
    name: "Europa",
    icon: <GiCastle className="text-2xl" />,
    coordinates: [40, 15],
    zoom: 5,
  },
  {
    name: "Africa",
    icon: <GiElephant className="text-2xl" />,
    coordinates: [-15, 20],
    zoom: 3.5,
  },
  {
    name: "Medio Oriente",
    icon: <GiPalmTree className="text-2xl" />,
    coordinates: [15, 50],
    zoom: 4.5,
  },
  {
    name: "Estremo Oriente",
    icon: <GiPagoda className="text-2xl" />,
    coordinates: [15, 105],
    zoom: 4.5,
  },
  {
    name: "Oceania",
    icon: <GiSydneyOperaHouse className="text-2xl" />,
    coordinates: [-35, 135],
    zoom: 4,
  }
];

interface RegionListProps {
  onRegionSelect: (region: Region) => void;
  selectedRegion: string | null;
}

export default function RegionList({ onRegionSelect, selectedRegion }: RegionListProps) {

  return (
    <>
      {/* MOBILE VIEW - iOS App Style Selector */}
      <div className="fixed bottom-24 left-0 w-full z-40 lg:hidden pointer-events-none overflow-visible">
        <div className="pointer-events-auto w-full"> 
          <Swiper
            modules={[EffectCoverflow]}
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            loop={true}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 350,
              modifier: 2,
              slideShadows: false,
            }}
            onSlideChange={(swiper) => {
              const index = swiper.realIndex;
              onRegionSelect(REGIONS[index]);
            }}
            className="h-14 w-full overflow-visible"
          >
            {REGIONS.map((region) => (
              <SwiperSlide key={region.name} className="bg-transparent w-[70vw]! px-2">
                <div 
                  className={`flex items-center justify-center gap-4 px-6 rounded-2xl border backdrop-blur-xl h-full transition-all duration-500 ${
                    selectedRegion === region.name
                      ? "bg-blue-600/90 border-blue-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(37,99,235,0.3)]"
                      : "bg-neutral-900/40 border-white/5 opacity-40 scale-90"
                  }`}
                >
                  <span className="leading-none text-white">{region.icon}</span>
                  <span className="text-xs font-bold tracking-widest text-white uppercase whitespace-nowrap">
                    {region.name}
                  </span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
}
