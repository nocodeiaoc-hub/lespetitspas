import {
  Utensils,
  Moon,
  Palette,
  Pill,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { EventType } from "../data/types";

interface Style {
  icon: LucideIcon;
  bg: string;
  fg: string;
  label: string;
}

export const EVENT_STYLES: Record<EventType, Style> = {
  repas: { icon: Utensils, bg: "#e0f2f0", fg: "#2f8f85", label: "Repas" },
  sieste: { icon: Moon, bg: "#e6e9f7", fg: "#5b66b8", label: "Sieste" },
  activité: { icon: Palette, bg: "#fde6ee", fg: "#c65f89", label: "Activité" },
  médicament: { icon: Pill, bg: "#fff2df", fg: "#b9781f", label: "Médicament" },
  incident: { icon: TriangleAlert, bg: "#fdecec", fg: "#c62828", label: "Incident" },
};

export function EventBadge({ type, size = 40 }: { type: EventType; size?: number }) {
  const s = EVENT_STYLES[type];
  const Icon = s.icon;
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: 12,
        background: s.bg,
        color: s.fg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={size * 0.5} strokeWidth={2.2} />
    </span>
  );
}

export function EventTypeChip({ type }: { type: EventType }) {
  const s = EVENT_STYLES[type];
  const Icon = s.icon;
  return (
    <span className="chip" style={{ background: s.bg, color: s.fg }}>
      <Icon size={14} strokeWidth={2.4} />
      {s.label}
    </span>
  );
}
