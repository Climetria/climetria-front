'use client';

import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX } from 'lucide-react';

type StatusBadgeProps<T> = {
  entity: T;
  status: string;
  onAssign: (entity: T) => void;
  onUnassign: (entity: T) => void;
};

export function StatusBadge<T>({ entity, status, onAssign, onUnassign }: StatusBadgeProps<T>) {
  const isAssigned = status === 'assigned';

  return (
    <Badge
      variant={isAssigned ? 'default' : 'secondary'}
      className={`cursor-pointer transition-colors ${
        isAssigned
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
      onClick={() => (isAssigned ? onUnassign(entity) : onAssign(entity))}
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
