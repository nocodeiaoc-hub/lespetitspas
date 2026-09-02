"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import {
  sendParentInvitation,
  type InviteState,
} from "@/app/staff/children/[id]/actions";
import { Button } from "@/components/ui/button";

const INITIAL: InviteState = { ok: false, message: null };

/** Bouton staff : (re)génère et envoie le lien d'invitation à un parent rattaché. */
export function InviteParentButton({
  childId,
  parentId,
}: {
  childId: string;
  parentId: string;
}) {
  const [state, formAction, pending] = useActionState(
    sendParentInvitation.bind(null, childId, parentId),
    INITIAL,
  );

  return (
    <span className="inline-flex flex-col gap-0.5">
      <form action={formAction}>
        <Button
          type="submit"
          variant="ghost"
          disabled={pending}
          className="h-8 gap-1 px-2 text-xs text-primary-strong hover:text-ink"
        >
          <Mail className="size-3" />
          {pending ? "Envoi…" : "Envoyer l'invitation"}
        </Button>
      </form>
      {state.message && (
        <span
          className={`text-xs ${
            state.ok ? "text-success-strong" : "text-danger-strong"
          }`}
        >
          {state.message}
        </span>
      )}
    </span>
  );
}
