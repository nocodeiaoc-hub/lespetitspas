import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, Pill, Plus } from "lucide-react";
import type { Child, DayEvent } from "@/lib/types";
import { ageLabel } from "@/lib/utils";
import {
  humanDay,
  isValidDate,
  parisDayRange,
  timeInParis,
  todayInParis,
} from "@/lib/date";
import { createServerClient } from "@/lib/supabase/server";
import { ChildAvatar } from "@/components/child-avatar";
import { Button } from "@/components/ui/button";
import { DateSelector } from "./date-selector";
import { Timeline } from "./timeline";

type ParentRow = {
  parent: { id: string; first_name: string; last_name: string } | null;
};

type MessageRow = {
  id: string;
  body: string;
  created_at: string;
  sender: { first_name: string } | null;
};

export default async function StaffChildDetailPage({
  params,
  searchParams,
}: PageProps<"/staff/children/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const today = todayInParis();
  const rawDate = typeof sp.date === "string" ? sp.date : today;
  const date = isValidDate(rawDate) && rawDate <= today ? rawDate : today;

  const supabase = await createServerClient();
  const range = parisDayRange(date);

  const [childRes, parentsRes, messagesRes, eventsRes] = await Promise.all([
    supabase
      .from("children")
      .select(
        "id, first_name, last_name, section, birth_date, allergies, medication_allowed, photo_url",
      )
      .eq("id", id)
      .single(),
    supabase
      .from("family_members")
      .select("parent:profiles(id, first_name, last_name)")
      .eq("child_id", id),
    supabase
      .from("messages")
      .select("id, body, created_at, sender:profiles(first_name)")
      .eq("child_id", id)
      .neq("status", "traite")
      .order("created_at", { ascending: false }),
    supabase
      .from("events")
      .select("*")
      .eq("child_id", id)
      .gte("created_at", range.gte)
      .lt("created_at", range.lt)
      .order("created_at", { ascending: false }),
  ]);

  if (!childRes.data) notFound();
  const child = childRes.data as Child;
  const parents = ((parentsRes.data ?? []) as unknown as ParentRow[])
    .map((r) => r.parent)
    .filter((p): p is NonNullable<ParentRow["parent"]> => p !== null);
  const messages = (messagesRes.data ?? []) as unknown as MessageRow[];
  const events = (eventsRes.data ?? []) as DayEvent[];

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/staff"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Retour à la liste
      </Link>

      {/* Résumé */}
      <section className="rounded-lg bg-surface p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <ChildAvatar
            firstName={child.first_name}
            lastName={child.last_name}
            photoUrl={child.photo_url}
            seed={child.id}
            className="size-16 text-lg"
          />
          <div className="min-w-0">
            <h2 className="truncate text-xl">
              {child.first_name} {child.last_name}
            </h2>
            <p className="text-sm text-ink-soft">
              {child.section} · {ageLabel(child.birth_date)}
            </p>
          </div>
        </div>

        <dl className="mt-4 flex flex-col gap-2.5 text-sm">
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-ink-soft">Allergies</dt>
            <dd className="text-ink">
              {child.allergies.length > 0
                ? child.allergies.join(", ")
                : "Aucune connue"}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-ink-soft">Médicament</dt>
            <dd>
              <span
                className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-semibold ${
                  child.medication_allowed
                    ? "bg-success-soft text-success-strong"
                    : "bg-danger-soft text-danger-strong"
                }`}
              >
                <Pill className="size-3" />
                {child.medication_allowed
                  ? "Autorisation parentale"
                  : "Pas d'autorisation"}
              </span>
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-ink-soft">Parents</dt>
            <dd className="flex flex-wrap gap-1.5">
              {parents.length > 0 ? (
                parents.map((p) => (
                  <span
                    key={p.id}
                    className="rounded-pill bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary-strong"
                  >
                    {p.first_name} {p.last_name}
                  </span>
                ))
              ) : (
                <span className="text-ink-soft">Aucun parent rattaché</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      {/* Messages des parents à traiter */}
      {messages.length > 0 && (
        <section className="rounded-lg border border-accent-strong/30 bg-accent-soft p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-accent-strong" />
            <h3 className="text-sm font-bold text-ink">
              {messages.length} message{messages.length > 1 ? "s" : ""} des
              parents à traiter
            </h3>
          </div>
          <ul className="mt-2 flex flex-col gap-2">
            {messages.slice(0, 3).map((m) => (
              <li key={m.id} className="text-sm">
                <span className="font-medium text-ink">
                  {m.sender?.first_name ?? "Parent"}
                </span>
                <span className="text-ink-soft">
                  {" "}
                  · {timeInParis(m.created_at)}
                </span>
                <p className="line-clamp-2 text-ink-soft">{m.body}</p>
              </li>
            ))}
          </ul>
          <Link
            href="/staff/messages"
            className="mt-2 inline-block text-xs font-semibold text-accent-strong hover:underline"
          >
            {messages.length > 3
              ? `Voir les ${messages.length} messages`
              : "Ouvrir la messagerie"}{" "}
            →
          </Link>
        </section>
      )}

      {/* Journée */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg">Journée</h3>
          <Button asChild size="xl">
            <Link href={`/staff/children/${child.id}/nouvel-evenement`}>
              <Plus />
              Ajouter un événement
            </Link>
          </Button>
        </div>

        <DateSelector date={date} />

        <Timeline
          events={events}
          dayLabel={humanDay(date)}
          syncedAt={timeInParis(new Date().toISOString())}
        />
      </section>
    </div>
  );
}
