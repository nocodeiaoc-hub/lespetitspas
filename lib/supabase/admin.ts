import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé `service_role` — contourne la RLS.
 * À N'UTILISER QUE dans une Server Action / route handler, pour des opérations
 * d'administration (génération de liens d'invitation). Jamais côté client,
 * jamais pour des lectures qui devraient passer par les policies.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquante : renseignez-la dans .env.local (serveur uniquement).",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
