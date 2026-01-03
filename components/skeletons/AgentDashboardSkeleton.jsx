import { Skeleton } from "@/components/ui/skeleton";

export default function AgentDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-white p-10 pt-24 space-y-8">

      {/* Header */}
      <Skeleton className="h-8 w-64" />

      {/* Filters */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#333] p-6 space-y-4">
        <Skeleton className="h-6 w-40" />

        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
