import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import type { Child, EventType } from "@/lib/types";
import { EVENT_LABELS } from "@/lib/events";
import { parisDayRange, timeInParis, todayInParis } from "@/lib/date";
import { createServerClient } from "@/lib/supabase/server";
import { ChildAvatar } from "@/components/child-avatar";

type LastEvent = { type: EventType; created_at: string };

export default async function ParentHomePage() {
  const supabase = await createServerClient();
  const range = parisDayRange(todayInParis());

  // La RLS limite déjà `children` aux enfants rattachés au parent connecté.
  const { data: childrenData, error } = await supabase
    .from("children")
    .select("id, first_name, last_name, section, birth_date, allergies, medication_allowed, photo_url")
    .order("first_name", { ascending: true });

  if (error) throw new Error(error.message);
  const children = (childrenData ?? []) as Child[];

  const { data: eventsData } = await supabase
    .from("events")
    .select("child_id, type, created_at")
    .gte("created_at", range.gte)
    .lt("created_at", range.lt)
    .order("created_at", { ascending: false });

  const lastByChild = new Map<string, LastEvent>();
  for (const e of (eventsData ?? []) as (LastEvent & { child_id: string })[]) {
    if (!lastByChild.has(e.child_id)) {
      lastByChild.set(e.child_id, { type: e.type, created_at: e.created_at });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-xl">Bonjour 👋</h2>
        <p className="text-sm text-ink-soft">
          {children.length > 1
            ? "Voici la journée de vos enfants."
            : "Voici la journée de votre enfant."}
        </p>
      </header>

      {children.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg bg-surface p-8 text-center shadow-soft">
          <p className="font-heading font-bold text-ink">
            Aucun enfant rattaché à votre compte
          </p>
          <p className="max-w-xs text-sm text-ink-soft">
            Contactez l&apos;équipe de la crèche pour qu&apos;elle rattache votre
            ou vos enfants à votre compte.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {children.map((c) => {
            const last = lastByChild.get(c.id);
            return (
              <li key={c.id}>
                <Link
                  href={`/parent/children/${c.id}`}
                  className="flex items-center gap-4 rounded-lg bg-surface p-4 shadow-soft transition-shadow hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                >
                  <ChildAvatar
                    firstName={c.first_name}
                    lastName={c.last_name}
                    photoUrl={c.photo_url}
                    seed={c.id}
                    className="size-14"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-heading text-lg font-bold text-ink">
                      {c.first_name} {c.last_name}
                    </span>
                    <span className="block text-sm text-ink-soft">
                      {last
                        ? `Dernier : ${EVENT_LABELS[last.type]} à ${timeInParis(last.created_at)}`
                        : "Pas encore d'événement aujourd'hui"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/parent/messages/new"
        className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-strong"
      >
        <MessageSquarePlus className="size-4" />
        Envoyer un message à l&apos;équipe
      </Link>
    </div>
  );
}
