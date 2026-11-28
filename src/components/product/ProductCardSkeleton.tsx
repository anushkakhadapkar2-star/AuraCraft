import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="clay-card flex flex-col p-3 rounded-[28px] border border-[#EDE3D5]">
      {/* Image Container Skeleton */}
      <Skeleton className="w-full aspect-[4/5] rounded-[22px] mb-3 bg-[#EDE3D5]/60" />
      
      {/* Product Info Skeleton */}
      <div className="px-1.5 pb-1 space-y-2.5">
        <Skeleton className="h-4.5 w-4/5 rounded-md bg-[#EDE3D5]/70" />
        <Skeleton className="h-3.5 w-1/2 rounded-md bg-[#EDE3D5]/50" />
        
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-20 rounded-md bg-[#EDE3D5]/70" />
          <Skeleton className="h-8 w-24 rounded-2xl bg-[#EDE3D5]/50 hidden sm:block" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}
