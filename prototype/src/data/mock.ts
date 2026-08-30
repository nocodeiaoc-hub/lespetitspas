import type { Child, DayEvent, Message, Profile } from "./types";

/*
  Donnees FICTIVES pour le prototype. Aucune personne reelle.
  Les evenements et messages sont generes par rapport a la date du jour
  pour que la timeline "Aujourd'hui" soit toujours peuplee.
*/

export const STAFF_MEMBERS: Profile[] = [
  { id: "u-staff-1", firstName: "Camille", lastName: "Bonnet", role: "staff", email: "prenom.nom+staff@gmail.com" },
  { id: "u-staff-2", firstName: "Sarah", lastName: "Nguyen", role: "staff", email: "sarah@lespetitspas.test" },
  { id: "u-staff-3", firstName: "Nadia", lastName: "Ferreira", role: "staff", email: "nadia@lespetitspas.test" },
];

export const PARENTS: Profile[] = [
  { id: "u-parent-1", firstName: "Léa", lastName: "Martin", role: "parent", email: "prenom.nom+parent1@gmail.com" },
  { id: "u-parent-2", firstName: "Thomas", lastName: "Dubois", role: "parent", email: "prenom.nom+parent2@gmail.com" },
  { id: "u-parent-3", firstName: "Aurélie", lastName: "Rousseau", role: "parent", email: "aurelie@exemple.test" },
  { id: "u-parent-4", firstName: "Karim", lastName: "Benali", role: "parent", email: "karim@exemple.test" },
];

export const ALL_PROFILES: Profile[] = [...STAFF_MEMBERS, ...PARENTS];

/** Comptes proposes en un clic sur l'ecran de connexion du prototype. */
export const DEMO_ACCOUNTS: { profileId: string; label: string; hint: string }[] = [
  { profileId: "u-staff-1", label: "Camille (équipe)", hint: "Accès à tous les enfants" },
  { profileId: "u-parent-1", label: "Léa Martin (parent)", hint: "2 enfants rattachés" },
  { profileId: "u-parent-2", label: "Thomas Dubois (parent)", hint: "1 enfant rattaché" },
];

export const CHILDREN: Child[] = [
  {
    id: "c-1",
    firstName: "Gabriel",
    lastName: "Martin",
    section: "Moyens",
    birthDate: isoYearsAgo(1, 8),
    photoUrl: "https://i.pravatar.cc/160?img=13",
    allergies: ["Arachides"],
    medicationAllowed: true,
    familyProfileIds: ["u-parent-1"],
  },
  {
    id: "c-2",
    firstName: "Rose",
    lastName: "Martin",
    section: "Bébés",
    birthDate: isoMonthsAgo(7),
    allergies: ["Lait de vache"],
    medicationAllowed: false,
    familyProfileIds: ["u-parent-1"],
  },
  {
    id: "c-3",
    firstName: "Noah",
    lastName: "Dubois",
    section: "Grands",
    birthDate: isoYearsAgo(2, 9),
    photoUrl: "https://i.pravatar.cc/160?img=52",
    allergies: [],
    medicationAllowed: true,
    familyProfileIds: ["u-parent-2"],
  },
  {
    id: "c-4",
    firstName: "Jade",
    lastName: "Rousseau",
    section: "Bébés",
    birthDate: isoMonthsAgo(10),
    allergies: ["Œuf"],
    medicationAllowed: false,
    familyProfileIds: ["u-parent-3"],
  },
  {
    id: "c-5",
    firstName: "Liam",
    lastName: "Benali",
    section: "Moyens",
    birthDate: isoYearsAgo(1, 5),
    allergies: [],
    medicationAllowed: true,
    familyProfileIds: ["u-parent-4"],
  },
  {
    id: "c-6",
    firstName: "Chloé",
    lastName: "Lefèvre",
    section: "Grands",
    birthDate: isoYearsAgo(2, 6),
    allergies: ["Gluten", "Fruits à coque"],
    medicationAllowed: true,
    familyProfileIds: [],
  },
  {
    id: "c-7",
    firstName: "Adam",
    lastName: "Garcia",
    section: "Moyens",
    birthDate: isoYearsAgo(1, 11),
    allergies: [],
    medicationAllowed: false,
    familyProfileIds: [],
  },
  {
    id: "c-8",
    firstName: "Mila",
    lastName: "Petit",
    section: "Grands",
    birthDate: isoYearsAgo(2, 3),
    allergies: ["Pollen"],
    medicationAllowed: true,
    familyProfileIds: [],
  },
];

export function seedEvents(): DayEvent[] {
  const t = (daysAgo: number, hh: number, mm: number) => atTime(daysAgo, hh, mm);
  return [
    // --- Aujourd'hui ---
    { id: "e-1", childId: "c-1", authorId: "u-staff-1", type: "repas", moment: "matin", quality: "tout", createdAt: t(0, 8, 45), note: "Bon appétit ce matin." },
    { id: "e-2", childId: "c-1", authorId: "u-staff-2", type: "activité", name: "Éveil musical", createdAt: t(0, 10, 15) },
    { id: "e-3", childId: "c-1", authorId: "u-staff-1", type: "repas", moment: "midi", quality: "moitié", createdAt: t(0, 12, 10) },
    { id: "e-4", childId: "c-1", authorId: "u-staff-3", type: "sieste", start: "13:00", end: "14:45", quality: "calme", createdAt: t(0, 14, 50) },
    { id: "e-5", childId: "c-2", authorId: "u-staff-3", type: "repas", moment: "matin", quality: "peu", createdAt: t(0, 9, 5), note: "A repoussé le biberon, rhume." },
    { id: "e-6", childId: "c-2", authorId: "u-staff-3", type: "sieste", start: "09:40", end: "11:10", quality: "agitée", createdAt: t(0, 11, 15) },
    { id: "e-7", childId: "c-3", authorId: "u-staff-2", type: "activité", name: "Peinture aux doigts", createdAt: t(0, 10, 30) },
    { id: "e-8", childId: "c-3", authorId: "u-staff-1", type: "repas", moment: "midi", quality: "tout", createdAt: t(0, 12, 20) },
    { id: "e-9", childId: "c-3", authorId: "u-staff-1", type: "médicament", name: "Doliprane", dose: "2,5 mL", time: "13:30", parentalConsentConfirmed: true, createdAt: t(0, 13, 32), note: "Fièvre légère après le déjeuner." },
    { id: "e-10", childId: "c-5", authorId: "u-staff-2", type: "incident", kind: "chute", severity: "léger", createdAt: t(0, 11, 0), note: "Petite chute sur le tapis, aucune marque." },
    { id: "e-11", childId: "c-6", authorId: "u-staff-2", type: "repas", moment: "midi", quality: "rien", createdAt: t(0, 12, 15), note: "N'a pas voulu manger, propose un goûter plus tôt." },
    // --- Hier ---
    { id: "e-12", childId: "c-1", authorId: "u-staff-1", type: "repas", moment: "goûter", quality: "tout", createdAt: t(1, 16, 0) },
    { id: "e-13", childId: "c-3", authorId: "u-staff-3", type: "sieste", start: "13:15", end: "15:00", quality: "calme", createdAt: t(1, 15, 5) },
    { id: "e-14", childId: "c-2", authorId: "u-staff-2", type: "activité", name: "Lecture d'histoires", createdAt: t(1, 10, 45) },
    // --- Avant-hier ---
    { id: "e-15", childId: "c-1", authorId: "u-staff-2", type: "incident", kind: "morsure", severity: "modéré", createdAt: t(2, 11, 30), note: "Morsure d'un camarade à l'avant-bras, désinfecté." },
  ];
}

export function seedMessages(): Message[] {
  return [
    {
      id: "m-1",
      childId: "c-1",
      fromProfileId: "u-parent-1",
      body: "Bonjour, Gabriel a très mal dormi cette nuit (poussée dentaire). Il risque d'être grognon et de réclamer une sieste plus tôt. Merci !",
      createdAt: atTime(0, 7, 40),
      status: "nouveau",
    },
    {
      id: "m-2",
      childId: "c-3",
      fromProfileId: "u-parent-2",
      body: "Noah sera récupéré à 16h aujourd'hui par sa grand-mère (Mme Dubois). Elle a une pièce d'identité.",
      createdAt: atTime(0, 8, 5),
      status: "nouveau",
    },
    {
      id: "m-3",
      childId: "c-2",
      fromProfileId: "u-parent-1",
      body: "Rose a un léger rhume depuis hier soir, pas de fièvre. Surveillez sa température s'il vous plaît, je reste joignable.",
      createdAt: atTime(1, 18, 30),
      status: "lu",
    },
    {
      id: "m-4",
      childId: "c-3",
      fromProfileId: "u-parent-2",
      body: "Pensez à lui redonner son doudou resté au vestiaire hier, merci beaucoup !",
      createdAt: atTime(2, 17, 10),
      status: "traité",
    },
  ];
}

// --- helpers de dates ---

function atTime(daysAgo: number, hh: number, mm: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

function isoMonthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

function isoYearsAgo(years: number, extraMonths = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() - extraMonths);
  return d.toISOString().slice(0, 10);
}
