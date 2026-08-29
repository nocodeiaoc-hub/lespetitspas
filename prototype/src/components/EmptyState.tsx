import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "var(--color-primary-soft)", color: "var(--color-primary-strong)" }}
      >
        {icon ?? <Inbox size={26} />}
      </span>
      <h3 className="text-lg">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-ink-soft">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
