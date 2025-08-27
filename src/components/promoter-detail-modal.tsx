/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, User, FileText, ImageIcon } from 'lucide-react';

interface PromoterDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promoter: any;
}

export function PromoterDetailModal({ open, onOpenChange, promoter }: PromoterDetailModalProps) {
  if (!promoter) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Detalle del Promotor
          </DialogTitle>
          <DialogDescription>
            Información completa del promotor y sus datos de certificación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <div
            className="flex items-center 
          gap-4"
          >
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={promoter.logoUrl || '/placeholder.svg'}
                alt={promoter.organizationName}
              />
              <AvatarFallback>
                {promoter.organizationName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{promoter.organizationName}</h3>
            </div>
          </div>

          {/* Información del firmante */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Firmante</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{promoter.signerFullName}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Cargo</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{promoter.signerTitle}</p>
            </div>
          </div>

          {/* Archivos */}
          <div className="space-y-4">
            <h4 className="font-medium">Archivos de Certificación</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logo */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Logo</span>
                </div>
                <div className="border rounded-lg p-3 bg-muted/50">
                  <img
                    src={promoter.logoUrl || '/placeholder.svg'}
                    alt="Logo"
                    className="w-full h-20 object-contain bg-white rounded"
                  />
                </div>
              </div>

              {/* Firma */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Firma</span>
                </div>
                <div className="border rounded-lg p-3 bg-muted/50">
                  <img
                    src={promoter.signerSignatureUrl || '/placeholder.svg'}
                    alt="Firma"
                    className="w-full h-20 object-contain bg-white rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
