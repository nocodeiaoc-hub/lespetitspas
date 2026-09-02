import "server-only";
import { Resend } from "resend";

export function resendFrom(): string {
  return process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
}

export function resendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

/**
 * En dev sans domaine Resend vérifié : `RESEND_TEST_RECIPIENT` redirige TOUS les
 * envois vers une seule adresse (celle du compte Resend). Laisser vide en prod.
 */
export function resolveRecipients(intended: string | string[]): {
  to: string[];
  redirectedFrom: string[] | null;
} {
  const list = (Array.isArray(intended) ? intended : [intended]).filter(Boolean);
  const override = process.env.RESEND_TEST_RECIPIENT?.trim();
  return override
    ? { to: [override], redirectedFrom: list }
    : { to: list, redirectedFrom: null };
}

/** Bandeau ajouté en tête du corps quand l'envoi a été redirigé (mode test). */
export function testRedirectBanner(redirectedFrom: string[] | null): string {
  if (!redirectedFrom || redirectedFrom.length === 0) return "";
  return `<div style="background:#fff2df;color:#b9781f;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;padding:10px 14px;border-radius:8px;margin:0 0 16px;">
    Mode test — en production, cet email serait envoyé à : ${redirectedFrom.join(", ")}
  </div>`;
}
