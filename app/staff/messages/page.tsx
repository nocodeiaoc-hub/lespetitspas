import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { MessagesList, type StaffMessage } from "./messages-list";

export const metadata: Metadata = { title: "Messages · Les Petits Pas" };

export default async function StaffMessagesPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, body, status, created_at, sender:profiles(first_name), child:children(first_name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg bg-surface p-6 text-center shadow-soft">
        <p className="font-heading font-bold text-ink">
          Impossible de charger les messages
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Vérifiez votre connexion puis rechargez la page.
        </p>
      </div>
    );
  }

  const messages = (data ?? []) as unknown as StaffMessage[];

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h2 className="text-xl">Messages des parents</h2>
        <p className="text-sm text-ink-soft">
          {messages.length} message{messages.length > 1 ? "s" : ""} · du plus
          récent au plus ancien
        </p>
      </header>

      <MessagesList messages={messages} />
    </div>
  );
}
