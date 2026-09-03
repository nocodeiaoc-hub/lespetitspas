"use client";

import { useActionState, useState } from "react";
import type { EventType } from "@/lib/types";
import { EVENT_LABELS } from "@/lib/events";
import { EventBadge } from "@/components/event-badge";
import { SegmentedField } from "@/components/segmented-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addEvent, type AddEventState } from "./actions";

const TYPES: EventType[] = [
  "repas",
  "sieste",
  "activite",
  "medicament",
  "incident",
];
const INITIAL: AddEventState = { error: null };

export function EventForm({
  childId,
  childName,
  medicationAllowed,
}: {
  childId: string;
  childName: string;
  medicationAllowed: boolean;
}) {
  const [type, setType] = useState<EventType | null>(null);
  const [consent, setConsent] = useState(false);
  const [state, formAction, pending] = useActionState(
    addEvent.bind(null, childId),
    INITIAL,
  );

  const medBlocked = type === "medicament" && !medicationAllowed;
  const canSubmit =
    Boolean(type) &&
    !pending &&
    !medBlocked &&
    (type !== "medicament" || consent);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="type" value={type ?? ""} />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {TYPES.map((t) => {
          const active = type === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setConsent(false);
              }}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
                active
                  ? "border-primary bg-primary-soft text-ink"
                  : "border-line bg-surface text-ink-soft hover:border-primary/40"
              }`}
            >
              <EventBadge type={t} className="size-8" />
              {EVENT_LABELS[t]}
            </button>
          );
        })}
      </div>

      {type && (
        <div className="flex flex-col gap-4 rounded-lg bg-surface p-4 shadow-soft">
          {type === "repas" && (
            <>
              <SegmentedField
                name="meal_moment"
                legend="Moment"
                required
                options={[
                  { value: "matin", label: "Matin" },
                  { value: "midi", label: "Midi" },
                  { value: "gouter", label: "Goûter" },
                ]}
              />
              <SegmentedField
                name="meal_quality"
                legend="A mangé"
                required
                options={[
                  { value: "tout", label: "Tout" },
                  { value: "moitie", label: "La moitié" },
                  { value: "peu", label: "Peu" },
                  { value: "rien", label: "Rien" },
                ]}
              />
            </>
          )}

          {type === "sieste" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="nap_start">Début</Label>
                  <Input
                    id="nap_start"
                    name="nap_start"
                    type="time"
                    required
                    className="h-11"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="nap_end">Fin</Label>
                  <Input
                    id="nap_end"
                    name="nap_end"
                    type="time"
                    required
                    className="h-11"
                  />
                </div>
              </div>
              <SegmentedField
                name="nap_quality"
                legend="Qualité"
                required
                options={[
                  { value: "calme", label: "Calme" },
                  { value: "agitee", label: "Agitée" },
                  { value: "reveil_precoce", label: "Réveil précoce" },
                ]}
              />
            </>
          )}

          {type === "activite" && (
            <div className="grid gap-1.5">
              <Label htmlFor="activity_name">Nom de l&apos;activité</Label>
              <Input
                id="activity_name"
                name="activity_name"
                required
                placeholder="Peinture, comptines, parcours moteur…"
                className="h-11"
              />
            </div>
          )}

          {type === "incident" && (
            <>
              <SegmentedField
                name="incident_kind"
                legend="Type"
                required
                options={[
                  { value: "chute", label: "Chute" },
                  { value: "morsure", label: "Morsure" },
                  { value: "fievre", label: "Fièvre" },
                  { value: "autre", label: "Autre" },
                ]}
              />
              <SegmentedField
                name="incident_severity"
                legend="Gravité"
                required
                options={[
                  { value: "leger", label: "Léger" },
                  { value: "modere", label: "Modéré" },
                  { value: "urgent", label: "Urgent" },
                ]}
              />
            </>
          )}

          {type === "medicament" &&
            (medBlocked ? (
              <p
                role="alert"
                className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger-strong"
              >
                {childName} n&apos;a pas d&apos;autorisation parentale de
                médicament. La saisie est impossible — rapprochez-vous de la
                direction.
              </p>
            ) : (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="med_name">Nom du médicament</Label>
                  <Input
                    id="med_name"
                    name="med_name"
                    required
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="med_dose">Dose</Label>
                    <Input
                      id="med_dose"
                      name="med_dose"
                      required
                      placeholder="5 ml"
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="med_time">Heure</Label>
                    <Input
                      id="med_time"
                      name="med_time"
                      type="time"
                      required
                      className="h-11"
                    />
                  </div>
                </div>
                <label className="flex items-start gap-2.5 rounded-lg bg-primary-soft p-3">
                  <Checkbox
                    name="consent"
                    checked={consent}
                    onCheckedChange={(v) => setConsent(v === true)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-ink">
                    Autorisation parentale confirmée{" "}
                    <span className="text-danger-strong">*</span>
                    <span className="block text-xs text-ink-soft">
                      Obligatoire : sans cette confirmation, l&apos;enregistrement
                      est bloqué.
                    </span>
                  </span>
                </label>
              </>
            ))}

          {!medBlocked && (
            <div className="grid gap-1.5">
              <Label htmlFor="note">Note (facultatif)</Label>
              <Textarea
                id="note"
                name="note"
                rows={2}
                placeholder="Précision utile pour les parents ou l'équipe…"
              />
            </div>
          )}

          {state.error && (
            <p
              role="alert"
              className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger-strong"
            >
              {state.error}
            </p>
          )}

          {type === "medicament" && !medBlocked && !consent && (
            <p className="text-xs text-ink-soft">
              Cochez l&apos;autorisation parentale pour activer
              l&apos;enregistrement.
            </p>
          )}

          <Button
            type="submit"
            size="xl"
            disabled={!canSubmit}
            className="w-full sm:w-auto"
          >
            {pending ? "Enregistrement…" : "Enregistrer l'événement"}
          </Button>
        </div>
      )}
    </form>
  );
}
