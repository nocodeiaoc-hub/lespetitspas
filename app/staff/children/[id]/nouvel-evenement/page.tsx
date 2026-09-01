import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";

export default async function NewEventPage({
  params,
}: PageProps<"/staff/children/[id]/nouvel-evenement">) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: child } = await supabase
    .from("children")
    .select("id, first_name, last_name")
    .eq("id", id)
    .single();

  if (!child) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/staff/children/${child.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Retour à la fiche
      </Link>

      <div className="rounded-lg bg-surface p-6 text-center shadow-soft">
        <h2 className="text-lg">
          Ajouter un événement — {child.first_name} {child.last_name}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Le formulaire de saisie (repas, sieste, activité, incident, et la
          double validation médicament) arrive avec les US-14 et US-15.
        </p>
      </div>
    </div>
  );
}
