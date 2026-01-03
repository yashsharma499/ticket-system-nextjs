import { Skeleton } from "@/components/ui/skeleton";

export default function TicketDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-white px-8 pt-28 pb-16 space-y-10">

      {/* Header */}
      <div className="bg-[#14181e] p-6 rounded-xl border border-[#333] space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Manage Ticket Card */}
      <div className="bg-[#14181e] p-6 rounded-xl border border-[#333] max-w-xl space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Comments */}
      <div className="bg-[#14181e] p-6 rounded-xl border border-[#333] space-y-4">
        <Skeleton className="h-6 w-32" />

        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}

        <div className="flex gap-3 mt-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-24" />
        </div>
      </div>
    </div>
  );
}
