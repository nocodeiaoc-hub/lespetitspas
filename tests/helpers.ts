import { type Page, expect } from "@playwright/test";

/** Récupère une variable d'env de test, avec un message clair si absente. */
function need(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Variable ${key} manquante : renseignez-la dans .env.local (valeurs dans JOURNAL.md).`,
    );
  }
  return value;
}

export const ACCOUNTS = {
  staff: {
    email: () => need("E2E_STAFF_EMAIL"),
    password: () => need("E2E_STAFF_PASSWORD"),
    space: "/staff" as const,
  },
  parent1: {
    email: () => need("E2E_PARENT1_EMAIL"),
    password: () => need("E2E_PARENT1_PASSWORD"),
    space: "/parent" as const,
  },
};

type Who = keyof typeof ACCOUNTS;

/**
 * Connexion via l'écran `/login` et attente de la redirection par rôle.
 * Sélecteurs basés sur les labels et rôles accessibles (pas de classes CSS).
 */
export async function login(page: Page, who: Who): Promise<void> {
  const account = ACCOUNTS[who];
  await page.goto("/login");
  await page.getByLabel("Adresse email").fill(account.email());
  await page.getByLabel("Mot de passe").fill(account.password());
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(`**${account.space}`);
}

/** Ouvre la fiche d'un enfant depuis la liste `/staff` et renvoie l'URL. */
export async function openStaffChild(page: Page, firstName: string): Promise<string> {
  await page.goto("/staff");
  const card = page.getByRole("link", { name: new RegExp(firstName) });
  await expect(card).toBeVisible();
  await card.click();
  await page.waitForURL("**/staff/children/**");
  return page.url();
}
