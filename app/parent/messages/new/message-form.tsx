"use client";

import { useActionState, useState } from "react";
import { Send } from "lucide-react";
import { SegmentedField } from "@/components/segmented-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage, type SendMessageState } from "../actions";

const MAX = 500;
const INITIAL: SendMessageState = { error: null };

type ChildOption = { id: string; first_name: string; last_name: string };

export function MessageForm({
  childOptions,
}: {
  childOptions: ChildOption[];
}) {
  const [state, formAction, pending] = useActionState(sendMessage, INITIAL);
  const [childId, setChildId] = useState(
    childOptions.length === 1 ? childOptions[0].id : "",
  );
  const [len, setLen] = useState(0);

  const tooLong = len > MAX;
  const canSubmit = !pending && childId !== "" && len > 0 && !tooLong;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {childOptions.length === 1 ? (
        <>
          <input type="hidden" name="child_id" value={childOptions[0].id} />
          <p className="text-sm text-ink-soft">
            Message concernant{" "}
            <span className="font-medium text-ink">
              {childOptions[0].first_name} {childOptions[0].last_name}
            </span>
          </p>
        </>
      ) : (
        <SegmentedField
          name="child_id"
          legend="Enfant concerné"
          required
          onChange={setChildId}
          options={childOptions.map((c) => ({
            value: c.id,
            label: `${c.first_name} ${c.last_name}`,
          }))}
        />
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="body">Votre message</Label>
        <Textarea
          id="body"
          name="body"
          rows={5}
          maxLength={MAX + 100}
          required
          onChange={(e) => setLen(e.target.value.trim().length)}
          placeholder="Bonjour, Sarah a mal dormi cette nuit…"
        />
        <p
          className={`text-right text-xs ${
            tooLong ? "font-semibold text-danger-strong" : "text-ink-soft"
          }`}
        >
          {len}/{MAX} caractères
        </p>
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger-strong"
        >
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        size="xl"
        disabled={!canSubmit}
        className="w-full sm:w-auto"
      >
        <Send />
        {pending ? "Envoi…" : "Envoyer à l'équipe"}
      </Button>
    </form>
  );
}
