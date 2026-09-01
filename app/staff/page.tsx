import { getProfile } from "@/lib/auth";

export default async function StaffHomePage() {
  const profile = await getProfile();

  return (
    <div className="rounded-lg bg-surface p-6 shadow-soft">
      <h2 className="text-lg">Bonjour {profile?.first_name || "l'équipe"} 👋</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Vous êtes connecté·e à l&apos;espace équipe. La liste des enfants et la
        timeline arriveront avec la Phase 5 (US-11).
      </p>
    </div>
  );
}
