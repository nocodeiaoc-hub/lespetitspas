// Fonctionnalite bonus : meteo du jour + conseil d'habillement.
// PROTOTYPE -> donnee simulee et deterministe (pas d'appel API).
// En production, brancher une API meteo et derouler le meme conseil.

export type WeatherKind = "ensoleillé" | "nuageux" | "pluie" | "neige" | "orageux";

export interface DayWeather {
  kind: WeatherKind;
  tempC: number;
  city: string;
  summary: string;
  advice: string;
}

const SCENARIOS: Omit<DayWeather, "city">[] = [
  {
    kind: "ensoleillé",
    tempC: 24,
    summary: "Ensoleillé, 24°C",
    advice: "Casquette, lunettes et crème solaire pour la sortie au parc. Prévoyez une gourde.",
  },
  {
    kind: "nuageux",
    tempC: 16,
    summary: "Nuageux, 16°C",
    advice: "Une veste légère suffit. Gardez un pull dans le sac au cas où.",
  },
  {
    kind: "pluie",
    tempC: 12,
    summary: "Pluie, 12°C",
    advice: "Manteau imperméable, bottes et bonnet. Bottes de rechange bienvenues.",
  },
  {
    kind: "orageux",
    tempC: 19,
    summary: "Averses orageuses, 19°C",
    advice: "Coupe-vent à capuche. Les activités du matin se feront à l'intérieur.",
  },
  {
    kind: "neige",
    tempC: -1,
    summary: "Neige, -1°C",
    advice: "Combinaison chaude, gants, bonnet et écharpe. Doubles chaussettes conseillées.",
  },
];

/** Meteo "du jour" : stable pour une date donnee. */
export function weatherForDate(iso: string, city = "Lyon"): DayWeather {
  let hash = 0;
  for (let i = 0; i < iso.length; i += 1) {
    hash = (hash * 31 + iso.charCodeAt(i)) | 0;
  }
  const scenario = SCENARIOS[Math.abs(hash) % SCENARIOS.length];
  return { ...scenario, city };
}
