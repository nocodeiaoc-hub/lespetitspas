export type Section = "Bébés" | "Moyens" | "Grands";

export const SECTIONS: Section[] = ["Bébés", "Moyens", "Grands"];

/** Une ligne de la table `children` (colonnes utiles à l'interface). */
export type Child = {
  id: string;
  first_name: string;
  last_name: string;
  section: Section;
  birth_date: string;
  allergies: string[];
  medication_allowed: boolean;
  photo_url: string | null;
};

/** Valeurs ASCII stockées dans `events.type` (l'affichage accentué est côté UI). */
export type EventType =
  | "repas"
  | "sieste"
  | "activite"
  | "medicament"
  | "incident";

/** Une ligne de la table `events` (tous les champs typés, la plupart nullables). */
export type DayEvent = {
  id: string;
  child_id: string;
  author_id: string;
  type: EventType;
  note: string | null;
  created_at: string;
  meal_moment: "matin" | "midi" | "gouter" | null;
  meal_quality: "tout" | "moitie" | "peu" | "rien" | null;
  nap_start: string | null;
  nap_end: string | null;
  nap_quality: "calme" | "agitee" | "reveil_precoce" | null;
  activity_name: string | null;
  med_name: string | null;
  med_dose: string | null;
  med_time: string | null;
  incident_kind: "chute" | "morsure" | "fievre" | "autre" | null;
  incident_severity: "leger" | "modere" | "urgent" | null;
};

export type MessageStatus = "nouveau" | "lu" | "traite";

/** Une ligne de `messages`, éventuellement jointe à l'expéditeur. */
export type ParentMessage = {
  id: string;
  child_id: string;
  from_profile_id: string;
  body: string;
  status: MessageStatus;
  created_at: string;
};
