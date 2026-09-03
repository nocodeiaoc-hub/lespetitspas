"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { signIn, type SignInState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL: SignInState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Adresse email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="prenom.nom@exemple.fr"
          className="h-11"
          aria-invalid={state.error ? true : undefined}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="h-11"
          aria-invalid={state.error ? true : undefined}
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger-strong"
        >
          {state.error}
        </p>
      )}

      <Button type="submit" size="xl" className="w-full" disabled={pending}>
        <LogIn />
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
