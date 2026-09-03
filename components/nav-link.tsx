"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string };

/** Barre de navigation : l'item actif est celui dont le href est le plus long préfixe de l'URL. */
export function Nav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const activeHref = items
    .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className="mx-auto flex w-full max-w-3xl gap-1 px-2 pb-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.href === activeHref ? "page" : undefined}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            item.href === activeHref
              ? "bg-primary-soft text-primary-strong"
              : "text-ink-soft hover:bg-primary-soft/50 hover:text-ink",
          )}
        >
          {item.label as ReactNode}
        </Link>
      ))}
    </nav>
  );
}
