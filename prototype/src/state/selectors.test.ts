import { describe, expect, it } from "vitest";
import { CHILDREN, PARENTS, STAFF_MEMBERS } from "../data/mock";
import { isChildLinkedToParent, visibleChildren } from "./selectors";

describe("visibleChildren (isolation des roles)", () => {
  it("un membre de l'equipe voit tous les enfants", () => {
    expect(visibleChildren(STAFF_MEMBERS[0])).toHaveLength(CHILDREN.length);
  });

  it("un parent ne voit que ses enfants rattaches", () => {
    const lea = PARENTS.find((p) => p.id === "u-parent-1")!;
    const seen = visibleChildren(lea);
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((c) => c.familyProfileIds.includes(lea.id))).toBe(true);
  });

  it("un parent ne voit pas l'enfant d'un autre parent", () => {
    const thomas = PARENTS.find((p) => p.id === "u-parent-2")!;
    const gabriel = CHILDREN.find((c) => c.id === "c-1")!; // enfant de Lea
    expect(isChildLinkedToParent(gabriel, thomas)).toBe(false);
  });

  it("sans utilisateur, aucun enfant n'est visible", () => {
    expect(visibleChildren(null)).toHaveLength(0);
  });
});
