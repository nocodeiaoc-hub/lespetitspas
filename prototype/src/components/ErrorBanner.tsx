import { RotateCcw, WifiOff } from "lucide-react";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** Etat d'erreur reseau / Supabase indisponible. Jamais d'ecran blanc. */
export function ErrorBanner({
  title = "Une erreur est survenue",
  message = "Impossible de charger les données. Vérifiez votre connexion et réessayez.",
  onRetry,
}: Props) {
  return (
    <div
      className="card flex flex-col items-center gap-3 px-6 py-10 text-center"
      style={{ border: "1px solid var(--color-danger)" }}
      role="alert"
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--color-danger-soft)", color: "var(--color-danger-strong)" }}
      >
        <WifiOff size={24} />
      </span>
      <h3 className="text-lg">{title}</h3>
      <p className="max-w-sm text-sm text-ink-soft">{message}</p>
      {onRetry && (
        <button className="btn btn-secondary mt-1" onClick={onRetry}>
          <RotateCcw size={16} /> Réessayer
        </button>
      )}
    </div>
  );
}
