import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function InternsSkeleton({ isMobile = false }: { isMobile?: boolean }) {
  if (isMobile) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-36" />
            </div>
          </Card>
        ))}
      </div>
    );
  }
  // Desktop: tabla
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th>
                <Skeleton className="h-4 w-24" />
              </th>
              <th>
                <Skeleton className="h-4 w-24" />
              </th>
              <th>
                <Skeleton className="h-4 w-24" />
              </th>
              <th>
                <Skeleton className="h-4 w-24" />
              </th>
              <th>
                <Skeleton className="h-4 w-24" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <td>
                  <Skeleton className="h-3 w-32" />
                </td>
                <td>
                  <Skeleton className="h-3 w-32" />
                </td>
                <td>
                  <Skeleton className="h-3 w-24" />
                </td>
                <td>
                  <Skeleton className="h-3 w-24" />
                </td>
                <td>
                  <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
