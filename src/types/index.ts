import type { Coordinates } from "@vnedyalk0v/react19-simple-maps";

export interface Country {
  id: string;       // codice numerico (es. "380")
  name: string;       // nome universale
  itName?: string;    // eventuale traduzione italiana (se diversa da name)
  flagUrl?: string;   // url bandiera PNG
  coordinates?: Coordinates; // latitudine e longitudine
}

export interface WorldMapProps {
  videos: any[]; // Dati dei video, con almeno un campo "countryCode" che corrisponde a id
  SelectedCountry: Country | null;
  SelectCountry: (country: Country) => void;
  OverCountry: Country | null;
}