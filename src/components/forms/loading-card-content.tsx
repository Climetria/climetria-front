'use client';

import { CardContent } from '@/components/ui/card';

interface LoadingCardContentProps {
  type?: 'mentor' | 'course' | 'default';
}

export function LoadingCardContent({ type = 'default' }: LoadingCardContentProps) {
  if (type === 'mentor') {
    return (
      <CardContent className="space-y-6">
        {/* Email and First Names row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Last Names row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Document Type and Number row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Phone row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-2">{/* Empty space for symmetry */}</div>
        </div>

        {/* Residency fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Buttons row */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="h-10 bg-muted rounded flex-1 animate-pulse" />
          <div className="h-10 bg-muted rounded sm:flex-1 animate-pulse" />
        </div>
      </CardContent>
    );
  }

  if (type === 'course') {
    return (
      <CardContent className="space-y-6">
        {/* Course Name */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-10 bg-muted rounded animate-pulse" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
          <div className="h-20 bg-muted rounded animate-pulse" />
        </div>

        {/* Year */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-1/6 animate-pulse" />
          <div className="h-10 bg-muted rounded animate-pulse" />
        </div>

        {/* Buttons row */}
        <div className="flex gap-4 pt-4">
          <div className="h-10 bg-muted rounded flex-1 animate-pulse" />
          <div className="h-10 bg-muted rounded flex-1 animate-pulse" />
        </div>
      </CardContent>
    );
  }

  // Default skeleton
  return (
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex gap-4 pt-4">
        <div className="h-10 bg-muted rounded flex-1 animate-pulse" />
        <div className="h-10 bg-muted rounded flex-1 animate-pulse" />
      </div>
    </CardContent>
  );
}
