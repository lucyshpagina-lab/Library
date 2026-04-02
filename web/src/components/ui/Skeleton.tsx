import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded-[10px]', className)} />
  );
}

export function BookCardSkeleton() {
  return (
    <div className="bg-white rounded-[10px] shadow-sm p-4 flex flex-col">
      <Skeleton className="w-full h-48 mb-3" />
      <Skeleton className="w-16 h-5 rounded-full mb-2" />
      <Skeleton className="w-3/4 h-5 mb-1" />
      <Skeleton className="w-1/2 h-4 mb-2" />
      <Skeleton className="w-24 h-4 mt-auto" />
    </div>
  );
}

export function BookGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BookDetailSkeleton() {
  return (
    <div className="bg-white rounded-[10px] shadow-sm p-8">
      <div className="flex flex-col md:flex-row gap-8">
        <Skeleton className="w-full md:w-64 h-80 flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-3/4 h-8" />
          <Skeleton className="w-1/2 h-6" />
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-full h-20" />
          <div className="flex gap-3">
            <Skeleton className="w-32 h-10" />
            <Skeleton className="w-40 h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
