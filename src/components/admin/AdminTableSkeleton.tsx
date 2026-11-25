import { Skeleton } from "@/components/ui/skeleton";

export function AdminTableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-3xl border border-[#E9DCCB] shadow-[0_2px_12px_rgba(86,58,41,0.03)] overflow-hidden">
      {/* Table Header Skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-[#E9DCCB]/80 bg-[#FAF7F2]/60">
        <Skeleton className="h-6 w-36 bg-[#E9DCCB]/60 rounded-lg" />
        <Skeleton className="h-8 w-48 bg-[#E9DCCB]/40 rounded-xl" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#E9DCCB]/40">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 p-4 animate-pulse">
            <Skeleton className="w-10 h-10 rounded-xl bg-[#E9DCCB]/50 shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-4 w-1/3 bg-[#E9DCCB]/60 rounded" />
              <Skeleton className="h-3 w-1/5 bg-[#E9DCCB]/40 rounded" />
            </div>
            <Skeleton className="h-5 w-20 bg-[#E9DCCB]/50 rounded-full shrink-0" />
            <Skeleton className="h-5 w-16 bg-[#E9DCCB]/60 rounded shrink-0 hidden sm:block" />
            <Skeleton className="h-8 w-8 rounded-lg bg-[#E9DCCB]/40 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
