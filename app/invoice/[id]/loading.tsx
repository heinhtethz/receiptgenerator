import { SkeletonCard } from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <div className="w-full max-w-3xl mx-auto py-5 px-1">
      <h1 className="text-2xl font-bold tracking-tight text-balance">
        Invoice Editor
      </h1>
      <SkeletonCard />
    </div>
  );
}
