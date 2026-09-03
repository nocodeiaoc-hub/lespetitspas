const PARIS = "Europe/Paris";

/** Décalage (ms) entre l'heure de `tz` et UTC à l'instant `date`. */
function tzOffsetMs(date: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});

  const hour = parts.hour === "24" ? "0" : parts.hour;
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUTC - date.getTime();
}

/** Date du jour à Paris, au format `YYYY-MM-DD`. */
export function todayInParis(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** `true` si `dateStr` (YYYY-MM-DD) est une date valide. */
export function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !Number.isNaN(Date.parse(dateStr));
}

/** Bornes UTC (ISO) de la journée `dateStr` vécue à Paris : [début, lendemain[. */
export function parisDayRange(dateStr: string): { gte: string; lt: string } {
  const ref = new Date(`${dateStr}T00:00:00Z`);
  const startUTC = new Date(ref.getTime() - tzOffsetMs(ref, PARIS));
  const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
  return { gte: startUTC.toISOString(), lt: endUTC.toISOString() };
}

/** `dateStr` décalée de `delta` jours (YYYY-MM-DD). */
export function shiftDay(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** « Aujourd'hui », « Hier », sinon « lundi 3 mars ». */
export function humanDay(dateStr: string): string {
  const today = todayInParis();
  if (dateStr === today) return "Aujourd'hui";
  if (dateStr === shiftDay(today, -1)) return "Hier";
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Heure locale Paris « 14:05 » d'un timestamp ISO. */
export function timeInParis(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    timeZone: PARIS,
    hour: "2-digit",
    minute: "2-digit",
  });
}
