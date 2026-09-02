import { CalendarClock } from "lucide-react";
import type { DayEvent } from "@/lib/types";
import { EVENT_LABELS, eventSummary } from "@/lib/events";
import { timeInParis } from "@/lib/date";
import { EventBadge } from "@/components/event-badge";

export type TimelineEvent = DayEvent & {
  author?: { first_name: string } | null;
};

export function Timeline({
  events,
  dayLabel,
  syncedAt,
  emptyHint = "Aucun événement enregistré pour cette date.",
}: {
  events: TimelineEvent[];
  dayLabel: string;
  syncedAt: string;
  emptyHint?: string;
}) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg bg-surface p-8 text-center shadow-soft">
        <span className="flex size-12 items-center justify-center rounded-pill bg-primary-soft text-primary-strong">
          <CalendarClock className="size-5" />
        </span>
        <p className="font-heading font-bold text-ink">
          Aucun événement {dayLabel.toLowerCase()}
        </p>
        <p className="max-w-xs text-sm text-ink-soft">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-3">
        {events.map((e) => (
          <li
            key={e.id}
            className="flex gap-3 rounded-lg bg-surface p-4 shadow-soft"
          >
            <EventBadge type={e.type} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-heading font-bold text-ink">
                  {EVENT_LABELS[e.type]}
                </span>
                <span className="shrink-0 text-xs font-medium text-ink-soft">
                  {timeInParis(e.created_at)}
                </span>
              </div>
              <p className="text-sm text-ink-soft">{eventSummary(e)}</p>
              {e.note && <p className="mt-1 text-sm text-ink">« {e.note} »</p>}
              {e.author?.first_name && (
                <p className="mt-1 text-xs text-ink-soft">
                  Saisi par {e.author.first_name}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="text-center text-xs text-ink-soft">
        Dernière synchronisation à {syncedAt} · rechargez la page pour actualiser
      </p>
    </div>
  );
}
