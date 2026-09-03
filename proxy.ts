import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// « proxy » = ex-« middleware » (renommé dans Next.js 16). Runtime Node.js.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf :
     * - _next/static, _next/image (assets build)
     * - favicon.ico + fichiers image
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
