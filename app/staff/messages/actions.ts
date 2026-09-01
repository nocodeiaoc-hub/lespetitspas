"use server";

import { revalidatePath } from "next/cache";
import type { MessageStatus } from "@/lib/types";
import { createServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

async function setStatus(
  id: string,
  status: MessageStatus,
): Promise<{ ok: boolean; error?: string }> {
  const profile = await getProfile();
  if (!profile || profile.role !== "staff") {
    return { ok: false, error: "Accès réservé à l'équipe." };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("messages")
    .update({ status })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/staff/messages");
  revalidatePath("/staff/children/[id]", "page");
  return { ok: true };
}

/** Passe un message « nouveau » en « lu » (déclenché à l'ouverture). */
export async function markRead(id: string) {
  return setStatus(id, "lu");
}

/** Passe un message en « traité ». */
export async function markProcessed(id: string) {
  return setStatus(id, "traite");
}
