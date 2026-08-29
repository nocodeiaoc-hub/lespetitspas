import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import { useApp } from "../state/AppState";
import { ALL_PROFILES, DEMO_ACCOUNTS } from "../data/mock";
import { getProfile } from "../state/selectors";

export function Login() {
  const { currentUser, login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === "staff" ? "/staff" : "/parent", { replace: true });
    }
  }, [currentUser, navigate]);

  const enter = (userId: string) => {
    const profile = getProfile(userId);
    if (!profile) return;
    login(userId);
    navigate(profile.role === "staff" ? "/staff" : "/parent", { replace: true });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = ALL_PROFILES.find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!match || password.length < 4) {
      setError("Email ou mot de passe incorrect. Vérifiez vos identifiants.");
      return;
    }
    enter(match.id);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
            style={{ background: "var(--color-primary-soft)" }}
          >
            👣
          </span>
          <h1 className="font-heading text-2xl font-extrabold">Les Petits Pas</h1>
          <p className="text-sm text-ink-soft">
            Le lien quotidien entre la crèche et les familles
          </p>
        </div>

        <form className="card flex flex-col gap-4 p-5" onSubmit={onSubmit}>
          <div>
            <label className="field-label" htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="field-input"
              placeholder="prenom.nom@exemple.fr"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="field-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
            />
            <button type="button" className="mt-1.5 text-sm font-medium text-primary-strong">
              Mot de passe oublié ?
            </button>
          </div>

          {error && (
            <p
              className="rounded-lg px-3 py-2 text-sm font-medium"
              style={{ background: "var(--color-danger-soft)", color: "var(--color-danger-strong)" }}
              role="alert"
            >
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary">
            <LogIn size={16} /> Se connecter
          </button>
        </form>

        <div className="mt-5">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Prototype · connexion démo en un clic
          </p>
          <div className="flex flex-col gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.profileId}
                onClick={() => enter(acc.profileId)}
                className="card flex items-center justify-between px-4 py-3 text-left text-sm hover:shadow-[var(--shadow-lift)]"
              >
                <span>
                  <span className="font-semibold">{acc.label}</span>
                  <br />
                  <span className="text-ink-soft">{acc.hint}</span>
                </span>
                <LogIn size={16} className="text-ink-soft" />
              </button>
            ))}
          </div>
        </div>

        <p className="mt-5 flex items-start gap-2 text-xs text-ink-soft">
          <ShieldCheck size={14} className="mt-0.5 shrink-0" style={{ color: "var(--color-secondary)" }} />
          Données personnelles traitées conformément au RGPD : accès limité à l'équipe de
          la crèche et aux familles rattachées. Données de démonstration fictives.
        </p>
      </div>
    </div>
  );
}
