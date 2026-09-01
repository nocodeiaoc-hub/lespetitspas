import { Moon, Palette, Pill, TriangleAlert, Utensils } from "lucide-react";
import type { EventType } from "@/lib/types";
import { EVENT_TONE } from "@/lib/events";
import { cn } from "@/lib/utils";

const ICONS = {
  repas: Utensils,
  sieste: Moon,
  activite: Palette,
  medicament: Pill,
  incident: TriangleAlert,
} as const;

/** Pastille ronde colorée avec l'icône du type d'événement. */
export function EventBadge({
  type,
  className,
}: {
  type: EventType;
  className?: string;
}) {
  const Icon = ICONS[type];
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-pill",
        EVENT_TONE[type],
        className,
      )}
    >
      <Icon className="size-[18px]" strokeWidth={2.2} />
    </span>
  );
}
