import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Child } from "@/lib/types";
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
import { DateSelector } from "@/components/date-selector";
import { Timeline, type TimelineEvent } from "@/components/timeline";

export default async function ParentChildTimelinePage({
  params,
  searchParams,
}: PageProps<"/parent/children/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const today = todayInParis();
  const rawDate = typeof sp.date === "string" ? sp.date : today;
  const date = isValidDate(rawDate) && rawDate <= today ? rawDate : today;

  const supabase = await createServerClient();
  const range = parisDayRange(date);

  // Garde serveur (US-21) : la RLS ne renvoie l'enfant que s'il est rattaché
  // au parent connecté. Sinon → retour à l'accueil parent.
  const { data: childData } = await supabase
    .from("children")
    .select("id, first_name, last_name, section, birth_date, photo_url")
    .eq("id", id)
    .single();

  if (!childData) redirect("/parent");
  const child = childData as unknown as Child;

  const { data: eventsData } = await supabase
    .from("events")
    .select("*, author:profiles(first_name)")
    .eq("child_id", id)
    .gte("created_at", range.gte)
    .lt("created_at", range.lt)
    .order("created_at", { ascending: false });

  const events = (eventsData ?? []) as unknown as TimelineEvent[];

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/parent"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Retour à mes enfants
      </Link>

      <div className="flex items-center gap-4 rounded-lg bg-surface p-5 shadow-soft">
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

      <DateSelector date={date} />

      <Timeline
        events={events}
        dayLabel={humanDay(date)}
        syncedAt={timeInParis(new Date().toISOString())}
        emptyHint="L'équipe n'a pas encore saisi d'événement pour cette journée."
      />
    </div>
  );
}
