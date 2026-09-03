"use client";

import { ErrorState } from "@/components/error-state";

export default function StaffError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      message="Impossible d'afficher cette page de l'espace équipe. Vérifiez votre connexion et réessayez."
    />
  );
}
