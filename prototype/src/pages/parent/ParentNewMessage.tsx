import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, MessageCircle } from "lucide-react";
import { useApp, MAX_MESSAGE_LENGTH } from "../../state/AppState";
import { getChild, sentMessages, visibleChildren } from "../../state/selectors";
import { humanDate, timeOf, toISODate } from "../../lib/format";
import { EmptyState } from "../../components/EmptyState";
import { MessageStatusBadge } from "../../components/MessageStatusBadge";
import { PageHeader } from "../../components/PageHeader";

export function ParentNewMessage() {
  const { currentUser, messages, sendMessage } = useApp();
  const [params] = useSearchParams();
  const children = visibleChildren(currentUser);

  const [childId, setChildId] = useState(
    () => params.get("child") ?? children[0]?.id ?? "",
  );
  const [body, setBody] = useState("");

  const history = useMemo(
    () => (currentUser ? sentMessages(messages, currentUser.id) : []),
    [messages, currentUser],
  );

  const remaining = MAX_MESSAGE_LENGTH - body.length;
  const overLimit = remaining < 0;
  const canSend = body.trim().length > 0 && !overLimit && childId !== "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend || !currentUser) return;
    sendMessage({
      id: `m-${Date.now()}`,
      childId,
      fromProfileId: currentUser.id,
      body,
      createdAt: new Date().toISOString(),
      status: "nouveau",
    });
    setBody("");
  };

  if (children.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Envoyer un message" />
        <EmptyState
          title="Aucun enfant rattaché"
          description="Contactez la crèche pour rattacher votre enfant à votre compte."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Envoyer un message"
        subtitle="Allergie, mauvaise nuit, changement d'horaire… L'équipe reçoit une notification par email."
      />

      <form className="card flex flex-col gap-4 p-4" onSubmit={submit}>
        <div>
          <label className="field-label" htmlFor="msg-child">Enfant concerné</label>
          <select
            id="msg-child"
            className="field-input"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="msg-body">Votre message</label>
          <textarea
            id="msg-body"
            className="field-input"
            rows={5}
            style={{ resize: "vertical" }}
            placeholder="Bonjour, je vous informe que…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="mt-1 flex justify-end">
            <span
              className="text-xs font-medium"
              style={{ color: overLimit ? "var(--color-danger-strong)" : "var(--color-ink-soft)" }}
            >
              {body.length} / {MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary self-start" disabled={!canSend}>
          <Send size={16} /> Envoyer à l'équipe
        </button>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-base font-bold">Messages envoyés</h2>
        {history.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={24} />}
            title="Vous n'avez pas encore envoyé de message à l'équipe"
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((m) => {
              const child = getChild(m.childId);
              return (
                <li key={m.id} className="card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">Pour {child?.firstName ?? "—"}</span>
                    <MessageStatusBadge status={m.status} />
                    <span className="ml-auto text-xs text-ink-soft">
                      {humanDate(toISODate(new Date(m.createdAt)))} à {timeOf(m.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-ink">{m.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
