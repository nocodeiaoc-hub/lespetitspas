"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Users } from "lucide-react";
import type { Child, Section } from "@/lib/types";
import { SECTIONS } from "@/lib/types";
import { foldAccents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChildAvatar } from "@/components/child-avatar";

type Filter = Section | "Tous";
const FILTERS: Filter[] = ["Tous", ...SECTIONS];

export function ChildrenList({
  items,
  todayCounts = {},
}: {
  items: Child[];
  todayCounts?: Record<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<Filter>("Tous");

  const results = useMemo(() => {
    const q = foldAccents(query);
    return items.filter((c) => {
      const okSection = section === "Tous" || c.section === section;
      const okQuery =
        q === "" || foldAccents(`${c.first_name} ${c.last_name}`).includes(q);
      return okSection && okQuery;
    });
  }, [items, query, section]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un enfant par nom…"
            className="h-11 pl-10"
            aria-label="Rechercher un enfant par nom"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par section">
          {FILTERS.map((f) => {
            const active = section === f;
            return (
              <Button
                key={f}
                type="button"
                variant={active ? "default" : "secondary"}
                onClick={() => setSection(f)}
                aria-pressed={active}
                className="h-11 rounded-pill px-4"
              >
                {f}
              </Button>
            );
          })}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Aucun enfant inscrit"
          description="Les enfants sont créés par l'équipe technique. Revenez une fois l'inscription faite."
        />
      ) : results.length === 0 ? (
        <EmptyState
          title="Aucun enfant ne correspond"
          description="Ajustez votre recherche ou le filtre de section."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {results.map((c) => (
            <li key={c.id}>
              <Link
                href={`/staff/children/${c.id}`}
                className="flex items-center gap-3 rounded-lg bg-surface p-4 shadow-soft transition-shadow hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
              >
                <ChildAvatar
                  firstName={c.first_name}
                  lastName={c.last_name}
                  photoUrl={c.photo_url}
                  seed={c.id}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-heading font-bold text-ink">
                    {c.first_name} {c.last_name}
                  </span>
                  <span className="block text-sm text-ink-soft">{c.section}</span>
                  <span
                    className={`mt-0.5 block text-xs font-medium ${
                      todayCounts[c.id] ? "text-success-strong" : "text-ink-soft"
                    }`}
                  >
                    {todayCounts[c.id]
                      ? `${todayCounts[c.id]} événement${todayCounts[c.id] > 1 ? "s" : ""} aujourd'hui`
                      : "Aucun événement aujourd'hui"}
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-ink-soft" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg bg-surface p-8 text-center shadow-soft">
      <span className="flex size-12 items-center justify-center rounded-pill bg-primary-soft text-primary-strong">
        <Users className="size-5" />
      </span>
      <p className="font-heading font-bold text-ink">{title}</p>
      <p className="max-w-xs text-sm text-ink-soft">{description}</p>
    </div>
  );
}
