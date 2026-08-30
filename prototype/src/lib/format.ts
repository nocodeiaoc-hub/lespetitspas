import type { Child, DayEvent } from "../data/types";

/** yyyy-mm-dd d'une date (heure locale). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Libelle lisible : "Aujourd'hui", "Hier", ou "lundi 3 mars". */
export function humanDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  const today = new Date();
  const diffDays = Math.round(
    (new Date(toISODate(today) + "T12:00:00").getTime() - d.getTime()) / 86_400_000,
  );
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ageLabel(birthDate: string): string {
  const b = new Date(birthDate);
  const now = new Date();
  let months =
    (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 24) return `${months} mois`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem === 0 ? `${years} ans` : `${years} ans et ${rem} mois`;
}

export function fullName(p: { firstName: string; lastName: string }): string {
  return `${p.firstName} ${p.lastName}`;
}

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

/** Couleur d'avatar deterministe a partir d'un identifiant. */
export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Duree d'une sieste en minutes (gere le passage de minuit defensivement). */
export function napDurationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  return minutes;
}

export function napDurationLabel(start: string, end: string): string {
  const total = napDurationMinutes(start, end);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

export interface MedicationGuardInput {
  child: Pick<Child, "medicationAllowed">;
  parentalConsentConfirmed: boolean;
}

export interface MedicationGuardResult {
  allowed: boolean;
  /** Raison du blocage, cote "serveur" (simule la Server Action qui renvoie 403). */
  reason?: string;
}

/**
 * Double validation de la saisie d'un medicament (cf. specifications).
 * - la case "Autorisation parentale confirmee" doit etre cochee (garde-fou client) ;
 * - l'enfant doit avoir l'autorisation en fiche (garde-fou "serveur").
 */
export function checkMedicationAllowed({
  child,
  parentalConsentConfirmed,
}: MedicationGuardInput): MedicationGuardResult {
  if (!child.medicationAllowed) {
    return {
      allowed: false,
      reason:
        "Autorisation parentale absente pour cet enfant : la saisie d'un médicament est refusée (403).",
    };
  }
  if (!parentalConsentConfirmed) {
    return {
      allowed: false,
      reason:
        "Cochez « Autorisation parentale confirmée » pour enregistrer le médicament.",
    };
  }
  return { allowed: true };
}

/** Resume court d'un evenement pour la timeline / la carte enfant. */
export function eventSummary(e: DayEvent): string {
  switch (e.type) {
    case "repas":
      return `Repas ${e.moment} — a mangé « ${e.quality} »`;
    case "sieste":
      return `Sieste ${e.start}–${e.end} (${napDurationLabel(e.start, e.end)}) — ${e.quality}`;
    case "activité":
      return `Activité — ${e.name}`;
    case "médicament":
      return `Médicament — ${e.name} ${e.dose} à ${e.time}`;
    case "incident":
      return `Incident (${e.kind}) — gravité ${e.severity}`;
    default: {
      const _exhaustive: never = e;
      return _exhaustive;
    }
  }
}

export function eventTitle(type: DayEvent["type"]): string {
  const map: Record<DayEvent["type"], string> = {
    repas: "Repas",
    sieste: "Sieste",
    activité: "Activité",
    médicament: "Médicament",
    incident: "Incident",
  };
  return map[type];
}
