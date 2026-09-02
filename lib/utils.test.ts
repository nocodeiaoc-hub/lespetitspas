import { describe, it, expect } from "vitest";
import {
  ageLabel,
  avatarColor,
  foldAccents,
  initials,
  napDurationLabel,
  napDurationMinutes,
} from "./utils";

describe("napDurationMinutes / napDurationLabel (US-30)", () => {
  it("calcule une durée simple", () => {
    expect(napDurationMinutes("13:00", "14:30")).toBe(90);
    expect(napDurationLabel("13:00", "14:30")).toBe("1 h 30");
  });

  it("gère les durées en minutes seules", () => {
    expect(napDurationLabel("13:00", "13:45")).toBe("45 min");
  });

  it("gère les heures pleines", () => {
    expect(napDurationLabel("13:00", "15:00")).toBe("2 h");
  });

  it("gère défensivement le passage de minuit", () => {
    expect(napDurationMinutes("23:30", "00:15")).toBe(45);
  });
});

describe("foldAccents", () => {
  it("retire accents et casse pour la recherche", () => {
    expect(foldAccents("Anaïs")).toBe("anais");
    expect(foldAccents("  Élodie  ")).toBe("elodie");
  });
  it("« Ana » est bien un préfixe de « Ana Maria »", () => {
    expect(foldAccents("Ana Maria").includes(foldAccents("Ana"))).toBe(true);
  });
});

describe("initials", () => {
  it("prend la première lettre du prénom et du nom", () => {
    expect(initials("Ana Maria", "Costa")).toBe("AC");
    expect(initials("ilyès", "benali")).toBe("IB");
  });
});

describe("avatarColor", () => {
  it("est déterministe et renvoie une couleur de la palette", () => {
    const a = avatarColor("child-42");
    expect(a).toBe(avatarColor("child-42"));
    expect(a).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("ageLabel", () => {
  it("exprime en mois avant 2 ans", () => {
    const now = new Date();
    const b = new Date(now.getFullYear(), now.getMonth() - 10, 1);
    expect(ageLabel(b.toISOString().slice(0, 10))).toMatch(/^\d+ mois$/);
  });
  it("exprime en années au-delà de 2 ans", () => {
    const now = new Date();
    const b = new Date(now.getFullYear() - 3, now.getMonth(), 1);
    expect(ageLabel(b.toISOString().slice(0, 10))).toMatch(/^3 ans/);
  });
});
