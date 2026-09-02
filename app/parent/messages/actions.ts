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
  const { error } = await supabase.from("messages").insert({
    child_id: childId,
    from_profile_id: profile.id,
    body,
    status: "nouveau",
  });

  if (error) return { error: `Envoi impossible : ${error.message}` };

  revalidatePath("/parent/messages");
  redirect("/parent/messages?envoye=1");
}
