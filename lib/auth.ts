import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export type Role = "staff" | "parent";

export type Profile = {
  id: string;
  role: Role;
  first_name: string;
  last_name: string;
};

/** Espace d'accueil correspondant au rôle. */
export function spaceForRole(role: Role): "/staff" | "/parent" {
  return role === "staff" ? "/staff" : "/parent";
}

/**
 * Profil de l'utilisateur connecté (ou null). Mémoïsé par requête via `cache`
 * pour éviter les allers-retours multiples entre page et layout.
 * Lecture couverte par la policy RLS « chacun lit son profil » (US-04).
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, role, first_name, last_name")
    .eq("id", user.id)
    .single();

  return (data as Profile | null) ?? null;
});

/**
 * Garde de layout : exige une session ET le bon rôle.
 * - pas de session → /login
 * - mauvais rôle → renvoi vers son propre espace
 * Complément aux policies RLS, pas un substitut.
 */
export async function requireProfile(role: Role): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== role) redirect(spaceForRole(profile.role));
  return profile;
}
