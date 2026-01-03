import { Skeleton } from "@/components/ui/skeleton";

export default function TicketsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] to-black px-6 md:px-10 pt-28 pb-16 space-y-10">

      {/* Header */}
      <div className="bg-gray-900/70 p-6 rounded-2xl border border-gray-800">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Create Ticket */}
        <div className="space-y-4">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full mt-3" />
            <Skeleton className="h-10 w-full mt-3" />
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <Skeleton className="h-5 w-48" />
          </div>

          <div className="divide-y divide-gray-800">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 grid grid-cols-5 gap-4">
                <Skeleton className="h-4 col-span-2" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
