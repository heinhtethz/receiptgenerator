import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/SkeletonCard";

export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 min-h-[calc(100dvh-4rem)]">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard
          </span>
          {/* Skeleton for the user's email */}
          <Skeleton className="h-6 w-32 sm:w-48 rounded-md" />
        </h2>
      </div>

      {/* --- Summary Cards Skeleton --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <div className="sm:col-span-2 lg:col-span-1">
          <SkeletonCard />
        </div>
      </div>

      {/* Main Invoice Data Table/List Skeleton */}
      <div className="mt-6 space-y-4">
        {/* Simulating the search/filter bar if you have one */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
        {/* Simulating the table body */}
        <Skeleton className="h-100 w-full rounded-xl" />
      </div>
    </div>
  );
}
