import { test, expect } from "@playwright/test";
import { login, openStaffChild } from "./helpers";

test.describe("Espace équipe — saisie d'événements", () => {
  // Scénario 2 — Création d'un événement repas
  test("le staff crée un repas pour Ana Maria et le retrouve dans la timeline", async ({
    page,
  }) => {
    await login(page, "staff");
    await openStaffChild(page, "Ana Maria");

    const note = `E2E repas ${Date.now()}`;

    await page.getByRole("link", { name: "Ajouter un événement" }).click();
    await page.waitForURL("**/nouvel-evenement");

    await page.getByRole("button", { name: "Repas" }).click();
    await page.getByRole("group", { name: "Moment" }).getByText("Midi").click();
    await page.getByRole("group", { name: "A mangé" }).getByText("Tout").click();
    await page.getByLabel("Note (facultatif)").fill(note);

    await page.getByRole("button", { name: /Enregistrer l'événement/ }).click();

    // Retour sur la fiche : l'événement apparaît dans la timeline.
    await page.waitForURL("**/staff/children/**");
    await expect(page.getByText(note)).toBeVisible();
    await expect(
      page.getByRole("listitem").filter({ hasText: "Repas" }).first(),
    ).toBeVisible();
  });

  // Scénario 3 — Blocage médicament (enfant sans autorisation : Sarah)
  test("le bouton de validation reste désactivé pour un médicament sans autorisation", async ({
    page,
  }) => {
    await login(page, "staff");
    await openStaffChild(page, "Sarah");

    await page.getByRole("link", { name: "Ajouter un événement" }).click();
    await page.waitForURL("**/nouvel-evenement");

    await page.getByRole("button", { name: "Médicament" }).click();

    // Bandeau explicite + bouton désactivé, aucun champ de saisie.
    await expect(
      page.getByText(/n'a pas d'autorisation parentale de médicament/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Enregistrer l'événement/ }),
    ).toBeDisabled();
    await expect(page.getByLabel("Nom du médicament")).toHaveCount(0);
  });
});
