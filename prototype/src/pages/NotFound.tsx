import { Link } from "react-router-dom";
import { useApp } from "../state/AppState";

export function NotFound() {
  const { currentUser } = useApp();
  const home = !currentUser ? "/login" : currentUser.role === "staff" ? "/staff" : "/parent";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="text-5xl">🧸</span>
      <h1 className="font-heading text-2xl font-extrabold">Page introuvable</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Link to={home} className="btn btn-primary">
        Retour à l'accueil
      </Link>
    </div>
  );
}
