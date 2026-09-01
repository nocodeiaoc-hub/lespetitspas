// Page d'accueil provisoire. En Phase 5, la racine redirigera vers /login
// (ou vers l'espace de l'utilisateur connecté).
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg bg-surface p-8 text-center shadow-soft">
        <h1 className="text-2xl">Les Petits Pas</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Application en cours de construction.
        </p>
        <span className="mt-4 inline-flex rounded-pill bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-strong">
          Charte Nuage active
        </span>
      </div>
    </main>
  );
}
