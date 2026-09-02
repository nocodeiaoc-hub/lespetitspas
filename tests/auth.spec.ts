import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Authentification & redirection par rôle", () => {
  // Scénario 1 — Login staff
  test("le staff se connecte et arrive sur /staff avec la liste des enfants", async ({
    page,
  }) => {
    await login(page, "staff");

    await expect(page).toHaveURL(/\/staff$/);
    await expect(page.getByRole("heading", { name: "Enfants" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Ana Maria/ }),
    ).toBeVisible();
  });

  // Scénario 4 — Login parent1 : ne voit que ses enfants
  test("parent1 se connecte et voit uniquement Ana Maria et Sarah", async ({
    page,
  }) => {
    await login(page, "parent1");

    await expect(page).toHaveURL(/\/parent$/);
    await expect(page.getByRole("link", { name: /Ana Maria/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Sarah/ })).toBeVisible();
    // Ilyès (enfant de parent2) ne doit jamais apparaître.
    await expect(page.getByRole("link", { name: /Ilyès/ })).toHaveCount(0);
  });
});
