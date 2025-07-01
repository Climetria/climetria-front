'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, User, Mail, Phone, AlertCircle } from 'lucide-react';
import type { Mentor, Intern, OrganizationWithFilter } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

type AssignableEntity = Mentor | Intern;

interface DynamicAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: OrganizationWithFilter | null;
  entities: AssignableEntity[];
  onAssign: (entityIds: string[]) => Promise<void>;
  onUnassign: (entityIds: string[]) => Promise<void>;
  isLoading: boolean;
  config: {
    title: string;
    description: (organization: OrganizationWithFilter) => string;
    searchPlaceholder: string;
    assignButtonText: string;
    loadingText: string;
    noEntitiesMessage: string;
    noResultsMessage: string;
    entityDisplayName: (entity: AssignableEntity) => string;
    entitySubtitle: (entity: AssignableEntity) => string;
    entityContact: (entity: AssignableEntity) => string;
    allowMultipleSelection: boolean;
    maxAssignments?: number;
    assignedEntityIds?: string[];
  };
}

export function DynamicAssignmentModal({
  isOpen,
  onClose,
  organization,
  entities,
  onAssign,
  onUnassign,
  isLoading,
  config,
}: DynamicAssignmentModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Get currently assigned entities
  const assignedEntityIds = config.assignedEntityIds || [];
  const assignedEntities = entities.filter((entity) => assignedEntityIds.includes(entity.id));
  const availableEntities = entities.filter((entity) => !assignedEntityIds.includes(entity.id));

  // Filter available entities based on search
  const filteredAvailableEntities = useMemo(() => {
    if (!searchTerm) return availableEntities;

    return availableEntities.filter((entity) => {
      const displayName = config.entityDisplayName(entity).toLowerCase();
      const subtitle = config.entitySubtitle(entity).toLowerCase();
      const contact = config.entityContact(entity).toLowerCase();
      const search = searchTerm.toLowerCase();

      return displayName.includes(search) || subtitle.includes(search) || contact.includes(search);
    });
  }, [availableEntities, searchTerm, config]);

  // Reset selection when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedEntityIds([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleEntityToggle = (entityId: string) => {
    if (!config.allowMultipleSelection) {
      setSelectedEntityIds([entityId]);
      return;
    }

    setSelectedEntityIds((prev) => {
      const newSelection = prev.includes(entityId)
        ? prev.filter((id) => id !== entityId)
        : [...prev, entityId];

      // Validar que no exceda el límite máximo
      if (
        config.maxAssignments &&
        newSelection.length + assignedEntityIds.length > config.maxAssignments
      ) {
        return prev; // No permitir la selección si excede el límite
      }

      return newSelection;
    });
  };

  const handleAssign = async () => {
    if (selectedEntityIds.length === 0) return;

    // Validación adicional antes de asignar
    if (
      config.maxAssignments &&
      selectedEntityIds.length + assignedEntityIds.length > config.maxAssignments
    ) {
      return;
    }

    try {
      setIsAssigning(true);
      await onAssign(selectedEntityIds);
      setSelectedEntityIds([]);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async (entityIds: string[]) => {
    try {
      setIsAssigning(true);
      await onUnassign(entityIds);
    } finally {
      setIsAssigning(false);
    }
  };

  const canAssignMore = () => {
    if (!config.maxAssignments) return true;
    return assignedEntityIds.length < config.maxAssignments;
  };

  const remainingSlots = config.maxAssignments
    ? config.maxAssignments - assignedEntityIds.length
    : null;

  if (!organization) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description(organization)}</DialogDescription>
          {/* Moved badges outside DialogDescription to fix hydration error */}
          {config.maxAssignments && (
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">
                {assignedEntityIds.length}/{config.maxAssignments} asignados
              </Badge>
              {remainingSlots !== null && remainingSlots > 0 && (
                <Badge variant="secondary">{remainingSlots} espacios disponibles</Badge>
              )}
            </div>
          )}
        </DialogHeader>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando...</span>
            </div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              {/* Currently Assigned Section */}
              {assignedEntities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Actualmente Asignados</h4>
                  <ScrollArea className="max-h-48">
                    <div className="space-y-3 pr-1">
                      {assignedEntities.map((entity) => (
                        <Card key={entity.id} className="p-4 border-l-4 border-l-primary">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {config.entityDisplayName(entity)}
                                </p>
                                <div className="mt-1 space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {config.entitySubtitle(entity)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{config.entityContact(entity)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnassign([entity.id])}
                              disabled={isAssigning}
                              className="ml-3 flex-shrink-0"
                            >
                              {isAssigning ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                'Desasignar'
                              )}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                  <Separator className="my-4" />
                </div>
              )}

              {/* Assignment Section */}
              {canAssignMore() ? (
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Disponibles para Asignar</h4>
                    {remainingSlots !== null && (
                      <Badge variant="secondary">{remainingSlots} espacios disponibles</Badge>
                    )}
                  </div>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={config.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Scrollable List */}
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-1">
                      {filteredAvailableEntities.length === 0 ? (
                        <div className="text-center py-8">
                          <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {availableEntities.length === 0
                              ? config.noEntitiesMessage
                              : config.noResultsMessage}
                          </p>
                        </div>
                      ) : (
                        filteredAvailableEntities.map((entity) => {
                          const isSelected = selectedEntityIds.includes(entity.id);
                          const wouldExceedLimit =
                            config.maxAssignments &&
                            !isSelected &&
                            selectedEntityIds.length + assignedEntityIds.length >=
                              config.maxAssignments;

                          return (
                            <Card
                              key={entity.id}
                              className={`p-3 cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-primary/5 border-primary'
                                  : wouldExceedLimit
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-muted/50'
                              }`}
                              onClick={() => !wouldExceedLimit && handleEntityToggle(entity.id)}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={isSelected}
                                  disabled={Boolean(wouldExceedLimit)}
                                  onChange={() =>
                                    !wouldExceedLimit && handleEntityToggle(entity.id)
                                  }
                                />
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {config.entityDisplayName(entity)}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {config.entitySubtitle(entity)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {config.entityContact(entity)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Se ha alcanzado el límite máximo de asignaciones para esta organización.
                    {assignedEntities.length > 0 &&
                      ' Puedes desasignar elementos arriba si necesitas hacer cambios.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {canAssignMore() && selectedEntityIds.length > 0 && (
            <Button onClick={handleAssign} disabled={selectedEntityIds.length === 0 || isAssigning}>
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {config.loadingText}
                </>
              ) : (
                `${config.assignButtonText} (${selectedEntityIds.length})`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
