import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-lg bg-surface p-8 text-center shadow-soft">
        <span className="flex size-12 items-center justify-center rounded-pill bg-primary-soft text-primary-strong">
          <Compass className="size-5" />
        </span>
        <h1 className="text-lg">Page introuvable</h1>
        <p className="text-sm text-ink-soft">
          Cette page n&apos;existe pas ou ne vous est pas accessible.
        </p>
        <Link
          href="/"
          className="rounded-pill bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Revenir à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
