import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import type {
  Child,
  DayEvent,
  EventType,
  IncidentKind,
  IncidentSeverity,
  MealMoment,
  MealQuality,
  NapQuality,
} from "../data/types";
import { checkMedicationAllowed, napDurationLabel } from "../lib/format";
import { SegmentedField } from "./SegmentedField";

const TYPES: readonly EventType[] = ["repas", "sieste", "activité", "médicament", "incident"];
const MEAL_MOMENTS: readonly MealMoment[] = ["matin", "midi", "goûter"];
const MEAL_QUALITIES: readonly MealQuality[] = ["tout", "moitié", "peu", "rien"];
const NAP_QUALITIES: readonly NapQuality[] = ["calme", "agitée", "réveil précoce"];
const INCIDENT_KINDS: readonly IncidentKind[] = ["chute", "morsure", "fièvre", "autre"];
const INCIDENT_SEVERITIES: readonly IncidentSeverity[] = ["léger", "modéré", "urgent"];

interface Props {
  child: Child;
  authorId: string;
  onSubmit: (event: DayEvent) => void;
  onCancel: () => void;
}

export function EventForm({ child, authorId, onSubmit, onCancel }: Props) {
  const [type, setType] = useState<EventType>("repas");

  // champs par type
  const [mealMoment, setMealMoment] = useState<MealMoment>("midi");
  const [mealQuality, setMealQuality] = useState<MealQuality>("tout");
  const [napStart, setNapStart] = useState("13:00");
  const [napEnd, setNapEnd] = useState("14:30");
  const [napQuality, setNapQuality] = useState<NapQuality>("calme");
  const [activityName, setActivityName] = useState("");
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medTime, setMedTime] = useState("13:00");
  const [consent, setConsent] = useState(false);
  const [incidentKind, setIncidentKind] = useState<IncidentKind>("chute");
  const [incidentSeverity, setIncidentSeverity] = useState<IncidentSeverity>("léger");
  const [note, setNote] = useState("");

  const medGuard = checkMedicationAllowed({ child, parentalConsentConfirmed: consent });

  const missingActivity = type === "activité" && activityName.trim() === "";
  const missingMed = type === "médicament" && (medName.trim() === "" || medDose.trim() === "");
  const canSubmit =
    !missingActivity &&
    !missingMed &&
    (type !== "médicament" || medGuard.allowed);

  const submit = () => {
    const base = {
      id: `e-${Date.now()}`,
      childId: child.id,
      authorId,
      createdAt: new Date().toISOString(),
      note: note.trim() || undefined,
    };
    let event: DayEvent;
    switch (type) {
      case "repas":
        event = { ...base, type, moment: mealMoment, quality: mealQuality };
        break;
      case "sieste":
        event = { ...base, type, start: napStart, end: napEnd, quality: napQuality };
        break;
      case "activité":
        event = { ...base, type, name: activityName.trim() };
        break;
      case "médicament":
        event = {
          ...base,
          type,
          name: medName.trim(),
          dose: medDose.trim(),
          time: medTime,
          parentalConsentConfirmed: consent,
        };
        break;
      case "incident":
        event = { ...base, type, kind: incidentKind, severity: incidentSeverity };
        break;
      default: {
        const _exhaustive: never = type;
        throw new Error(`Type inconnu: ${_exhaustive}`);
      }
    }
    onSubmit(event);
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) submit();
      }}
    >
      <div>
        <label className="field-label" htmlFor="event-type">
          Type d'événement
        </label>
        <select
          id="event-type"
          className="field-input"
          value={type}
          onChange={(e) => setType(e.target.value as EventType)}
        >
          {TYPES.map((t) => (
            <option key={t} value={t} style={{ textTransform: "capitalize" }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {type === "repas" && (
        <>
          <SegmentedField label="Moment" options={MEAL_MOMENTS} value={mealMoment} onChange={setMealMoment} />
          <SegmentedField label="Quantité mangée" options={MEAL_QUALITIES} value={mealQuality} onChange={setMealQuality} />
        </>
      )}

      {type === "sieste" && (
        <>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="field-label" htmlFor="nap-start">Début</label>
              <input id="nap-start" type="time" className="field-input" value={napStart} onChange={(e) => setNapStart(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="field-label" htmlFor="nap-end">Fin</label>
              <input id="nap-end" type="time" className="field-input" value={napEnd} onChange={(e) => setNapEnd(e.target.value)} />
            </div>
          </div>
          <p className="text-sm text-ink-soft">
            Durée : <span className="font-semibold text-ink">{napDurationLabel(napStart, napEnd)}</span>
          </p>
          <SegmentedField label="Qualité" options={NAP_QUALITIES} value={napQuality} onChange={setNapQuality} />
        </>
      )}

      {type === "activité" && (
        <div>
          <label className="field-label" htmlFor="activity-name">Nom de l'activité</label>
          <input
            id="activity-name"
            className="field-input"
            placeholder="Peinture, sortie au parc, éveil musical…"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
          />
        </div>
      )}

      {type === "médicament" && (
        <>
          {!child.medicationAllowed && (
            <div
              className="flex gap-2 rounded-xl p-3 text-sm"
              style={{ background: "var(--color-danger-soft)", color: "var(--color-danger-strong)" }}
              role="alert"
            >
              <TriangleAlert size={18} className="mt-0.5 shrink-0" />
              <span>
                <strong>{child.firstName}</strong> n'a pas d'autorisation de médicament
                dans sa fiche. La saisie est bloquée. Rapprochez-vous des parents et de la
                direction pour mettre la fiche à jour.
              </span>
            </div>
          )}
          <div>
            <label className="field-label" htmlFor="med-name">Nom du médicament</label>
            <input id="med-name" className="field-input" value={medName} onChange={(e) => setMedName(e.target.value)} disabled={!child.medicationAllowed} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="field-label" htmlFor="med-dose">Dose</label>
              <input id="med-dose" className="field-input" placeholder="ex. 2,5 mL" value={medDose} onChange={(e) => setMedDose(e.target.value)} disabled={!child.medicationAllowed} />
            </div>
            <div className="flex-1">
              <label className="field-label" htmlFor="med-time">Heure</label>
              <input id="med-time" type="time" className="field-input" value={medTime} onChange={(e) => setMedTime(e.target.value)} disabled={!child.medicationAllowed} />
            </div>
          </div>
          <label
            className="flex items-start gap-2.5 rounded-xl border border-line p-3 text-sm"
            style={{ opacity: child.medicationAllowed ? 1 : 0.5 }}
          >
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5"
              checked={consent}
              disabled={!child.medicationAllowed}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              <strong>Autorisation parentale confirmée</strong>
              <br />
              Je confirme avoir vérifié l'ordonnance et l'accord écrit des parents.
            </span>
          </label>
        </>
      )}

      {type === "incident" && (
        <>
          <SegmentedField label="Type d'incident" options={INCIDENT_KINDS} value={incidentKind} onChange={setIncidentKind} />
          <SegmentedField label="Gravité" options={INCIDENT_SEVERITIES} value={incidentSeverity} onChange={setIncidentSeverity} />
        </>
      )}

      <div>
        <label className="field-label" htmlFor="event-note">Note libre {type === "incident" ? "" : "(facultatif)"}</label>
        <textarea
          id="event-note"
          className="field-input"
          rows={2}
          style={{ resize: "vertical" }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {type === "médicament" && !medGuard.allowed && (
        <p className="text-sm font-medium" style={{ color: "var(--color-danger-strong)" }}>
          {medGuard.reason}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={!canSubmit}>
          Enregistrer
        </button>
      </div>
    </form>
  );
}
