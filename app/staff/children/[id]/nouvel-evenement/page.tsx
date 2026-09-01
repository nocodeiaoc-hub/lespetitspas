import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { EventForm } from "../event-form";

export default async function NewEventPage({
  params,
}: PageProps<"/staff/children/[id]/nouvel-evenement">) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: child } = await supabase
    .from("children")
    .select("id, first_name, last_name, medication_allowed")
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

      <header>
        <h2 className="text-xl">Ajouter un événement</h2>
        <p className="text-sm text-ink-soft">
          {child.first_name} {child.last_name}
        </p>
      </header>

      <EventForm
        childId={child.id}
        childName={child.first_name}
        medicationAllowed={child.medication_allowed}
      />
    </div>
  );
}
