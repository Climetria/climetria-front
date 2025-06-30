'use client';

import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX } from 'lucide-react';

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const isAssigned = status === 'assigned';

  return (
    <Badge
      variant={isAssigned ? 'default' : 'secondary'}
      className={`transition-colors ${
        isAssigned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {isAssigned ? (
        <>
          <UserCheck className="h-3 w-3 mr-1" />
          Asignado
        </>
      ) : (
        <>
          <UserX className="h-3 w-3 mr-1" />
          No asignado
        </>
      )}
    </Badge>
  );
}
