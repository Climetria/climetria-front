'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { apiService, type InternshipCertificateData } from '@/lib/api';
import { toast } from 'sonner';

export default function InternshipCertificatePage() {
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
        const data = await apiService.getInternshipCertificateData(internId);
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
            {/* QR Code */}
            <div className="qr">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                  window.location.href,
                )}`}
                alt="QR code"
                className="qr-image"
              />
              <div className="qr-text">ID verificado</div>
            </div>

            {/* Title */}
            <div className="title">CERTIFICADO DE PASANTÍA</div>

            {/* Content */}
            <div className="section">
              <p className="award-text">Otorgado a:</p>
              <div className="recipient-name">{certificateData.fullName}</div>
              <p className="certificate-body">
                Por haber concluido satisfactoriamente su labor como{' '}
                <strong>pasante en {certificateData.course}</strong> para la empresa{' '}
                <strong>{certificateData.organization}</strong>, a través del Informe de Resultados
                de {certificateData.course}.
              </p>
            </div>

            {/* Logos */}
            <div className="logos">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/UNACEM_logo.svg/2560px-UNACEM_logo.svg.png"
                alt="Logo UNACEM"
                className="logo"
              />
              <img src="/placeholder.svg?height=50&width=120" alt="Logo Aresol" className="logo" />
              <img
                src="/placeholder.svg?height=50&width=120"
                alt="Logo Genes Perú"
                className="logo"
              />
              <img
                src="/placeholder.svg?height=50&width=120"
                alt="Logo Climetría"
                className="logo"
              />
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
          width: 210mm;
          height: 297mm;
          padding: 40px;
          background: white;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          position: relative;
          box-sizing: border-box;
          font-family: 'Segoe UI', sans-serif;
        }

        .qr {
          position: absolute;
          top: 40px;
          right: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }

        .qr-image {
          width: 80px;
          height: 80px;
          margin-bottom: 5px;
        }

        .qr-text {
          font-size: 11px;
          color: #888;
        }

        .title {
          text-align: center;
          font-size: 32px;
          color: #6cc24a;
          font-weight: bold;
          margin: 80px 0 40px 0;
          letter-spacing: 1px;
        }

        .section {
          margin: 40px 40px;
          font-size: 18px;
          line-height: 1.8;
          color: #333;
        }

        .award-text {
          font-size: 16px;
          margin-bottom: 15px;
          color: #666;
        }

        .recipient-name {
          text-align: center;
          font-size: 28px;
          font-weight: bold;
          margin: 20px 0;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .certificate-body {
          text-align: justify;
          margin-top: 30px;
          font-size: 16px;
          line-height: 1.6;
        }

        .logos {
          position: absolute;
          right: 40px;
          top: 180px;
          display: flex;
          flex-direction: column;
          gap: 25px;
          align-items: center;
        }

        .logo {
          max-width: 120px;
          max-height: 50px;
          object-fit: contain;
        }

        .signatures {
          display: flex;
          justify-content: space-around;
          margin-top: 80px;
          padding: 0 40px;
        }

        .signature {
          text-align: center;
          flex: 1;
          max-width: 200px;
        }

        .signature-name {
          margin-top: 60px;
          border-top: 2px solid #333;
          display: inline-block;
          padding-top: 8px;
          font-weight: bold;
          font-size: 16px;
          min-width: 180px;
        }

        .signature-title {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
          line-height: 1.3;
        }

        .signature-company {
          font-weight: bold;
          font-size: 14px;
          margin-top: 3px;
          color: #333;
        }

        .footer {
          position: absolute;
          bottom: 40px;
          width: calc(100% - 80px);
          text-align: center;
          font-size: 14px;
          color: #555;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }

        .watermark {
          position: absolute;
          opacity: 0.03;
          font-size: 120px;
          top: 35%;
          left: 15%;
          transform: rotate(-25deg);
          white-space: nowrap;
          font-weight: bold;
          color: #6cc24a;
          pointer-events: none;
          z-index: 0;
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
          size: A4;
          margin: 0;
        }
      `}</style>
    </>
  );
}
