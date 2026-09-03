"use client";

import { ErrorState } from "@/components/error-state";

export default function ParentError({
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
      message="Nous n'avons pas pu afficher la journée de votre enfant. Vérifiez votre connexion et réessayez."
    />
  );
}
