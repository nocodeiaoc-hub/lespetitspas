import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getProfile, spaceForRole } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Connexion · Les Petits Pas",
};

export default async function LoginPage() {
  // Utilisateur déjà connecté → on l'envoie directement dans son espace.
  const profile = await getProfile();
  if (profile) redirect(spaceForRole(profile.role));

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
            👣
          </span>
          <h1 className="text-2xl">Les Petits Pas</h1>
          <p className="text-sm text-ink-soft">
            Le lien quotidien entre la crèche et les familles
          </p>
        </div>

        <div className="rounded-lg bg-surface p-5 shadow-soft">
          <LoginForm />
        </div>

        <p className="mt-5 flex items-start gap-2 text-xs text-ink-soft">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-secondary-strong" />
          Données personnelles traitées conformément au RGPD : accès limité à
          l&apos;équipe de la crèche et aux familles rattachées.
        </p>
      </div>
    </main>
  );
}
