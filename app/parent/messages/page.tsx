import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageSquarePlus, Send } from "lucide-react";
import type { MessageStatus } from "@/lib/types";
import { humanDay, timeInParis } from "@/lib/date";
import { createServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Mes messages · Les Petits Pas" };

type Row = {
  id: string;
  body: string;
  status: MessageStatus;
  created_at: string;
  child: { first_name: string } | null;
};

const BADGE: Record<MessageStatus, { label: string; cls: string }> = {
  nouveau: { label: "Envoyé", cls: "bg-muted text-muted-foreground" },
  lu: { label: "Lu par l'équipe", cls: "bg-primary-soft text-primary-strong" },
  traite: { label: "Traité", cls: "bg-success-soft text-success-strong" },
};

export default async function ParentMessagesPage({
  searchParams,
}: PageProps<"/parent/messages">) {
  const sp = await searchParams;
  const justSent = sp.envoye === "1";

  const profile = await getProfile();
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, body, status, created_at, child:children(first_name)")
    .eq("from_profile_id", profile?.id ?? "")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const messages = (data ?? []) as unknown as Row[];

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl">Mes messages</h2>
          <p className="text-sm text-ink-soft">
            {messages.length} message{messages.length > 1 ? "s" : ""} envoyé
            {messages.length > 1 ? "s" : ""} à l&apos;équipe
          </p>
        </div>
        <Link
          href="/parent/messages/new"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <MessageSquarePlus className="size-4" />
          Écrire
        </Link>
      </header>

      {justSent && (
        <p className="flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2.5 text-sm font-medium text-success-strong">
          <CheckCircle2 className="size-4" />
          Message envoyé à l&apos;équipe.
        </p>
      )}

      {messages.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg bg-surface p-8 text-center shadow-soft">
          <span className="flex size-12 items-center justify-center rounded-pill bg-primary-soft text-primary-strong">
            <Send className="size-5" />
          </span>
          <p className="font-heading font-bold text-ink">
            Vous n&apos;avez pas encore envoyé de message à l&apos;équipe
          </p>
          <p className="max-w-xs text-sm text-ink-soft">
            Utilisez « Écrire » pour signaler une allergie, une mauvaise nuit ou
            un changement d&apos;horaire.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((m) => {
            const badge = BADGE[m.status];
            const day = m.created_at.slice(0, 10);
            return (
              <li key={m.id} className="rounded-lg bg-surface p-4 shadow-soft">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-heading font-bold text-ink">
                    {m.child?.first_name ?? "Enfant"}
                  </span>
                  <span
                    className={`shrink-0 rounded-pill px-2 py-0.5 text-xs font-semibold ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {humanDay(day)} · {timeInParis(m.created_at)}
                </p>
                <p className="mt-2 text-sm text-ink">{m.body}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
