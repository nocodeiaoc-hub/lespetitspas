import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Minuscules sans accents, pour une recherche tolérante ("Anaïs" ↔ "anais"). */
export function foldAccents(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Initiales à partir du prénom et du nom ("Ana", "Maria") → "AM". */
export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

const AVATAR_COLORS = [
  "#9fa8da",
  "#80cbc4",
  "#f48fb1",
  "#ffb74d",
  "#a5d6a7",
  "#ce93d8",
  "#90caf9",
];

/** Couleur d'avatar déterministe à partir d'un identifiant. */
export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Durée d'une sieste en minutes (gère défensivement le passage de minuit). */
export function napDurationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  return minutes;
}

/** Durée d'une sieste formatée : « 45 min », « 1 h », « 1 h 20 ». */
export function napDurationLabel(start: string, end: string): string {
  const total = napDurationMinutes(start, end);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

/** Âge lisible en français à partir d'une date ISO (yyyy-mm-dd). */
export function ageLabel(birthDate: string): string {
  const b = new Date(birthDate);
  const now = new Date();
  let months =
    (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 0) months = 0;
  if (months < 24) return `${months} mois`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem === 0 ? `${years} ans` : `${years} ans et ${rem} mois`;
}
