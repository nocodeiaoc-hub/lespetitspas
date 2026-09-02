import { SkeletonCards } from "@/components/skeleton-cards";

export default function StaffLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-6 w-32 animate-pulse rounded bg-muted" />
      <SkeletonCards />
    </div>
  );
}
