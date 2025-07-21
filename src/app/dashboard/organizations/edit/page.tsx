'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { OrganizationForm } from '@/components/forms/organization-form';

function EditOrganizationContent() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('id');

  if (!organizationId) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ID de organización no proporcionado. Por favor, selecciona una organización desde la
            lista.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <OrganizationForm mode="edit" organizationId={organizationId} />;
}

export default function EditOrganizationPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-6 max-w-2xl">
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando página de edición...</span>
            </div>
          </div>
        </div>
      }
    >
      <EditOrganizationContent />
    </Suspense>
  );
}
