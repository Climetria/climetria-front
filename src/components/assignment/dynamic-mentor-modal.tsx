'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Loader2, Users, UserPlus, UserMinus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Mentor {
  id: string;
  firstNames: string;
  lastNameFather: string;
  lastNameMother: string;
  email: string;
  phone?: string;
}

interface Organization {
  id: string;
  organizationName: string;
  mentorIds?: string[];
}

interface DynamicMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
  mentors: Mentor[];
  onAssign: (mentorIds: string[]) => void;
  onUnassign: (mentorIds: string[]) => void;
  isLoading: boolean;
}

export function DynamicMentorModal({
  isOpen,
  onClose,
  organization,
  mentors,
  onAssign,
  onUnassign,
  isLoading,
}: DynamicMentorModalProps) {
  const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Reset selections when modal opens/closes or organization changes
  useEffect(() => {
    if (isOpen) {
      setSelectedMentorIds([]);
      setSearchTerm('');
    }
  }, [isOpen, organization?.id]);

  const assignedMentorIds = organization?.mentorIds || [];

  const filteredMentors = mentors.filter((mentor) => {
    const fullName =
      `${mentor.firstNames} ${mentor.lastNameFather} ${mentor.lastNameMother}`.toLowerCase();
    const email = mentor.email.toLowerCase();
    const phone = mentor.phone?.toLowerCase() || '';

    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm.toLowerCase())
    );
  });

  const handleMentorToggle = (mentorId: string) => {
    setSelectedMentorIds((prev) =>
      prev.includes(mentorId) ? prev.filter((id) => id !== mentorId) : [...prev, mentorId],
    );
  };

  const handleSelectAll = () => {
    if (selectedMentorIds.length === filteredMentors.length) {
      setSelectedMentorIds([]);
    } else {
      setSelectedMentorIds(filteredMentors.map((mentor) => mentor.id));
    }
  };

  // Determine what actions are available based on selection
  const selectedAssigned = selectedMentorIds.filter((id) => assignedMentorIds.includes(id));
  const selectedUnassigned = selectedMentorIds.filter((id) => !assignedMentorIds.includes(id));

  const canAssign = selectedUnassigned.length > 0;
  const canUnassign = selectedAssigned.length > 0;

  const handleAssign = () => {
    if (selectedUnassigned.length > 0) {
      onAssign(selectedUnassigned);
    }
  };

  const handleUnassign = () => {
    if (selectedAssigned.length > 0) {
      onUnassign(selectedAssigned);
    }
  };

  const handleClose = () => {
    setSelectedMentorIds([]);
    setSearchTerm('');
    onClose();
  };

  if (!organization) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestionar Mentores - {organization.organizationName}
          </DialogTitle>
          <DialogDescription>
            Selecciona los mentores para asignar o desasignar de esta organización
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Search and Select All */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar mentores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleSelectAll}
              disabled={filteredMentors.length === 0}
            >
              {selectedMentorIds.length === filteredMentors.length
                ? 'Deseleccionar Todo'
                : 'Seleccionar Todo'}
            </Button>
          </div>

          {/* Selection Summary */}
          {selectedMentorIds.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">
                {selectedMentorIds.length} seleccionado{selectedMentorIds.length > 1 ? 's' : ''}
              </Badge>
              {selectedAssigned.length > 0 && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {selectedAssigned.length} ya asignado{selectedAssigned.length > 1 ? 's' : ''}
                </Badge>
              )}
              {selectedUnassigned.length > 0 && (
                <Badge variant="outline">{selectedUnassigned.length} sin asignar</Badge>
              )}
            </div>
          )}

          {/* Mentors List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredMentors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {mentors.length === 0
                  ? 'No hay mentores disponibles en este curso'
                  : 'No se encontraron mentores con los criterios de búsqueda'}
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredMentors.map((mentor) => {
                  const isAssigned = assignedMentorIds.includes(mentor.id);
                  const isSelected = selectedMentorIds.includes(mentor.id);

                  return (
                    <div
                      key={mentor.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => handleMentorToggle(mentor.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleMentorToggle(mentor.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">
                              {mentor.firstNames} {mentor.lastNameFather} {mentor.lastNameMother}
                            </h4>
                            {isAssigned && (
                              <Badge
                                variant="default"
                                className="bg-green-100 text-green-800 text-xs"
                              >
                                Asignado
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{mentor.email}</p>
                          {mentor.phone && (
                            <p className="text-xs text-muted-foreground">{mentor.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {assignedMentorIds.length} mentor{assignedMentorIds.length !== 1 ? 'es' : ''}{' '}
              actualmente asignado
              {assignedMentorIds.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              {canUnassign && (
                <Button variant="destructive" onClick={handleUnassign} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Desasignando...
                    </>
                  ) : (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Desasignar ({selectedAssigned.length})
                    </>
                  )}
                </Button>
              )}
              {canAssign && (
                <Button onClick={handleAssign} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Asignando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Asignar ({selectedUnassigned.length})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
