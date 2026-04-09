import type { Coordinates } from "@vnedyalk0v/react19-simple-maps";

export interface Country {
  id: string;       // codice numerico (es. "380")
  name: string;       // nome universale
  itName?: string;    // eventuale traduzione italiana (se diversa da name)
  flagUrl?: string;   // url bandiera PNG
  coordinates?: Coordinates; // latitudine e longitudine
  capitalName?: string;
}

export interface WorldMapProps {
  videos: video[]; // Dati dei video, con almeno un campo "countryCode" che corrisponde a id
  SelectedCountry: Country | null;
  SelectCountry: (country: Country) => void;
  OverCountry: Country | null;
  countriesData: any; // Dati geografici dei paesi
  geoData: any; // Dati geografici
}

export interface video {
  id: string;
  url: string;
  countryCode: number; // Codice del paese associato al video (es. "380")
  title?: string; // Titolo del video (opzionale, da recuperare tramite YouTube o simili)
  thumbnail?: string; // URL dell'immagine di anteprima (opzionale)
  status: "pending" | "approved" | "rejected"; // Stato del video (opzionale)
  categories?: string[]; // Categorie selezionate dall'utente
  country?: string; // Nome del paese (opzionale, da recuperare tramite API)
  flag?: string; // URL della bandiera del paese (opzionale, da recuperare tramite API)
  submittedBy?: string; // ID dell'utente che ha suggerito il video (opzionale)
  suggesterName?: string; // Nome dell'utente che ha suggerito il video (opzionale)
  suggesterEmail?: string; // Email dell'utente che ha suggerito il video (opzionale)
  createdAt?: Date; // Data di creazione
  rejectionReason?: string; // Motivo del rifiuto (opzionale)
}

export interface user{
  uid: string;
  email: string;
  displayName: string;
  role: "user" | "moderator" | "admin";
  photoURL?: string; // URL dell'immagine del profilo (opzionale)
  stats?: {
    pendingVideos: number;
    approvedVideos: number;
    rejectedVideos: number;
    suggestedVideos : number;
  };
}

export interface Region {
  name: string;
  icon: React.ReactNode;
  coordinates: [number, number]; // [latitude, longitude]
  zoom: number;
}