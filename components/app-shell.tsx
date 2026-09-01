import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";

/**
 * Coquille des espaces authentifiés (équipe / parent).
 * En-tête avec le titre de l'espace + bouton de déconnexion, visible partout.
 * La navigation détaillée (sidebar / bottom nav) arrivera avec les Phases 5-6.
 */
export function AppShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-surface px-4 py-2.5">
        <span className="font-heading text-lg font-bold text-ink">{title}</span>
        <LogoutButton />
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 p-4">{children}</main>
    </div>
  );
}
