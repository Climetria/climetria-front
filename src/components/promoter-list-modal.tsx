/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PromoterListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promoters: any[];
}

export function PromoterListModal({ open, onOpenChange, promoters }: PromoterListModalProps) {
  const router = useRouter();

  const handleRegisterNew = () => {
    onOpenChange(false);
    router.push('/promotores/nuevo');
  };

  const handleSelectPromoter = (promoterId: string) => {
    // Mock API call para asignar promotor existente
    console.log('Asignando promotor existente:', promoterId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seleccionar Promotor
          </DialogTitle>
          <DialogDescription>
            Selecciona un promotor existente o registra uno nuevo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Botón para registrar nuevo */}
          <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-medium mb-1">Registrar Nuevo Promotor</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Crea un nuevo promotor con su información de certificado
              </p>
              <Button onClick={handleRegisterNew}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Nuevo
              </Button>
            </div>
          </div>

          {/* Lista de promotores existentes */}
          {promoters.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Promotores Existentes</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {promoters.map((promoter) => (
                  <div
                    key={promoter.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={promoter.logoUrl || '/placeholder.svg'}
                          alt={promoter.organizationName}
                        />
                        <AvatarFallback>
                          {promoter.organizationName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{promoter.organizationName}</p>
                        <p className="text-sm text-muted-foreground">
                          {promoter.signerFullName} - {promoter.signerTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{promoter.assignedCourses} cursos</Badge>
                      <Button size="sm" onClick={() => handleSelectPromoter(promoter.id)}>
                        Seleccionar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
