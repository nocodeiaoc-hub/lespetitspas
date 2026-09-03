import { SkeletonCards } from "@/components/skeleton-cards";

export default function ParentLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      <SkeletonCards count={2} />
    </div>
  );
}
