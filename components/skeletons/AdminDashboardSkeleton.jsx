import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-white p-10 pt-24 space-y-10">

      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Filter bar */}
      <div className="bg-[#14181e] p-5 rounded-xl border border-[#333] flex gap-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#14181e] p-6 rounded-xl border border-[#333]"
          >
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Avg resolution */}
      <div className="bg-[#14181e] p-5 rounded-xl border border-[#333]">
        <Skeleton className="h-4 w-40 mb-2" />
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#14181e] p-6 rounded-2xl border border-[#333]"
          >
            <Skeleton className="h-6 w-48 mb-6" />
            <Skeleton className="h-[220px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
