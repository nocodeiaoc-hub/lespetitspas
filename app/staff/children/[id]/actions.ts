"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EventType } from "@/lib/types";
import { createServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export type AddEventState = { error: string | null };

const TYPES: EventType[] = [
  "repas",
  "sieste",
  "activite",
  "medicament",
  "incident",
];

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/**
 * Insertion d'un événement de journée (US-14) avec garde médicament (US-15).
 * `childId` est passé par `.bind()` côté client.
 */
export async function addEvent(
  childId: string,
  _prev: AddEventState,
  form: FormData,
): Promise<AddEventState> {
  const profile = await getProfile();
  if (!profile || profile.role !== "staff") {
    return { error: "Accès réservé à l'équipe." };
  }

  const type = str(form, "type") as EventType;
  if (!TYPES.includes(type)) {
    return { error: "Choisissez un type d'événement." };
  }

  const note = str(form, "note") || null;
  const supabase = await createServerClient();

  // Colonnes propres à chaque type ; les autres restent nulles (contrainte CHECK).
  const row: Record<string, unknown> = {
    child_id: childId,
    author_id: profile.id,
    type,
    note,
  };

  if (type === "repas") {
    const moment = str(form, "meal_moment");
    const quality = str(form, "meal_quality");
    if (!moment || !quality) return { error: "Renseignez le moment et la quantité mangée." };
    row.meal_moment = moment;
    row.meal_quality = quality;
  } else if (type === "sieste") {
    const start = str(form, "nap_start");
    const end = str(form, "nap_end");
    const quality = str(form, "nap_quality");
    if (!start || !end || !quality) {
      return { error: "Renseignez les heures de début, de fin et la qualité." };
    }
    row.nap_start = start;
    row.nap_end = end;
    row.nap_quality = quality;
  } else if (type === "activite") {
    const name = str(form, "activity_name");
    if (!name) return { error: "Renseignez le nom de l'activité." };
    row.activity_name = name;
  } else if (type === "incident") {
    const kind = str(form, "incident_kind");
    const severity = str(form, "incident_severity");
    if (!kind || !severity) return { error: "Renseignez le type et la gravité de l'incident." };
    row.incident_kind = kind;
    row.incident_severity = severity;
  } else if (type === "medicament") {
    const { data: child } = await supabase
      .from("children")
      .select("medication_allowed")
      .eq("id", childId)
      .single();

    // Garde-fou serveur : non négociable, la validation client ne suffit pas.
    if (!child?.medication_allowed) {
      return {
        error:
          "Autorisation parentale absente pour cet enfant : la saisie d'un médicament est refusée.",
      };
    }

    const consent = form.get("consent") === "on";
    if (!consent) {
      return { error: "Cochez « Autorisation parentale confirmée » pour enregistrer." };
    }

    const name = str(form, "med_name");
    const dose = str(form, "med_dose");
    const time = str(form, "med_time");
    if (!name || !dose || !time) {
      return { error: "Renseignez le nom, la dose et l'heure du médicament." };
    }
    row.med_name = name;
    row.med_dose = dose;
    row.med_time = time;
    row.parental_consent_confirmed = true;
  }

  const { error } = await supabase.from("events").insert(row);
  if (error) {
    return { error: `Enregistrement impossible : ${error.message}` };
  }

  revalidatePath(`/staff/children/${childId}`);
  redirect(`/staff/children/${childId}`);
}
