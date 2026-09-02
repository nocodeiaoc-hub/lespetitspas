/** Rangée de cartes fantômes pour les états de chargement. */
export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg bg-surface p-4 shadow-soft"
        >
          <div className="size-12 shrink-0 animate-pulse rounded-pill bg-muted" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
