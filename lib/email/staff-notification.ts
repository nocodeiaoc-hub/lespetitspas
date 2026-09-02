import "server-only";
import {
  resendClient,
  resendFrom,
  resolveRecipients,
  testRedirectBanner,
} from "./shared";

type NotificationParams = {
  to: string[];
  parentFirstName: string;
  childFirstName: string;
};

export function notificationSubject(
  parentFirstName: string,
  childFirstName: string,
): string {
  return `Nouveau message de ${parentFirstName} pour ${childFirstName}`;
}

/**
 * Corps HTML de la notification. RGPD : AUCUN contenu du message, aucune donnée
 * de santé. L'email dit seulement « il y a un message », le reste est dans l'app.
 */
export function notificationHtml({
  parentFirstName,
  childFirstName,
  bannerHtml = "",
}: Omit<NotificationParams, "to"> & { bannerHtml?: string }): string {
  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/staff/messages`;
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#f0f4f8;font-family:'DM Sans',Arial,sans-serif;color:#1a237e;">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
      ${bannerHtml}
      <div style="text-align:center;font-size:28px;">👣</div>
      <h1 style="font-size:20px;text-align:center;margin:8px 0 24px;color:#1a237e;">
        Les Petits Pas
      </h1>
      <div style="background:#ffffff;border-radius:16px;padding:24px;box-shadow:0 8px 24px rgba(26,35,126,0.08);">
        <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
          <strong>${parentFirstName}</strong> vient d'envoyer un message à l'équipe
          au sujet de <strong>${childFirstName}</strong>.
        </p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">
          Le contenu du message n'est consultable que dans l'application.
        </p>
        <p style="text-align:center;margin:24px 0 0;">
          <a href="${link}"
             style="display:inline-block;background:#9fa8da;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:999px;font-size:15px;">
            Ouvrir la messagerie
          </a>
        </p>
      </div>
      <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#78909c;text-align:center;">
        Cet email ne contient volontairement aucune information sensible.
      </p>
    </div>
  </body>
</html>`;
}

/**
 * Notifie tous les membres de l'équipe qu'un parent a écrit.
 * Non bloquant : toute erreur est journalisée et renvoyée, jamais levée.
 */
export async function sendStaffMessageNotification({
  to,
  parentFirstName,
  childFirstName,
}: NotificationParams): Promise<{ ok: boolean; error?: string }> {
  const resend = resendClient();
  if (!resend) return { ok: false, error: "RESEND_API_KEY manquante." };
  if (to.length === 0) return { ok: false, error: "Aucun destinataire staff." };

  const { to: recipients, redirectedFrom } = resolveRecipients(to);
  const { error } = await resend.emails.send({
    from: resendFrom(),
    to: recipients,
    subject: notificationSubject(parentFirstName, childFirstName),
    html: notificationHtml({
      parentFirstName,
      childFirstName,
      bannerHtml: testRedirectBanner(redirectedFrom),
    }),
  });

  if (error) {
    console.error("Resend staff notification failed", error);
    return { ok: false, error: `${error.message ?? "envoi refusé"}` };
  }
  return { ok: true };
}
