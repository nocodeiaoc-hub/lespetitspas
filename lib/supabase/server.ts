import { cookies } from "next/headers";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";

/**
 * Client Supabase pour le serveur (Server Components, Server Actions, route handlers).
 * Lit et rafraîchit la session via les cookies de la requête.
 *
 * Utilisation : `const supabase = await createServerClient();`
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Appelé depuis un Server Component : l'écriture de cookies y est
            // interdite. Sans effet si un proxy (middleware) rafraîchit la
            // session — à mettre en place en US-08.
          }
        },
      },
    },
  );
}
