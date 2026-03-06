export interface Country {
  id: string;       // codice numerico (es. "380")
  name: string;       // nome universale
  itName?: string;    // eventuale traduzione italiana (se diversa da name)
  flagUrl?: string;   // url bandiera PNG
}

export interface WorldMapProps {
  videos: any[]; // Dati dei video, con almeno un campo "countryCode" che corrisponde a id
  SelectCountry: (country: Country) => void;
}