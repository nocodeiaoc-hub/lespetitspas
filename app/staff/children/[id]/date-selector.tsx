"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { humanDay, shiftDay, todayInParis } from "@/lib/date";
import { Button } from "@/components/ui/button";

/**
 * Sélecteur de date de la timeline. Change l'URL (`?date=YYYY-MM-DD`) →
 * le Server Component recharge les événements du jour choisi.
 */
export function DateSelector({ date }: { date: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const today = todayInParis();

  function go(next: string) {
    const qs = next === today ? "" : `?date=${next}`;
    router.push(`${pathname}${qs}`);
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-surface p-2 shadow-soft">
      <Button
        type="button"
        variant="ghost"
        size="icon-xl"
        onClick={() => go(shiftDay(date, -1))}
        aria-label="Jour précédent"
        className="text-ink-soft hover:text-ink"
      >
        <ChevronLeft />
      </Button>

      <label className="flex flex-col items-center">
        <span className="font-heading text-sm font-bold text-ink">
          {humanDay(date)}
        </span>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => e.target.value && go(e.target.value)}
          className="mt-0.5 bg-transparent text-xs text-ink-soft outline-none"
          aria-label="Choisir une date"
        />
      </label>

      <Button
        type="button"
        variant="ghost"
        size="icon-xl"
        onClick={() => go(shiftDay(date, 1))}
        disabled={date >= today}
        aria-label="Jour suivant"
        className="text-ink-soft hover:text-ink"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
