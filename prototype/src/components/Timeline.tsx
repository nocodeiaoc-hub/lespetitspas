import { CalendarPlus, CalendarClock } from "lucide-react";
import type { DayEvent } from "../data/types";
import {
  eventSummary,
  eventTitle,
  humanDate,
  timeOf,
} from "../lib/format";
import { authorFirstName } from "../state/selectors";
import { EventBadge } from "./EventBadge";
import { EmptyState } from "./EmptyState";

interface Props {
  events: DayEvent[];
  isoDate: string;
  /** Cote parent : afficher "saisi par Prenom". Cote staff : facultatif. */
  showAuthor?: boolean;
  onAddEvent?: () => void;
}

export function Timeline({ events, isoDate, showAuthor = false, onAddEvent }: Props) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock size={26} />}
        title={`Aucun événement le ${humanDate(isoDate).toLowerCase()}`}
        description={
          onAddEvent
            ? "La journée n'a pas encore été renseignée. Ajoutez un premier événement."
            : "L'équipe n'a pas encore renseigné cette journée."
        }
        action={
          onAddEvent ? (
            <button className="btn btn-primary" onClick={onAddEvent}>
              <CalendarPlus size={16} /> Ajouter un événement
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <ol className="relative flex flex-col gap-3">
      {events.map((e) => (
        <li key={e.id} className="card flex gap-3 p-3.5">
          <div className="flex flex-col items-center">
            <EventBadge type={e.type} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h4 className="font-heading text-base font-bold">{eventTitle(e.type)}</h4>
              <time className="text-sm font-medium text-ink-soft">{timeOf(e.createdAt)}</time>
            </div>
            <p className="mt-0.5 text-sm text-ink">{eventSummary(e)}</p>
            {e.type === "médicament" && (
              <p className="mt-1 text-xs font-medium" style={{ color: "#2f8f85" }}>
                ✓ Autorisation parentale confirmée
              </p>
            )}
            {e.note && (
              <p className="mt-1.5 rounded-lg bg-canvas px-2.5 py-1.5 text-sm text-ink-soft">
                « {e.note} »
              </p>
            )}
            {showAuthor && (
              <p className="mt-1.5 text-xs text-ink-soft">
                Saisi par {authorFirstName(e.authorId)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
