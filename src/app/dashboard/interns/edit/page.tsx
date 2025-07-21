'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { InternForm } from '@/components/forms/intern-form';

function EditInternContent() {
  const searchParams = useSearchParams();
  const internId = searchParams.get('id');

  if (!internId) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ID de pasante no proporcionado. Por favor, selecciona un pasante desde la lista.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <InternForm mode="edit" internId={internId} />;
}

export default function EditInternPage() {
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
      <EditInternContent />
    </Suspense>
  );
}
