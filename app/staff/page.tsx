import type { Child } from "@/lib/types";
import { createServerClient } from "@/lib/supabase/server";
import { ChildrenList } from "./children-list";

export default async function StaffChildrenPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("children")
    .select("id, first_name, last_name, section, birth_date, allergies, medication_allowed, photo_url")
    .order("first_name", { ascending: true });

  if (error) {
    return (
      <div className="rounded-lg bg-surface p-6 text-center shadow-soft">
        <p className="font-heading font-bold text-ink">
          Impossible de charger la liste des enfants
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Vérifiez votre connexion puis rechargez la page.
        </p>
      </div>
    );
  }

  const children = (data ?? []) as Child[];

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h2 className="text-xl">Enfants</h2>
        <p className="text-sm text-ink-soft">
          {children.length} enfant{children.length > 1 ? "s" : ""} inscrit
          {children.length > 1 ? "s" : ""} · 3 sections
        </p>
      </header>

      <ChildrenList items={children} />
    </div>
  );
}
