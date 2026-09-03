import { describe, it, expect } from "vitest";
import {
  humanDay,
  isValidDate,
  parisDayRange,
  shiftDay,
  todayInParis,
} from "./date";

describe("isValidDate", () => {
  it("accepte YYYY-MM-DD, rejette le reste", () => {
    expect(isValidDate("2026-09-02")).toBe(true);
    expect(isValidDate("02/09/2026")).toBe(false);
    expect(isValidDate("2026-13-40")).toBe(false);
    expect(isValidDate("")).toBe(false);
  });
});

describe("shiftDay", () => {
  it("décale de N jours et gère les bornes de mois/année", () => {
    expect(shiftDay("2026-09-02", -1)).toBe("2026-09-01");
    expect(shiftDay("2026-09-30", 1)).toBe("2026-10-01");
    expect(shiftDay("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("parisDayRange", () => {
  it("borne une journée d'été (CEST, UTC+2) : 22:00 UTC → 22:00 UTC", () => {
    const r = parisDayRange("2026-07-15");
    expect(r.gte).toBe("2026-07-14T22:00:00.000Z");
    expect(r.lt).toBe("2026-07-15T22:00:00.000Z");
  });

  it("borne une journée d'hiver (CET, UTC+1) : 23:00 UTC → 23:00 UTC", () => {
    const r = parisDayRange("2026-01-15");
    expect(r.gte).toBe("2026-01-14T23:00:00.000Z");
    expect(r.lt).toBe("2026-01-15T23:00:00.000Z");
  });

  it("l'intervalle dure exactement 24 h", () => {
    const r = parisDayRange("2026-03-10");
    const ms = Date.parse(r.lt) - Date.parse(r.gte);
    expect(ms).toBe(24 * 60 * 60 * 1000);
  });
});

describe("todayInParis", () => {
  it("renvoie une date au format YYYY-MM-DD", () => {
    expect(todayInParis()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("humanDay", () => {
  it("« Aujourd'hui » pour la date du jour, « Hier » pour la veille", () => {
    const today = todayInParis();
    expect(humanDay(today)).toBe("Aujourd'hui");
    expect(humanDay(shiftDay(today, -1))).toBe("Hier");
  });
  it("un jour plus ancien est écrit en toutes lettres", () => {
    expect(humanDay("2026-03-03")).toMatch(/mars/);
  });
});
