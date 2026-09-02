import { test, expect } from "@playwright/test";
import { login } from "./helpers";

// Scénario 6 — Envoi d'un message parent → l'équipe le retrouve
test("parent1 envoie un message pour Ana Maria, le staff le retrouve dans /staff/messages", async ({
  browser,
}) => {
  const marker = `E2E message ${Date.now()}`;

  // 1. Parent1 envoie le message.
  const parentContext = await browser.newContext();
  const parentPage = await parentContext.newPage();
  await login(parentPage, "parent1");

  await parentPage.goto("/parent/messages/new");
  await parentPage
    .getByRole("group", { name: "Enfant concerné" })
    .getByText("Ana Maria Costa")
    .click();
  await parentPage.getByLabel("Votre message").fill(marker);
  await parentPage.getByRole("button", { name: /Envoyer à l'équipe/ }).click();

  await parentPage.waitForURL("**/parent/messages**");
  await expect(parentPage.getByText("Message envoyé à l'équipe.")).toBeVisible();
  await expect(parentPage.getByText(marker)).toBeVisible();
  await parentContext.close();

  // 2. Le staff le voit dans la messagerie.
  const staffContext = await browser.newContext();
  const staffPage = await staffContext.newPage();
  await login(staffPage, "staff");

  await staffPage.goto("/staff/messages");
  await expect(staffPage.getByText(marker)).toBeVisible();
  await staffContext.close();
});
