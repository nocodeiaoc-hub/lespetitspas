"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export type SendMessageState = { error: string | null };

const MAX = 500;

/** Envoi d'un message parent → équipe (US-22). */
export async function sendMessage(
  _prev: SendMessageState,
  form: FormData,
): Promise<SendMessageState> {
  const profile = await getProfile();
  if (!profile || profile.role !== "parent") {
    return { error: "Seuls les parents peuvent écrire à l'équipe." };
  }

  const childId = String(form.get("child_id") ?? "");
  const body = String(form.get("body") ?? "").trim();

  if (!childId) return { error: "Choisissez l'enfant concerné." };
  if (body.length === 0) return { error: "Votre message est vide." };
  if (body.length > MAX) {
    return { error: `Message trop long (${body.length}/${MAX} caractères).` };
  }

  const supabase = await createServerClient();

  // Garde serveur : l'enfant doit être rattaché au parent connecté.
  // (La policy RLS `messages_insert_parent` le refuserait aussi ; ce contrôle
  // explicite donne un message clair au lieu d'une erreur Postgres brute.)
  const { data: link } = await supabase
    .from("family_members")
    .select("child_id")
    .eq("child_id", childId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!link) {
    return { error: "Cet enfant n'est pas rattaché à votre compte." };
  }

  const { error } = await supabase.from("messages").insert({
    child_id: childId,
    from_profile_id: profile.id,
    body,
    status: "nouveau",
  });

  if (error) {
    console.error("sendMessage insert failed", error);
    return { error: "Envoi impossible pour le moment. Réessayez." };
  }

  revalidatePath("/parent/messages");
  redirect("/parent/messages?envoye=1");
}
