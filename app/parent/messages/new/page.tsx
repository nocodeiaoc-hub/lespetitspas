import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewParentMessagePage() {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/parent"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Retour à mes enfants
      </Link>

      <div className="rounded-lg bg-surface p-6 text-center shadow-soft">
        <h2 className="text-lg">Écrire à l&apos;équipe</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Le formulaire de message (choix de l&apos;enfant, texte limité à 500
          caractères) arrive avec l&apos;US-22.
        </p>
      </div>
    </div>
  );
}
