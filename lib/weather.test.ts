/** Tests de la logique météo (US-28 / US-29), sans réseau. */
import { describe, it, expect } from "vitest";
import { clothingAdvice, describeWeather, weatherKind } from "./weather";

describe("weatherKind", () => {
  it("classe les codes WMO", () => {
    expect(weatherKind(0)).toBe("clear");
    expect(weatherKind(3)).toBe("cloud");
    expect(weatherKind(45)).toBe("fog");
    expect(weatherKind(63)).toBe("rain");
    expect(weatherKind(75)).toBe("snow");
    expect(weatherKind(95)).toBe("storm");
  });
});

describe("clothingAdvice", () => {
  it("grand froid + neige → moufles et bottes fourrées", () => {
    const a = clothingAdvice(-2, 71);
    expect(a).toMatch(/moufles/i);
    expect(a).toMatch(/fourr/i);
  });

  it("forte chaleur + ciel dégagé → crème solaire et casquette", () => {
    const a = clothingAdvice(30, 0);
    expect(a).toMatch(/crème solaire/i);
    expect(a).toMatch(/casquette/i);
  });

  it("temps doux + pluie → gilet et imperméable", () => {
    const a = clothingAdvice(18, 61);
    expect(a).toMatch(/gilet/i);
    expect(a).toMatch(/imperméable/i);
  });
});

describe("describeWeather", () => {
  it("renvoie un libellé français, avec repli", () => {
    expect(describeWeather(0)).toBe("Ciel dégagé");
    expect(describeWeather(1234)).toBe("Temps variable");
  });
});
