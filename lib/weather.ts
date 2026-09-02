/**
 * Fonctionnalité bonus (US-28) : météo du jour + conseil d'habillement.
 * Logique pure et testable ; l'appel réseau se fait dans `app/api/weather`.
 */

/** Emplacement de la crèche (Paris par défaut, ajustable). */
export const CRECHE_LOCATION = {
  latitude: Number(process.env.NEXT_PUBLIC_CRECHE_LAT ?? "48.8566"),
  longitude: Number(process.env.NEXT_PUBLIC_CRECHE_LON ?? "2.3522"),
};

export type WeatherKind = "clear" | "cloud" | "fog" | "rain" | "snow" | "storm";

const RAIN = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]);
const SNOW = new Set([71, 73, 75, 77, 85, 86]);
const FOG = new Set([45, 48]);
const STORM = new Set([95, 96, 99]);

/** Famille météo à partir d'un code WMO (Open-Meteo). */
export function weatherKind(code: number): WeatherKind {
  if (STORM.has(code)) return "storm";
  if (SNOW.has(code)) return "snow";
  if (RAIN.has(code)) return "rain";
  if (FOG.has(code)) return "fog";
  if (code === 2 || code === 3) return "cloud";
  return "clear";
}

const DESCRIPTIONS: Record<number, string> = {
  0: "Ciel dégagé",
  1: "Plutôt dégagé",
  2: "Partiellement nuageux",
  3: "Ciel couvert",
  45: "Brouillard",
  48: "Brouillard givrant",
  51: "Bruine légère",
  53: "Bruine",
  55: "Bruine dense",
  56: "Bruine verglaçante",
  57: "Bruine verglaçante",
  61: "Pluie faible",
  63: "Pluie",
  65: "Forte pluie",
  66: "Pluie verglaçante",
  67: "Pluie verglaçante",
  71: "Neige faible",
  73: "Neige",
  75: "Forte neige",
  77: "Grains de neige",
  80: "Averses",
  81: "Averses",
  82: "Fortes averses",
  85: "Averses de neige",
  86: "Averses de neige",
  95: "Orage",
  96: "Orage avec grêle",
  99: "Orage avec grêle",
};

export function describeWeather(code: number): string {
  return DESCRIPTIONS[code] ?? "Temps variable";
}

/** Une phrase de conseil d'habillement dérivée de la température et du code. */
export function clothingAdvice(temperatureC: number, code: number): string {
  const t = Math.round(temperatureC);
  const kind = weatherKind(code);

  let base: string;
  if (t <= 0) base = "Manteau chaud, bonnet, écharpe et moufles indispensables.";
  else if (t <= 7) base = "Manteau, bonnet et gants : il fait froid.";
  else if (t <= 14) base = "Une veste chaude et un pull sont recommandés.";
  else if (t <= 21) base = "Une petite veste ou un gilet suffira.";
  else if (t <= 27) base = "Vêtements légers ; pensez à une gourde d'eau.";
  else base = "Vêtements très légers, chapeau, crème solaire et beaucoup d'eau.";

  const extra: Record<WeatherKind, string> = {
    rain: " Prévoyez un imperméable et des bottes.",
    snow: " Bottes fourrées et vêtements imperméables de rigueur.",
    fog: " Visibilité réduite : privilégiez des vêtements clairs.",
    storm: " Orages possibles : gardez un vêtement de pluie à portée.",
    cloud: "",
    clear: t >= 22 ? " Casquette et lunettes de soleil bienvenues." : "",
  };

  return `${base}${extra[kind]}`;
}

export type WeatherPayload = {
  day: string;
  temperature: number;
  weather_code: number;
  summary: string;
  advice: string;
};
