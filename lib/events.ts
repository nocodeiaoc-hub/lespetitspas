import type { DayEvent, EventType } from "@/lib/types";
import { napDurationLabel } from "@/lib/utils";

export const EVENT_LABELS: Record<EventType, string> = {
  repas: "Repas",
  sieste: "Sieste",
  activite: "Activité",
  medicament: "Médicament",
  incident: "Incident",
};

export const MEDICATION_NO_AUTHORISATION =
  "Autorisation parentale absente pour cet enfant : la saisie d'un médicament est refusée.";
export const MEDICATION_CONSENT_REQUIRED =
  "Cochez « Autorisation parentale confirmée » pour enregistrer.";

export type MedicationGuardResult =
  | { allowed: true }
  | { allowed: false; reason: string };

/**
 * Règle de sécurité médicament (US-15), logique pure et testable.
 * Double contrôle : l'enfant doit avoir l'autorisation en fiche **et** le membre
 * de l'équipe doit avoir coché la confirmation. La Server Action `addEvent`
 * s'appuie dessus côté serveur (la validation client seule ne suffit pas).
 */
export function checkMedicationAllowed(input: {
  medicationAllowed: boolean;
  parentalConsentConfirmed: boolean;
}): MedicationGuardResult {
  if (!input.medicationAllowed) {
    return { allowed: false, reason: MEDICATION_NO_AUTHORISATION };
  }
  if (!input.parentalConsentConfirmed) {
    return { allowed: false, reason: MEDICATION_CONSENT_REQUIRED };
  }
  return { allowed: true };
}

/** Classes de couleur de la charte par type d'événement (cf. globals.css). */
export const EVENT_TONE: Record<EventType, string> = {
  repas: "bg-event-repas text-event-repas-foreground",
  sieste: "bg-event-sieste text-event-sieste-foreground",
  activite: "bg-event-activite text-event-activite-foreground",
  medicament: "bg-event-medicament text-event-medicament-foreground",
  incident: "bg-event-incident text-event-incident-foreground",
};

const MEAL_MOMENT: Record<string, string> = {
  matin: "du matin",
  midi: "du midi",
  gouter: "du goûter",
};
const MEAL_QUALITY: Record<string, string> = {
  tout: "a tout mangé",
  moitie: "a mangé la moitié",
  peu: "a peu mangé",
  rien: "n'a rien mangé",
};
const NAP_QUALITY: Record<string, string> = {
  calme: "calme",
  agitee: "agitée",
  reveil_precoce: "réveil précoce",
};
const INCIDENT_KIND: Record<string, string> = {
  chute: "Chute",
  morsure: "Morsure",
  fievre: "Fièvre",
  autre: "Autre",
};
const INCIDENT_SEVERITY: Record<string, string> = {
  leger: "léger",
  modere: "modéré",
  urgent: "urgent",
};

/** Résumé lisible d'un événement pour la timeline. */
export function eventSummary(e: DayEvent): string {
  switch (e.type) {
    case "repas":
      return `Repas ${MEAL_MOMENT[e.meal_moment ?? ""] ?? ""} — ${
        MEAL_QUALITY[e.meal_quality ?? ""] ?? ""
      }`.trim();
    case "sieste": {
      const start = (e.nap_start ?? "").slice(0, 5);
      const end = (e.nap_end ?? "").slice(0, 5);
      const dur = e.nap_start && e.nap_end ? napDurationLabel(start, end) : "";
      return `Sieste ${start}–${end}${dur ? ` (${dur})` : ""} — ${
        NAP_QUALITY[e.nap_quality ?? ""] ?? ""
      }`;
    }
    case "activite":
      return `Activité — ${e.activity_name ?? ""}`;
    case "medicament":
      return `Médicament — ${e.med_name ?? ""} ${e.med_dose ?? ""} à ${(
        e.med_time ?? ""
      ).slice(0, 5)}`;
    case "incident":
      return `Incident — ${INCIDENT_KIND[e.incident_kind ?? ""] ?? ""} (gravité ${
        INCIDENT_SEVERITY[e.incident_severity ?? ""] ?? ""
      })`;
  }
}
