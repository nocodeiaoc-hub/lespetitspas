import { test, expect } from "@playwright/test";

/**
 * Test de fumée : valide la configuration (baseURL + webServer).
 * Les parcours critiques sont couverts par US-31 (équipe) et US-32 (isolation parent).
 */
test("la page de connexion se charge sur / (redirection) et /login", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Les Petits Pas" }),
  ).toBeVisible();
  await expect(page.getByLabel("Adresse email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
});
