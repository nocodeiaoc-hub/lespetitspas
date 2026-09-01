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
