import { describe, expect, it } from "vitest";
import {
  checkMedicationAllowed,
  napDurationLabel,
  napDurationMinutes,
} from "./format";

describe("napDurationMinutes", () => {
  it("calcule une duree simple", () => {
    expect(napDurationMinutes("13:00", "14:45")).toBe(105);
  });

  it("gere une sieste courte", () => {
    expect(napDurationMinutes("09:40", "11:10")).toBe(90);
  });

  it("gere defensivement un passage de minuit", () => {
    expect(napDurationMinutes("23:30", "00:15")).toBe(45);
  });

  it("formate en heures et minutes", () => {
    expect(napDurationLabel("13:00", "14:45")).toBe("1 h 45");
    expect(napDurationLabel("13:00", "14:00")).toBe("1 h");
    expect(napDurationLabel("13:00", "13:20")).toBe("20 min");
  });
});

describe("checkMedicationAllowed (double validation)", () => {
  it("refuse si l'enfant n'a pas d'autorisation, meme case cochee", () => {
    const r = checkMedicationAllowed({
      child: { medicationAllowed: false },
      parentalConsentConfirmed: true,
    });
    expect(r.allowed).toBe(false);
    expect(r.reason).toMatch(/403/);
  });

  it("refuse si la case n'est pas cochee", () => {
    const r = checkMedicationAllowed({
      child: { medicationAllowed: true },
      parentalConsentConfirmed: false,
    });
    expect(r.allowed).toBe(false);
    expect(r.reason).toMatch(/Autorisation parentale confirmée/);
  });

  it("autorise si l'enfant a l'autorisation et la case est cochee", () => {
    const r = checkMedicationAllowed({
      child: { medicationAllowed: true },
      parentalConsentConfirmed: true,
    });
    expect(r.allowed).toBe(true);
    expect(r.reason).toBeUndefined();
  });
});
