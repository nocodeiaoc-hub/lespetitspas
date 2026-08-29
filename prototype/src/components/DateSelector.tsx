import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { humanDate, todayISO, toISODate } from "../lib/format";

interface Props {
  value: string;
  onChange: (iso: string) => void;
}

const arrowStyle: CSSProperties = { minHeight: 40, paddingInline: 8 };

/** Selecteur de date : fleches + champ date natif. Ne va jamais dans le futur. */
export function DateSelector({ value, onChange }: Props) {
  const shift = (days: number) => {
    const d = new Date(`${value}T12:00:00`);
    d.setDate(d.getDate() + days);
    const iso = toISODate(d);
    if (iso > todayISO()) return;
    onChange(iso);
  };

  const isToday = value === todayISO();

  return (
    <div className="flex items-center gap-2">
      <button
        className="btn btn-ghost"
        style={arrowStyle}
        onClick={() => shift(-1)}
        aria-label="Jour précédent"
      >
        <ChevronLeft size={18} />
      </button>

      <label className="flex items-center">
        <span className="mr-2 hidden text-sm font-semibold text-ink sm:inline">
          {humanDate(value)}
        </span>
        <input
          type="date"
          className="field-input text-sm"
          style={{ minHeight: 40, width: "auto", paddingBlock: 6 }}
          value={value}
          max={todayISO()}
          onChange={(e) => e.target.value && onChange(e.target.value)}
        />
      </label>

      <button
        className="btn btn-ghost"
        style={arrowStyle}
        onClick={() => shift(1)}
        aria-label="Jour suivant"
        disabled={isToday}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
