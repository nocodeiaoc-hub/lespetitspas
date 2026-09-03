import type { ReactNode } from "react";
import { Nav, type NavItem } from "@/components/nav-link";
import { LogoutButton } from "@/components/logout-button";

export type { NavItem };

/**
 * Coquille des espaces authentifiés (équipe / parent).
 * En-tête avec le titre de l'espace + navigation + bouton de déconnexion.
 */
export function AppShell({
  title,
  nav = [],
  children,
}: {
  title: string;
  nav?: NavItem[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-2.5">
          <span className="font-heading text-lg font-bold text-ink">{title}</span>
          <LogoutButton />
        </div>
        {nav.length > 0 && <Nav items={nav} />}
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 p-4">{children}</main>
    </div>
  );
}
