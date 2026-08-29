// Modele de donnees du prototype.
// Volontairement proche de ce qui sera modelise en Supabase (Phase 4) :
// profiles / children / family_members / events / messages.

export type Role = "staff" | "parent";

export type Section = "Bébés" | "Moyens" | "Grands";

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  email: string;
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  section: Section;
  birthDate: string; // ISO yyyy-mm-dd
  photoUrl?: string;
  allergies: string[];
  medicationAllowed: boolean; // autorisation parentale de medicament (colonne children)
  familyProfileIds: string[]; // family_members
}

export type MealMoment = "matin" | "midi" | "goûter";
export type MealQuality = "tout" | "moitié" | "peu" | "rien";
export type NapQuality = "calme" | "agitée" | "réveil précoce";
export type IncidentKind = "chute" | "morsure" | "fièvre" | "autre";
export type IncidentSeverity = "léger" | "modéré" | "urgent";
export type EventType = "repas" | "sieste" | "activité" | "médicament" | "incident";

interface EventBase {
  id: string;
  childId: string;
  authorId: string;
  createdAt: string; // ISO datetime
  note?: string;
}

export interface MealEvent extends EventBase {
  type: "repas";
  moment: MealMoment;
  quality: MealQuality;
}

export interface NapEvent extends EventBase {
  type: "sieste";
  start: string; // HH:mm
  end: string; // HH:mm
  quality: NapQuality;
}

export interface ActivityEvent extends EventBase {
  type: "activité";
  name: string;
}

export interface MedicationEvent extends EventBase {
  type: "médicament";
  name: string;
  dose: string;
  time: string; // HH:mm
  parentalConsentConfirmed: boolean;
}

export interface IncidentEvent extends EventBase {
  type: "incident";
  kind: IncidentKind;
  severity: IncidentSeverity;
}

export type DayEvent =
  | MealEvent
  | NapEvent
  | ActivityEvent
  | MedicationEvent
  | IncidentEvent;

export type MessageStatus = "nouveau" | "lu" | "traité";

export interface Message {
  id: string;
  childId: string;
  fromProfileId: string; // parent emetteur
  body: string; // <= 500 caracteres
  createdAt: string;
  status: MessageStatus;
}
