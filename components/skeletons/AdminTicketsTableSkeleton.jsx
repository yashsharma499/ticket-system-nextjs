import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTicketsTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#333]">
      <table className="w-full bg-[#14181e]">
        <thead className="bg-[#1d232b]">
          <tr>
            {Array.from({ length: 6 }).map((_, i) => (
              <th key={i} className="p-4">
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 10 }).map((_, row) => (
            <tr key={row} className="border-t border-[#333]">
              {Array.from({ length: 6 }).map((_, col) => (
                <td key={col} className="p-4">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
