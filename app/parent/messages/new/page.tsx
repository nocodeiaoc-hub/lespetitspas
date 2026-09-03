import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { MessageForm } from "./message-form";

export default async function NewParentMessagePage() {
  const supabase = await createServerClient();
  // La RLS limite `children` aux enfants rattachés au parent connecté.
  const { data, error } = await supabase
    .from("children")
    .select("id, first_name, last_name")
    .order("first_name", { ascending: true });

  if (error) throw new Error(error.message);
  const children = data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/parent/messages"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Mes messages
      </Link>

      <header>
        <h2 className="text-xl">Écrire à l&apos;équipe</h2>
        <p className="text-sm text-ink-soft">
          Un message court pour signaler une allergie, une mauvaise nuit, un
          changement d&apos;horaire…
        </p>
      </header>

      {children.length === 0 ? (
        <div className="rounded-lg bg-surface p-6 text-center shadow-soft">
          <p className="font-heading font-bold text-ink">
            Aucun enfant rattaché à votre compte
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Contactez la crèche pour pouvoir écrire à l&apos;équipe.
          </p>
        </div>
      ) : (
        <MessageForm childOptions={children} />
      )}
    </div>
  );
}
