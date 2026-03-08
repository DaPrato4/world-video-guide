import type { Coordinates } from "@vnedyalk0v/react19-simple-maps";

export interface Country {
  id: string;       // codice numerico (es. "380")
  name: string;       // nome universale
  itName?: string;    // eventuale traduzione italiana (se diversa da name)
  flagUrl?: string;   // url bandiera PNG
  coordinates?: Coordinates; // latitudine e longitudine
}

export interface WorldMapProps {
  videos: video[]; // Dati dei video, con almeno un campo "countryCode" che corrisponde a id
  SelectedCountry: Country | null;
  SelectCountry: (country: Country) => void;
  OverCountry: Country | null;
}

export interface video {
  id: string;
  url: string;
  countryCode: number; // Codice del paese associato al video (es. "380")
  title?: string; // Titolo del video (opzionale, da recuperare tramite YouTube o simili)
  thumbnail?: string; // URL dell'immagine di anteprima (opzionale)
}