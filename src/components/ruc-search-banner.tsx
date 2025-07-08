'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RucSearchBannerProps {
  organizationName: string;
  onDismiss?: () => void;
}

export function RucSearchBanner({ organizationName, onDismiss }: RucSearchBannerProps) {
  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50 relative">
      <CheckCircle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800 pr-8">
        <strong>Organización encontrada:</strong> {organizationName}. Los datos se han
        autocompletado. Puedes modificarlos si es necesario.
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}
