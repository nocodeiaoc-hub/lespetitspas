import { describe, it, expect } from "vitest";
import {
  MEDICATION_CONSENT_REQUIRED,
  MEDICATION_NO_AUTHORISATION,
  checkMedicationAllowed,
  eventSummary,
} from "./events";
import type { DayEvent } from "./types";

describe("checkMedicationAllowed (règle de sécurité US-15)", () => {
  it("refuse si l'enfant n'a pas l'autorisation en fiche, même avec la case cochée", () => {
    const r = checkMedicationAllowed({
      medicationAllowed: false,
      parentalConsentConfirmed: true,
    });
    expect(r.allowed).toBe(false);
    expect(r).toEqual({ allowed: false, reason: MEDICATION_NO_AUTHORISATION });
  });

  it("refuse si l'autorisation existe mais la case n'est pas cochée", () => {
    const r = checkMedicationAllowed({
      medicationAllowed: true,
      parentalConsentConfirmed: false,
    });
    expect(r).toEqual({ allowed: false, reason: MEDICATION_CONSENT_REQUIRED });
  });

  it("refuse si rien n'est autorisé", () => {
    expect(
      checkMedicationAllowed({
        medicationAllowed: false,
        parentalConsentConfirmed: false,
      }).allowed,
    ).toBe(false);
  });

  it("autorise seulement si autorisation ET case cochée", () => {
    expect(
      checkMedicationAllowed({
        medicationAllowed: true,
        parentalConsentConfirmed: true,
      }),
    ).toEqual({ allowed: true });
  });
});

describe("eventSummary", () => {
  const base = {
    id: "1",
    child_id: "c",
    author_id: "a",
    note: null,
    created_at: "2026-09-02T08:00:00Z",
    meal_moment: null,
    meal_quality: null,
    nap_start: null,
    nap_end: null,
    nap_quality: null,
    activity_name: null,
    med_name: null,
    med_dose: null,
    med_time: null,
    incident_kind: null,
    incident_severity: null,
  } satisfies Omit<DayEvent, "type">;

  it("résume un repas", () => {
    const e: DayEvent = {
      ...base,
      type: "repas",
      meal_moment: "midi",
      meal_quality: "tout",
    };
    expect(eventSummary(e)).toBe("Repas du midi — a tout mangé");
  });

  it("résume une sieste avec la durée", () => {
    const e: DayEvent = {
      ...base,
      type: "sieste",
      nap_start: "13:00:00",
      nap_end: "14:30:00",
      nap_quality: "calme",
    };
    expect(eventSummary(e)).toBe("Sieste 13:00–14:30 (1 h 30) — calme");
  });

  it("résume un médicament", () => {
    const e: DayEvent = {
      ...base,
      type: "medicament",
      med_name: "Doliprane",
      med_dose: "5 ml",
      med_time: "10:15:00",
    };
    expect(eventSummary(e)).toBe("Médicament — Doliprane 5 ml à 10:15");
  });

  it("résume un incident", () => {
    const e: DayEvent = {
      ...base,
      type: "incident",
      incident_kind: "chute",
      incident_severity: "leger",
    };
    expect(eventSummary(e)).toBe("Incident — Chute (gravité léger)");
  });
});
