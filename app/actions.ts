"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getProfile, spaceForRole } from "@/lib/auth";

export type SignInState = { error: string | null };

/**
 * Connexion email / mot de passe (US-07).
 * Sur succès : redirection par rôle (staff → /staff, parent → /parent).
 * Sur échec : message générique, on ne divulgue pas quel champ est faux.
 */
export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Renseignez votre email et votre mot de passe." };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }

  const profile = await getProfile();
  redirect(profile ? spaceForRole(profile.role) : "/");
}

/** Déconnexion (US-08). Accessible depuis toutes les pages authentifiées. */
export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
