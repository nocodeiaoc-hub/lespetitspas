"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { weatherKind, type WeatherKind, type WeatherPayload } from "@/lib/weather";

const ICONS: Record<WeatherKind, LucideIcon> = {
  clear: Sun,
  cloud: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

type Status = "loading" | "ok" | "error";

/** Bloc météo + conseil d'habillement pour la timeline parent (US-28). */
export function WeatherBlock() {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<WeatherPayload | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/weather")
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        return (await res.json()) as WeatherPayload;
      })
      .then((payload) => {
        if (!alive) return;
        setData(payload);
        setStatus("ok");
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-surface p-4 shadow-soft">
        <div className="size-9 animate-pulse rounded-pill bg-muted" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="rounded-lg bg-surface p-4 text-sm text-ink-soft shadow-soft">
        Météo indisponible pour le moment.
      </div>
    );
  }

  const Icon = ICONS[weatherKind(data.weather_code)];

  return (
    <div className="flex items-start gap-3 rounded-lg bg-secondary-soft p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-surface text-secondary-strong">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-heading font-bold text-ink">
          {data.temperature}°C · {data.summary}
        </p>
        <p className="text-sm text-ink-soft">{data.advice}</p>
      </div>
    </div>
  );
}
