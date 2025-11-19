'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface BulkUploadDialogProps {
  title: string;
  description: string;
  acceptedFileTypes: string;
  columns: string[];
  onUpload: (file: File) => Promise<void>;
  triggerText: string;
  showDetailedHelp?: boolean;
}

export function BulkUploadDialog({
  title,
  description,
  acceptedFileTypes,
  columns,
  onUpload,
  triggerText,
  showDetailedHelp = false,
}: BulkUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    try {
      await onUpload(file);
      setFile(null);
      setOpen(false);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
            <TabsTrigger value="help">
              <FileText className="h-4 w-4 mr-2" />
              Formato CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Asegúrate de que tu archivo CSV contenga todas las columnas requeridas en el orden
                correcto.
              </AlertDescription>
            </Alert>

            <Input
              type="file"
              accept={acceptedFileTypes}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) setFile(selectedFile);
              }}
            />

            {file && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800 font-medium">
                  ✓ Archivo seleccionado: {file.name}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Tamaño: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <Button className="w-full cursor-pointer" onClick={handleUpload} disabled={!file}>
              <Upload className="h-4 w-4 mr-2" />
              Subir Archivo
            </Button>
          </TabsContent>

          <TabsContent value="help" className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Columnas Requeridas:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {columns.map((column) => (
                    <div key={column} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {column}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="font-semibold text-sm mb-2">Notas Importantes:</h4>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                  <li>El archivo debe estar en formato CSV (valores separados por comas)</li>
                  <li>
                    La primera fila debe contener los nombres de las columnas exactamente como se
                    especifican
                  </li>
                  <li>Los campos no deben estar vacíos</li>
                  <li>Usar codificación UTF-8 para caracteres especiales</li>
                </ul>
              </div>

              {showDetailedHelp && (
                <>
                  <div className="border-t pt-3">
                    <h4 className="font-semibold text-sm mb-2">Valores Permitidos:</h4>
                    <div className="text-xs text-muted-foreground space-y-2">
                      {/* Show values for interns */}
                      {columns.includes('tipo_documento') && (
                        <>
                          <div>
                            <strong>tipo_documento:</strong> DNI, CE, PASSPORT
                          </div>
                          <div>
                            <strong>genero:</strong> Masculino, Femenino, Prefiero no decirlo
                          </div>
                          <div>
                            <strong>carrera:</strong> Ingenieria_Forestal, Ingenieria_Ambiental,
                            Gestion_Ambiental, Biologia, Otras
                          </div>
                          <div>
                            <strong>fuente:</strong> Correo, Redes Sociales, Recomendacion, CEIA,
                            Otros
                          </div>
                          <div>
                            <strong>temas_interes:</strong> HC (Huella de Carbono), HH (Huella
                            Hídrica), CN (Carbono Neutralidad)
                            <br />
                            <em className="text-xs">
                              Separar múltiples valores con comas sin espacios. Ej: HC,HH
                            </em>
                          </div>
                        </>
                      )}
                      {/* Show values for organizations */}
                      {columns.includes('ruc') && (
                        <>
                          <div>
                            <strong>tamano_organizacion:</strong> SMALL (Pequeña), LARGE (Grande)
                          </div>
                          <div>
                            <strong>temas_interes:</strong> HC (Huella de Carbono), HH (Huella
                            Hídrica), CN (Carbono Neutralidad)
                            <br />
                            <em className="text-xs">
                              Separar múltiples valores con comas sin espacios. Ej: HC,HH
                            </em>
                          </div>
                          <div>
                            <strong>carreras:</strong> Ingenieria_Forestal, Ingenieria_Ambiental,
                            Gestion_Ambiental, Biologia, Otras
                            <br />
                            <em className="text-xs">
                              Separar múltiples valores con comas sin espacios
                            </em>
                          </div>
                          <div>
                            <strong>genero_preferido:</strong> Masculino, Femenino, Ambos
                          </div>
                          <div>
                            <strong>departamentos_de_residencia:</strong> LIMA_METROPOLITANA,
                            AREQUIPA, CUSCO, etc.
                            <br />
                            <em className="text-xs">
                              Usar guiones bajos y mayúsculas. Separar múltiples valores con comas
                            </em>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-semibold text-sm mb-2">Ejemplo de CSV:</h4>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {columns.includes('tipo_documento')
                        ? `tipo_documento,documento,correo,nombres,apellido_paterno,apellido_materno,genero,telefono,universidad,carrera,otra_carrera,anio_graduacion,fuente,temas_interes,pais,departamento
DNI,72782331,ejemplo@gmail.com,Juan,Perez,Lopez,Masculino,922042179,Universidad Nacional,Ingenieria_Ambiental,,2022,Correo,"HC,HH",Peru,LIMA_METROPOLITANA`
                        : `ruc,correo,nombre_contacto,telefono,pais,nombre_organizacion,tamano_organizacion,sector,temas_interes,max_internos,departamentos_de_residencia,carreras,genero_preferido,requisitos_extra
20345678177,contacto@example.com,Ana Pérez,987654322,Peru,Organización Ambiental,SMALL,Energía,"HC,HH",3,"LIMA_METROPOLITANA,AREQUIPA","Ingenieria_Forestal,Biologia",Ambos,Experiencia requerida`}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
