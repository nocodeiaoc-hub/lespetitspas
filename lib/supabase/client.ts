import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour le navigateur (Client Components).
 * À réserver aux opérations couvertes par la RLS ; les opérations sensibles
 * passent par une Server Action ou un route handler (voir AGENTS.md).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
