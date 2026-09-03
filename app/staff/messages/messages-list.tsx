"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { Check, Inbox } from "lucide-react";
import type { MessageStatus } from "@/lib/types";
import { timeInParis } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { markProcessed, markRead } from "./actions";

export type StaffMessage = {
  id: string;
  body: string;
  status: MessageStatus;
  created_at: string;
  sender: { first_name: string } | null;
  child: { first_name: string } | null;
};

type Filter = "tous" | MessageStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "nouveau", label: "Nouveaux" },
  { value: "lu", label: "Lus" },
  { value: "traite", label: "Traités" },
];

const BADGE: Record<MessageStatus, { label: string; cls: string }> = {
  nouveau: { label: "Nouveau", cls: "bg-accent-soft text-accent-strong" },
  lu: { label: "Lu", cls: "bg-muted text-muted-foreground" },
  traite: { label: "Traité", cls: "bg-success-soft text-success-strong" },
};

export function MessagesList({ messages }: { messages: StaffMessage[] }) {
  const [filter, setFilter] = useState<Filter>("tous");
  const [optimistic, setOptimistic] = useOptimistic(
    messages,
    (state, patch: { id: string; status: MessageStatus }) =>
      state.map((m) => (m.id === patch.id ? { ...m, status: patch.status } : m)),
  );
  const [, startTransition] = useTransition();

  const counts = useMemo(() => {
    const c = { tous: optimistic.length, nouveau: 0, lu: 0, traite: 0 };
    for (const m of optimistic) c[m.status] += 1;
    return c;
  }, [optimistic]);

  const visible =
    filter === "tous"
      ? optimistic
      : optimistic.filter((m) => m.status === filter);

  function update(
    id: string,
    status: MessageStatus,
    action: (id: string) => Promise<unknown>,
  ) {
    startTransition(async () => {
      setOptimistic({ id, status });
      await action(id);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par statut">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <Button
              key={f.value}
              type="button"
              variant={active ? "default" : "secondary"}
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className="h-10 rounded-pill px-4"
            >
              {f.label} ({counts[f.value]})
            </Button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg bg-surface p-8 text-center shadow-soft">
          <span className="flex size-12 items-center justify-center rounded-pill bg-primary-soft text-primary-strong">
            <Inbox className="size-5" />
          </span>
          <p className="font-heading font-bold text-ink">
            {optimistic.length === 0
              ? "Aucun message pour le moment"
              : "Aucun message dans ce filtre"}
          </p>
          <p className="max-w-xs text-sm text-ink-soft">
            {optimistic.length === 0
              ? "Les messages envoyés par les parents apparaîtront ici."
              : "Changez de filtre pour voir les autres messages."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((m) => {
            const badge = BADGE[m.status];
            const inner = (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-heading font-bold text-ink">
                    {m.sender?.first_name ?? "Parent"}
                    <span className="font-normal text-ink-soft">
                      {" "}
                      · {m.child?.first_name ?? "enfant"}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-pill px-2 py-0.5 text-xs font-semibold ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {timeInParis(m.created_at)}
                </p>
                <p className="mt-2 text-sm text-ink">{m.body}</p>
              </>
            );
            return (
              <li
                key={m.id}
                className="overflow-hidden rounded-lg bg-surface shadow-soft"
              >
                {m.status === "nouveau" ? (
                  <button
                    type="button"
                    onClick={() => update(m.id, "lu", markRead)}
                    className="block w-full cursor-pointer p-4 text-left transition-colors hover:bg-primary-soft/40"
                  >
                    {inner}
                  </button>
                ) : (
                  <div className="p-4">{inner}</div>
                )}

                {m.status !== "traite" && (
                  <div className="border-t border-line px-4 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => update(m.id, "traite", markProcessed)}
                      className="h-10 px-3 text-secondary-strong hover:text-ink"
                    >
                      <Check />
                      Marquer comme traité
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
