import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Child } from "@/lib/types";
import { ageLabel } from "@/lib/utils";
import { createServerClient } from "@/lib/supabase/server";
import { ChildAvatar } from "@/components/child-avatar";

export default async function ParentChildPage({
  params,
}: PageProps<"/parent/children/[id]">) {
  const { id } = await params;
  const supabase = await createServerClient();

  // La RLS ne renvoie l'enfant que s'il est rattaché au parent connecté.
  const { data } = await supabase
    .from("children")
    .select("id, first_name, last_name, section, birth_date, allergies, medication_allowed, photo_url")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const child = data as Child;

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
        <div>
          <h2 className="text-xl">
            {child.first_name} {child.last_name}
          </h2>
          <p className="text-sm text-ink-soft">
            {child.section} · {ageLabel(child.birth_date)}
          </p>
        </div>
      </div>

      <p className="rounded-lg bg-primary-soft px-4 py-3 text-sm text-primary-strong">
        La timeline de la journée arrive avec l&apos;US-20.
      </p>
    </div>
  );
}
