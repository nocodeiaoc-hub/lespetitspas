// Page d'accueil provisoire. En Phase 5, la racine redirigera vers /login
// (ou vers l'espace de l'utilisateur connecté).
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-bold">Les Petits Pas</h1>
      <p className="text-sm text-neutral-500">
        Application en cours de construction.
      </p>
    </main>
  );
}
