import InternshipCertificateContent from '@/components/certificate-context';
import { Suspense } from 'react';

export default function InternshipCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando certificado...</p>
          </div>
        </div>
      }
    >
      <InternshipCertificateContent />
    </Suspense>
  );
}
