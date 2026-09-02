"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Contenu partagé des `error.tsx` : message chaleureux + bouton « Réessayer ».
 * Jamais d'écran blanc (cf. AGENTS.md).
 */
export function ErrorState({
  error,
  reset,
  message = "Une erreur est survenue en chargeant cette page.",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  message?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-surface p-8 text-center shadow-soft">
      <span className="flex size-12 items-center justify-center rounded-pill bg-danger-soft text-danger-strong">
        <RotateCw className="size-5" />
      </span>
      <p className="font-heading font-bold text-ink">Oups, ça n&apos;a pas chargé</p>
      <p className="max-w-xs text-sm text-ink-soft">{message}</p>
      <Button type="button" size="xl" onClick={reset}>
        <RotateCw />
        Réessayer
      </Button>
    </div>
  );
}
