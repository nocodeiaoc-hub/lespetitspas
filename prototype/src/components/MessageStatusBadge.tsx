import type { MessageStatus } from "../data/types";

const STYLES: Record<MessageStatus, { bg: string; fg: string }> = {
  nouveau: { bg: "#fde6ee", fg: "#c65f89" },
  lu: { bg: "#eceff3", fg: "#63748a" },
  traité: { bg: "#e0f2f0", fg: "#2f8f85" },
};

export function MessageStatusBadge({ status }: { status: MessageStatus }) {
  const s = STYLES[status];
  return (
    <span
      className="chip"
      style={{ background: s.bg, color: s.fg, textTransform: "capitalize" }}
    >
      {status}
    </span>
  );
}
