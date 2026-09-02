import "server-only";
import { Resend } from "resend";

type InvitationParams = {
  to: string;
  childFirstName: string;
  actionLink: string;
};

/** Objet de l'email d'invitation (US-25). */
export function invitationSubject(childFirstName: string): string {
  return `Vous êtes invité à suivre la journée de ${childFirstName} sur Les Petits Pas`;
}

/** Corps HTML de l'email, styles inline (contrainte des clients mail). */
export function invitationHtml({
  childFirstName,
  actionLink,
}: Omit<InvitationParams, "to">): string {
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#f0f4f8;font-family:'DM Sans',Arial,sans-serif;color:#1a237e;">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
      <div style="text-align:center;font-size:28px;">👣</div>
      <h1 style="font-size:20px;text-align:center;margin:8px 0 24px;color:#1a237e;">
        Les Petits Pas
      </h1>
      <div style="background:#ffffff;border-radius:16px;padding:24px;box-shadow:0 8px 24px rgba(26,35,126,0.08);">
        <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
          Bonjour,
        </p>
        <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
          La crèche <strong>Les Petits Pas</strong> vous invite à suivre la journée de
          <strong>${childFirstName}</strong> sur son application.
        </p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">
          Vous pourrez y consulter chaque jour ses repas, ses siestes, ses activités et
          les éventuels incidents, et envoyer un message à l'équipe en quelques secondes.
        </p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${actionLink}"
             style="display:inline-block;background:#9fa8da;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:999px;font-size:15px;">
            Créer mon mot de passe
          </a>
        </p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#78909c;">
          Ce lien est personnel et à usage unique. S'il a expiré, demandez à l'équipe
          de vous en renvoyer un.
        </p>
      </div>
      <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#78909c;text-align:center;">
        Vos données sont stockées de façon sécurisée et ne sont jamais partagées.
      </p>
    </div>
  </body>
</html>`;
}

/**
 * Envoie l'email d'invitation via Resend.
 * Retour non bloquant : une erreur (dont le 403 « adresse non autorisée » du mode
 * test Resend) est renvoyée proprement plutôt que levée.
 */
export async function sendParentInvitationEmail({
  to,
  childFirstName,
  actionLink,
}: InvitationParams): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY manquante dans .env.local." };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: invitationSubject(childFirstName),
    html: invitationHtml({ childFirstName, actionLink }),
  });

  if (error) {
    console.error("Resend invitation email failed", error);
    const msg = `${error.message ?? ""}`.toLowerCase();
    return {
      ok: false,
      error:
        msg.includes("testing emails") || msg.includes("own email")
          ? "Resend a refusé l'envoi : en mode test (onboarding@resend.dev), seule l'adresse du compte Resend et ses alias + sont acceptés."
          : "L'email n'a pas pu être envoyé pour le moment.",
    };
  }

  return { ok: true };
}
