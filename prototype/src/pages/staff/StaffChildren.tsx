import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search, Users } from "lucide-react";
import { CHILDREN } from "../../data/mock";
import type { Section } from "../../data/types";
import { useApp } from "../../state/AppState";
import { countEventsForChild } from "../../state/selectors";
import { ageLabel, todayISO } from "../../lib/format";
import { Avatar } from "../../components/Avatar";
import { EmptyState } from "../../components/EmptyState";
import { PageHeader } from "../../components/PageHeader";
import { WeatherCard } from "../../components/WeatherCard";

const SECTIONS: Section[] = ["Bébés", "Moyens", "Grands"];

export function StaffChildren() {
  const { events } = useApp();
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<Section | "Tous">("Tous");
  const today = todayISO();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHILDREN.filter((c) => {
      const matchesSection = section === "Tous" || c.section === section;
      const matchesQuery =
        q === "" ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q);
      return matchesSection && matchesQuery;
    });
  }, [query, section]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Enfants" subtitle={`${CHILDREN.length} enfants inscrits · 3 sections`} />

      <WeatherCard isoDate={today} />

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            className="field-input"
            style={{ paddingLeft: 40 }}
            placeholder="Rechercher un enfant par nom…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["Tous", ...SECTIONS] as const).map((s) => {
            const active = section === s;
            return (
              <button
                key={s}
                onClick={() => setSection(s)}
                className="chip"
                style={{
                  minHeight: 38,
                  paddingInline: 14,
                  background: active ? "var(--color-primary)" : "var(--color-primary-soft)",
                  color: active ? "#fff" : "var(--color-ink)",
                }}
                aria-pressed={active}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={<Users size={26} />}
          title="Aucun enfant ne correspond"
          description="Ajustez la recherche ou le filtre de section."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((c) => {
            const count = countEventsForChild(events, c.id, today);
            return (
              <Link
                key={c.id}
                to={`/staff/children/${c.id}`}
                className="card flex items-center gap-3 p-3.5 hover:shadow-[var(--shadow-lift)]"
              >
                <Avatar
                  firstName={c.firstName}
                  lastName={c.lastName}
                  photoUrl={c.photoUrl}
                  seed={c.id}
                  size={48}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-bold">
                    {c.firstName} {c.lastName}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {c.section} · {ageLabel(c.birthDate)}
                  </p>
                  <p className="mt-0.5 text-xs font-medium" style={{ color: count ? "#2f8f85" : "var(--color-ink-soft)" }}>
                    {count === 0
                      ? "Aucun événement aujourd'hui"
                      : `${count} événement${count > 1 ? "s" : ""} aujourd'hui`}
                  </p>
                </div>
                <ChevronRight size={18} className="text-ink-soft" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
