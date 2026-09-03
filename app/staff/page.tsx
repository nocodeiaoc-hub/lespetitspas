import type { Child } from "@/lib/types";
import { parisDayRange, todayInParis } from "@/lib/date";
import { createServerClient } from "@/lib/supabase/server";
import { ChildrenList } from "./children-list";

export default async function StaffChildrenPage() {
  const supabase = await createServerClient();
  const range = parisDayRange(todayInParis());

  const [childrenRes, eventsRes] = await Promise.all([
    supabase
      .from("children")
      .select(
        "id, first_name, last_name, section, birth_date, allergies, medication_allowed, photo_url",
      )
      .order("first_name", { ascending: true }),
    supabase
      .from("events")
      .select("child_id")
      .gte("created_at", range.gte)
      .lt("created_at", range.lt),
  ]);

  if (childrenRes.error) {
    throw new Error(childrenRes.error.message);
  }

  const children = (childrenRes.data ?? []) as Child[];

  // Nombre d'événements du jour par enfant (US-39), dérivé côté serveur.
  const todayCounts: Record<string, number> = {};
  for (const row of (eventsRes.data ?? []) as { child_id: string }[]) {
    todayCounts[row.child_id] = (todayCounts[row.child_id] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h2 className="text-xl">Enfants</h2>
        <p className="text-sm text-ink-soft">
          {children.length} enfant{children.length > 1 ? "s" : ""} inscrit
          {children.length > 1 ? "s" : ""} · 3 sections
        </p>
      </header>

      <ChildrenList items={children} todayCounts={todayCounts} />
    </div>
  );
}
