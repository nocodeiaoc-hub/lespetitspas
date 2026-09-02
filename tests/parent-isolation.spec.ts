import { test, expect } from "@playwright/test";
import { login } from "./helpers";

// Scénario 5 — Isolation : parent1 ne peut pas ouvrir la fiche d'Ilyès (enfant de parent2)
test("parent1 est redirigé vers /parent en tapant l'URL de la fiche d'Ilyès", async ({
  browser,
}) => {
  // 1. Contexte staff : récupérer l'id d'Ilyès depuis la liste des enfants.
  const staffContext = await browser.newContext();
  const staffPage = await staffContext.newPage();
  await login(staffPage, "staff");
  await staffPage.goto("/staff");
  const ilyesLink = staffPage.getByRole("link", { name: /Ilyès/ });
  await expect(ilyesLink).toBeVisible();
  const href = await ilyesLink.getAttribute("href");
  expect(href).toMatch(/\/staff\/children\/[0-9a-f-]{36}$/);
  const ilyesId = href!.split("/").pop()!;
  await staffContext.close();

  // 2. Contexte parent1 : tenter d'accéder à la fiche d'Ilyès.
  const parentContext = await browser.newContext();
  const parentPage = await parentContext.newPage();
  await login(parentPage, "parent1");

  await parentPage.goto(`/parent/children/${ilyesId}`);

  // Redirection vers /parent, aucune donnée d'Ilyès affichée.
  await parentPage.waitForURL("**/parent");
  await expect(parentPage).toHaveURL(/\/parent$/);
  await expect(parentPage.getByText("Ilyès")).toHaveCount(0);
  await expect(parentPage.getByText("Benali")).toHaveCount(0);

  // Même chose avec un paramètre de date.
  await parentPage.goto(`/parent/children/${ilyesId}?date=2026-09-01`);
  await parentPage.waitForURL("**/parent");
  await expect(parentPage).toHaveURL(/\/parent$/);

  await parentContext.close();
});
