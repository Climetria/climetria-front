'use client';

import { CardContent } from '@/components/ui/card';

interface LoadingListSkeletonProps {
  count?: number;
}

export function LoadingListSkeleton({ count = 3 }: LoadingListSkeletonProps) {
  return (
    <CardContent className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded animate-pulse">
          <div className="h-4 w-4 rounded-full bg-muted-foreground/40" />
          <div className="h-4 w-32 bg-muted-foreground/30 rounded" />
        </div>
      ))}
    </CardContent>
  );
}
