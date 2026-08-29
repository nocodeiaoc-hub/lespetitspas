import { useEffect } from "react";
import { CircleCheck, CircleX, X } from "lucide-react";
import { useApp } from "../state/AppState";

export function Toast() {
  const { toast, dismissToast } = useApp();

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(dismissToast, 5000);
    return () => window.clearTimeout(id);
  }, [toast, dismissToast]);

  if (!toast) return null;
  const isError = toast.kind === "error";

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-md sm:bottom-6"
    >
      <div
        className="card flex items-start gap-3 px-4 py-3 text-sm"
        style={{
          border: `1px solid ${isError ? "var(--color-danger)" : "var(--color-secondary)"}`,
          boxShadow: "var(--shadow-lift)",
        }}
      >
        <span style={{ color: isError ? "var(--color-danger-strong)" : "var(--color-success)" }}>
          {isError ? <CircleX size={20} /> : <CircleCheck size={20} />}
        </span>
        <p className="flex-1 text-ink">{toast.text}</p>
        <button
          onClick={dismissToast}
          aria-label="Fermer"
          className="text-ink-soft hover:text-ink"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
