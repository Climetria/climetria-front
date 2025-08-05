'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Mock API service - replace with your actual implementation
const apiService = {
  getInternshipCertificateData: async () => {
    // Mock data - replace with actual API call
    return {
      fullName: 'Juan Carlos Pérez García',
      course: 'Ingeniería Ambiental',
      organization: 'UNACEM Corporation',
    };
  },
};

type InternshipCertificateData = {
  fullName: string;
  course: string;
  organization: string;
};

export default function InternshipCertificateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const internId = searchParams.get('id');

  const [certificateData, setCertificateData] = useState<InternshipCertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificateData = async () => {
      if (!internId) {
        setError('ID de pasante no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiService.getInternshipCertificateData();
        setCertificateData(data);
      } catch (err) {
        console.error('Error fetching certificate data:', err);
        setError('No se pudieron cargar los datos del certificado');
        toast.error('Error al cargar el certificado');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, [internId]);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-gray-600">Cargando certificado...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !certificateData || !internId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-8 w-8 text-red-600 mb-4" />
            <p className="text-gray-600 text-center mb-4">
              {error || 'No se encontraron datos del certificado'}
            </p>
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Controls - Hidden when printing */}
      <div className="print:hidden bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-3">
            <Button onClick={handleDownloadPDF} className="bg-primary">
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Certificate */}
      <div className="min-h-screen bg-gray-100 print:bg-white print:min-h-0">
        <div className="certificate-container">
          <div className="certificate">
            {/* Background Image */}
            <div className="certificate-background"></div>

            {/* Content Overlay */}
            <div className="certificate-content">
              {/* Header with QR and Title */}
              <div className="certificate-header">
                <div className="title">CERTIFICADO DE PASANTÍA</div>
                <div className="qr">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      typeof window !== 'undefined' ? window.location.href : '',
                    )}`}
                    alt="QR code"
                    className="qr-image"
                  />
                  <div className="qr-text">ID verificado</div>
                </div>
              </div>

              {/* Main Content */}
              <div className="main-content">
                <div className="left-section">
                  <p className="award-text">Otorgado a:</p>
                  <div className="recipient-name">{certificateData.fullName}</div>
                  <p className="certificate-body">
                    Por haber concluido satisfactoriamente su labor como{' '}
                    <strong>pasante en {certificateData.course}</strong> para la empresa{' '}
                    <strong>{certificateData.organization}</strong>, a través del Informe de
                    Resultados de {certificateData.course}.
                  </p>
                </div>

                <div className="right-section">
                  {/* Logos */}
                  <div className="logos">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/UNACEM_logo.svg/2560px-UNACEM_logo.svg.png"
                      alt="Logo UNACEM"
                      className="logo"
                    />
                    <img
                      src="/placeholder.svg?height=40&width=100"
                      alt="Logo Aresol"
                      className="logo"
                    />
                    <img
                      src="/placeholder.svg?height=40&width=100"
                      alt="Logo Genes Perú"
                      className="logo"
                    />
                    <img src="@/assets/logo-climetria.png" alt="Logo Climetría" className="logo" />
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="signatures">
                <div className="signature">
                  <div className="signature-name">Carlos Adrianzen</div>
                  <div className="signature-title">
                    Gerente de Seguridad, Medio Ambiente y Sostenibilidad
                  </div>
                  <div className="signature-company">UNACEM</div>
                </div>
                <div className="signature">
                  <div className="signature-name">Ximena Gómez</div>
                  <div className="signature-title">Gerente general</div>
                  <div className="signature-company">Climetría</div>
                </div>
              </div>

              {/* Footer */}
              <div className="footer">
                Pasantía gracias a: <strong>CLIMETRÍA - Métrica del Cambio Climático</strong>
              </div>
            </div>

            {/* Watermark */}
            <div className="watermark">CLIMETRÍA</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .certificate-container {
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 80px);
        }

        .certificate {
          width: 297mm; /* A4 horizontal width */
          height: 210mm; /* A4 horizontal height */
          background: white;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          position: relative;
          box-sizing: border-box;
          font-family: 'Segoe UI', sans-serif;
          overflow: hidden;
        }

        .certificate-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/images/certificate-background.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.1;
          z-index: 1;
        }

        .certificate-content {
          position: relative;
          z-index: 2;
          padding: 30px 40px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .certificate-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .title {
          font-size: 28px;
          color: #6cc24a;
          font-weight: bold;
          letter-spacing: 1px;
          margin-top: 10px;
        }

        .qr {
          text-align: center;
          font-size: 12px;
          color: #666;
        }

        .qr-image {
          width: 70px;
          height: 70px;
          margin-bottom: 5px;
        }

        .qr-text {
          font-size: 10px;
          color: #888;
        }

        .main-content {
          display: flex;
          flex: 1;
          gap: 40px;
          margin-bottom: 30px;
        }

        .left-section {
          flex: 2;
          padding-right: 20px;
        }

        .right-section {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 20px;
        }

        .award-text {
          font-size: 16px;
          margin-bottom: 15px;
          color: #666;
        }

        .recipient-name {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin: 20px 0;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 2px;
          border: 2px solid #6cc24a;
          padding: 15px;
          background: rgba(108, 194, 74, 0.05);
        }

        .certificate-body {
          text-align: justify;
          margin-top: 25px;
          font-size: 15px;
          line-height: 1.6;
          color: #333;
        }

        .logos {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }

        .logo {
          max-width: 100px;
          max-height: 40px;
          object-fit: contain;
        }

        .signatures {
          display: flex;
          justify-content: space-around;
          margin-top: auto;
          padding: 0 60px;
        }

        .signature {
          text-align: center;
          flex: 1;
          max-width: 200px;
        }

        .signature-name {
          margin-top: 50px;
          border-top: 2px solid #333;
          display: inline-block;
          padding-top: 8px;
          font-weight: bold;
          font-size: 14px;
          min-width: 160px;
        }

        .signature-title {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
          line-height: 1.3;
        }

        .signature-company {
          font-weight: bold;
          font-size: 12px;
          margin-top: 3px;
          color: #333;
        }

        .footer {
          text-align: center;
          font-size: 12px;
          color: #555;
          border-top: 1px solid #ddd;
          padding-top: 10px;
          margin-top: 15px;
        }

        .watermark {
          position: absolute;
          opacity: 0.03;
          font-size: 100px;
          top: 45%;
          left: 25%;
          transform: rotate(-25deg);
          white-space: nowrap;
          font-weight: bold;
          color: #6cc24a;
          pointer-events: none;
          z-index: 1;
        }

        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .certificate-container {
            padding: 0;
            min-height: auto;
          }

          .certificate {
            margin: 0;
            box-shadow: none;
            page-break-inside: avoid;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:bg-white {
            background: white !important;
          }

          .print\\:min-h-0 {
            min-height: 0 !important;
          }
        }

        @page {
          size: A4 landscape;
          margin: 0;
        }
      `}</style>
    </>
  );
}
