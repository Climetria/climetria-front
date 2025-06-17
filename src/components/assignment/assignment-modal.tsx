'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Loader2, Building2 } from 'lucide-react';

interface AssignableEntity {
  id: string;
  organizationName?: string;
  contactName?: string;
  email: string;
  name?: string; // For mentors or other entities
}

interface AssigneeEntity {
  id: string;
  firstNames?: string;
  lastNameFather?: string;
  lastNameMother?: string;
  name?: string; // For other types of assignees
}

interface AssignmentModalProps<T extends AssignableEntity, U extends AssigneeEntity> {
  isOpen: boolean;
  onClose: () => void;
  assignee: U | null;
  assignableEntities: T[];
  onAssign: (entityId: string) => void;
  isLoading: boolean;
  config: {
    title: string;
    description: (assignee: U) => string;
    searchPlaceholder: string;
    assignButtonText: string;
    loadingText: string;
    noEntitiesMessage: string;
    noResultsMessage: string;
    entityDisplayName: (entity: T) => string;
    entitySubtitle: (entity: T) => string;
    entityContact?: (entity: T) => string;
  };
}

export function AssignmentModal<T extends AssignableEntity, U extends AssigneeEntity>({
  isOpen,
  onClose,
  assignee,
  assignableEntities,
  onAssign,
  isLoading,
  config,
}: AssignmentModalProps<T, U>) {
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEntities = assignableEntities.filter((entity) => {
    const displayName = config.entityDisplayName(entity).toLowerCase();
    const subtitle = config.entitySubtitle(entity).toLowerCase();
    const contact = config.entityContact?.(entity)?.toLowerCase() || '';

    return (
      displayName.includes(searchTerm.toLowerCase()) ||
      subtitle.includes(searchTerm.toLowerCase()) ||
      contact.includes(searchTerm.toLowerCase())
    );
  });

  const handleAssign = () => {
    if (selectedEntity) {
      onAssign(selectedEntity);
      setSelectedEntity('');
      setSearchTerm('');
    }
  };

  const handleClose = () => {
    setSelectedEntity('');
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {config.title}
          </DialogTitle>
          <DialogDescription>{assignee && config.description(assignee)}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={config.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Entities List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredEntities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {assignableEntities.length === 0
                  ? config.noEntitiesMessage
                  : config.noResultsMessage}
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredEntities.map((entity) => (
                  <div
                    key={entity.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedEntity === entity.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedEntity(entity.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{config.entityDisplayName(entity)}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {config.entitySubtitle(entity)}
                        </p>
                        {config.entityContact && (
                          <p className="text-xs text-muted-foreground">
                            {config.entityContact(entity)}
                          </p>
                        )}
                      </div>
                      {selectedEntity === entity.id && (
                        <div className="ml-2">
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleAssign} disabled={!selectedEntity || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {config.loadingText}
                </>
              ) : (
                config.assignButtonText
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
