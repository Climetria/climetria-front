'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { MentorForm } from '@/components/forms/mentor-form';

function EditMentorContent() {
  const searchParams = useSearchParams();
  const mentorId = searchParams.get('id');

  if (!mentorId) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ID de mentor no proporcionado. Por favor, selecciona un mentor desde la lista.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <MentorForm mode="edit" mentorId={mentorId} />
    </div>
  );
}

export default function EditMentorPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando página de edición...</span>
            </div>
          </div>
        </div>
      }
    >
      <EditMentorContent />
    </Suspense>
  );
}
