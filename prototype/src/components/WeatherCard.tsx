import { CloudRain, CloudSun, Snowflake, Sun, Zap, Shirt } from "lucide-react";
import { weatherForDate, type WeatherKind } from "../lib/weather";

const ICONS: Record<WeatherKind, typeof Sun> = {
  ensoleillé: Sun,
  nuageux: CloudSun,
  pluie: CloudRain,
  orageux: Zap,
  neige: Snowflake,
};

/** Fonctionnalite bonus : meteo du jour + conseil d'habillement. */
export function WeatherCard({ isoDate }: { isoDate: string }) {
  const w = weatherForDate(isoDate);
  const Icon = ICONS[w.kind];

  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5">
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "var(--color-accent-soft)", color: "#c65f89" }}
        >
          <Icon size={26} strokeWidth={2.2} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Météo · {w.city}
          </p>
          <p className="font-heading text-lg font-bold">{w.summary}</p>
        </div>
      </div>
      <p className="flex items-start gap-2 border-t border-line pt-3 text-sm text-ink-soft sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <Shirt size={16} className="mt-0.5 shrink-0" style={{ color: "var(--color-secondary)" }} />
        <span>
          <span className="font-semibold text-ink">Conseil d'habillement : </span>
          {w.advice}
        </span>
      </p>
    </div>
  );
}
