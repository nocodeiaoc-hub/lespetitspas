import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pill } from "lucide-react";
import type { Child } from "@/lib/types";
import { ageLabel } from "@/lib/utils";
import { createServerClient } from "@/lib/supabase/server";
import { ChildAvatar } from "@/components/child-avatar";

export default async function StaffChildDetailPage({
  params,
}: PageProps<"/staff/children/[id]">) {
  const { id } = await params;
  const supabase = await createServerClient();

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
        href="/staff"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Retour à la liste
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

      <div className="rounded-lg bg-surface p-5 shadow-soft">
        <h3 className="text-base">Résumé</h3>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-ink-soft">Allergies</dt>
            <dd className="text-ink">
              {child.allergies.length > 0
                ? child.allergies.join(", ")
                : "Aucune connue"}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-ink-soft">Médicament</dt>
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
                  ? "Autorisé"
                  : "Non autorisé"}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <p className="rounded-lg bg-primary-soft px-4 py-3 text-sm text-primary-strong">
        La fiche détaillée (parents rattachés, messages, timeline) arrive avec les
        US-12 et US-13.
      </p>
    </div>
  );
}
