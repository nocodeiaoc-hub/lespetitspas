import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Inbox } from "lucide-react";
import type { MessageStatus } from "../../data/types";
import { useApp } from "../../state/AppState";
import { getChild, getProfile, inboxMessages } from "../../state/selectors";
import { fullName, humanDate, timeOf, toISODate } from "../../lib/format";
import { EmptyState } from "../../components/EmptyState";
import { MessageStatusBadge } from "../../components/MessageStatusBadge";
import { PageHeader } from "../../components/PageHeader";

const FILTERS: (MessageStatus | "tous")[] = ["tous", "nouveau", "lu", "traité"];

export function StaffMessages() {
  const { messages, setMessageStatus } = useApp();
  const [filter, setFilter] = useState<MessageStatus | "tous">("tous");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    const all = inboxMessages(messages);
    return filter === "tous" ? all : all.filter((m) => m.status === filter);
  }, [messages, filter]);

  const open = (id: string, current: MessageStatus) => {
    setOpenId((prev) => (prev === id ? null : id));
    if (current === "nouveau") setMessageStatus(id, "lu");
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Messagerie"
        subtitle="Messages reçus des familles, du plus récent au plus ancien"
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="chip"
              style={{
                minHeight: 36,
                paddingInline: 13,
                textTransform: "capitalize",
                background: active ? "var(--color-primary)" : "var(--color-primary-soft)",
                color: active ? "#fff" : "var(--color-ink)",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Inbox size={26} />}
          title="Aucun message"
          description="Les messages envoyés par les parents apparaîtront ici."
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {list.map((m) => {
            const child = getChild(m.childId);
            const parent = getProfile(m.fromProfileId);
            const isOpen = openId === m.id;
            return (
              <li key={m.id} className="card overflow-hidden">
                <button
                  className="flex w-full items-start gap-3 p-4 text-left"
                  onClick={() => open(m.id, m.status)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-bold">
                        {parent ? fullName(parent) : "Parent"}
                      </span>
                      <span className="text-sm text-ink-soft">
                        pour {child?.firstName ?? "—"}
                      </span>
                      <MessageStatusBadge status={m.status} />
                    </div>
                    <p className={`mt-1 text-sm text-ink ${isOpen ? "" : "line-clamp-2"}`}>
                      {m.body}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {humanDate(toISODate(new Date(m.createdAt)))} à {timeOf(m.createdAt)}
                    </p>
                  </div>
                </button>

                {isOpen && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-line bg-canvas px-4 py-3">
                    <Link
                      to={`/staff/children/${m.childId}`}
                      className="text-sm font-semibold text-primary-strong"
                    >
                      Ouvrir la fiche de {child?.firstName}
                    </Link>
                    <span className="flex-1" />
                    {m.status !== "traité" ? (
                      <button
                        className="btn btn-secondary"
                        style={{ minHeight: 40 }}
                        onClick={() => setMessageStatus(m.id, "traité")}
                      >
                        <Check size={16} /> Marquer comme traité
                      </button>
                    ) : (
                      <span className="text-sm font-medium" style={{ color: "#2f8f85" }}>
                        ✓ Traité
                      </span>
                    )}
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
