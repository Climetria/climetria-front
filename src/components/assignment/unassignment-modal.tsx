'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, UserX } from 'lucide-react';

interface UnassigneeEntity {
  id: string;
  firstNames?: string;
  lastNameFather?: string;
  lastNameMother?: string;
  name?: string;
}

interface UnassignmentModalProps<T extends UnassigneeEntity> {
  isOpen: boolean;
  onClose: () => void;
  entity: T | null;
  onUnassign: () => void;
  isLoading: boolean;
  config: {
    title: string;
    description: (entity: T) => string;
    confirmButtonText: string;
    loadingText: string;
  };
}

export function UnassignmentModal<T extends UnassigneeEntity>({
  isOpen,
  onClose,
  entity,
  onUnassign,
  isLoading,
  config,
}: UnassignmentModalProps<T>) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            {config.title}
          </DialogTitle>
          <DialogDescription>{entity && config.description(entity)}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onUnassign} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {config.loadingText}
              </>
            ) : (
              config.confirmButtonText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
