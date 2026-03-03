export interface Video {
  id: number;
  title: string;
  countryCode: string; // Es. "ITA", "JPN"
}

export interface CountryData {
  NAME: string;
  NAME_LONG?: string;
  ISO_A3: string;
  ADM0_A3: string;
}