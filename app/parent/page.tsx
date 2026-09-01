import { getProfile } from "@/lib/auth";

export default async function ParentHomePage() {
  const profile = await getProfile();

  return (
    <div className="rounded-lg bg-surface p-6 shadow-soft">
      <h2 className="text-lg">Bonjour {profile?.first_name || ""} 👋</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Vous êtes connecté·e à l&apos;espace parent. La journée de votre enfant et
        la messagerie arriveront avec la Phase 6 (US-19).
      </p>
    </div>
  );
}
