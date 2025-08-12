'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Loader2, AlertCircle, ChevronLeft, Upload, FileImage, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { apiService } from '@/lib/api';
import { useCourse } from '@/context/CourseContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Link from 'next/link';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Schema de validación corregido
const formSchema = z
  .object({
    signerFullName: z
      .string()
      .min(1, { message: 'El nombre completo del firmante es obligatorio' })
      .min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
    signerTitle: z
      .string()
      .min(1, { message: 'El cargo del firmante es obligatorio' })
      .min(2, { message: 'El cargo debe tener al menos 2 caracteres' }),
    logo: z
      .instanceof(File, { message: 'El logo es obligatorio' })
      .refine((file) => file?.size <= MAX_FILE_SIZE, 'El archivo debe ser menor a 5MB')
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
        'Solo se aceptan archivos .jpg, .jpeg, .png y .webp',
      )
      .optional()
      .or(z.undefined()),
    signature: z
      .instanceof(File, { message: 'La firma es obligatoria' })
      .refine((file) => file?.size <= MAX_FILE_SIZE, 'El archivo debe ser menor a 5MB')
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
        'Solo se aceptan archivos .jpg, .jpeg, .png y .webp',
      )
      .optional()
      .or(z.undefined()),
  })
  .refine((data) => data.logo instanceof File, {
    message: 'El logo es obligatorio',
    path: ['logo'],
  })
  .refine((data) => data.signature instanceof File, {
    message: 'La firma es obligatoria',
    path: ['signature'],
  });

// Tipo para el formulario con campos opcionales durante la edición
type FormData = {
  signerFullName: string;
  signerTitle: string;
  logo?: File;
  signature?: File;
};

function CertificateUploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  // Get organization ID from query parameters
  const organizationId = searchParams.get('id');

  const {
    activeCourse,
    isLoading: isLoadingCourses,
    error: courseError,
    isInitialized,
  } = useCourse();

  // Query to fetch organization data
  const {
    data: organizationData,
    isLoading: isLoadingOrganization,
    error: organizationError,
  } = useQuery({
    queryKey: ['organization', activeCourse?.id, organizationId],
    queryFn: () => {
      if (!activeCourse?.id || !organizationId) throw new Error('Missing required parameters');
      return apiService.getOrganizationWithinCourse(activeCourse.id, organizationId);
    },
    enabled: !!activeCourse?.id && !!organizationId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      signerFullName: '',
      signerTitle: '',
      logo: undefined,
      signature: undefined,
    },
    mode: 'onChange',
  });

  // Mutation to upload certificate info
  const uploadCertificateInfoMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!activeCourse || !organizationId) {
        throw new Error('No hay un curso activo seleccionado o ID de organización');
      }

      // Validar que los archivos estén presentes
      if (!data.logo || !data.signature) {
        throw new Error('Los archivos de logo y firma son obligatorios');
      }

      const formData = new FormData();
      formData.append('signerFullName', data.signerFullName.trim());
      formData.append('signerTitle', data.signerTitle.trim());
      formData.append('logo', data.logo);
      formData.append('signature', data.signature);

      return apiService.uploadOrganizationCertificateInfo(organizationId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      router.push('/dashboard/organizations/');
    },
    onError: (error: Error) => {
      console.error('Error uploading certificate info:', error);
    },
  });

  const onSubmit = (data: FormData) => {
    uploadCertificateInfoMutation.mutate(data);
  };

  const handleFileChange = (
    file: File | undefined,
    field: 'logo' | 'signature',
    onChange: (file: File | undefined) => void,
  ) => {
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'logo') {
          setLogoPreview(reader.result as string);
        } else {
          setSignaturePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      onChange(undefined);
      if (field === 'logo') {
        setLogoPreview(null);
      } else {
        setSignaturePreview(null);
      }
    }
  };

  const removeFile = (field: 'logo' | 'signature') => {
    form.setValue(field, undefined);
    if (field === 'logo') {
      setLogoPreview(null);
    } else {
      setSignaturePreview(null);
    }
    form.trigger(field);
  };

  // Validación personalizada para verificar si el formulario es válido
  const isFormValid = () => {
    const values = form.getValues();
    return (
      values.signerFullName.trim().length >= 2 &&
      values.signerTitle.trim().length >= 2 &&
      values.logo instanceof File &&
      values.signature instanceof File
    );
  };

  // Loading states
  if (!isInitialized || isLoadingCourses || isLoadingOrganization) {
    return <CertificateUploadSkeleton />;
  }

  if (courseError) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar los cursos. Por favor, recarga la página o contacta al soporte técnico.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (organizationError) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar los datos de la organización. Por favor, recarga la página o contacta al
            soporte técnico.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!activeCourse) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-left justify-between">
            <span>Por favor, selecciona un curso para subir información de certificado.</span>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/courses/')}
              className="ml-4"
            >
              Ver cursos
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ID de organización no encontrado. Por favor, verifica la URL.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Información de Certificado
            </h1>
            <p className="text-muted-foreground">
              Sube la información y archivos necesarios para el certificado de{' '}
              <span className="font-medium">{organizationData?.organizationName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Error de mutación */}
      {uploadCertificateInfoMutation.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {uploadCertificateInfoMutation.error.message ||
              'Error al subir la información del certificado. Por favor, intenta nuevamente.'}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos del Certificado</CardTitle>
          <CardDescription>
            Completa la información del firmante y sube los archivos necesarios para generar el
            certificado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="signerFullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo del Firmante *</FormLabel>
                      <FormDescription>
                        Nombre completo de la persona que firmará el certificado
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="Ej: Juan Carlos Pérez López" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="signerTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo del Firmante *</FormLabel>
                      <FormDescription>
                        Cargo o título de la persona que firmará el certificado
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="Ej: Director General, Gerente de RRHH" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* File Upload Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Logo de la Organización *</FormLabel>
                      <FormDescription>
                        Sube el logo oficial de la organización (máx. 5MB)
                      </FormDescription>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="logo-upload"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                  <span className="font-semibold">Click para subir</span> o arrastra
                                  el archivo
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, JPEG, WEBP (máx. 5MB)
                                </p>
                              </div>
                              <input
                                id="logo-upload"
                                type="file"
                                className="hidden"
                                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  handleFileChange(file, 'logo', onChange);
                                }}
                                {...field}
                              />
                            </label>
                          </div>

                          {logoPreview && (
                            <div className="relative">
                              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <FileImage className="w-8 h-8 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{value?.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {value?.size
                                      ? (value.size / 1024 / 1024).toFixed(2) + ' MB'
                                      : ''}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFile('logo')}
                                  className="h-8 w-8"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="mt-2">
                                <img
                                  src={logoPreview}
                                  alt="Logo preview"
                                  className="w-full h-32 object-contain bg-white rounded border"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Signature Upload */}
                <FormField
                  control={form.control}
                  name="signature"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Firma del Firmante *</FormLabel>
                      <FormDescription>
                        Sube la firma digital del firmante (máx. 5MB)
                      </FormDescription>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="signature-upload"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                  <span className="font-semibold">Click para subir</span> o arrastra
                                  el archivo
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, JPEG, WEBP (máx. 5MB)
                                </p>
                              </div>
                              <input
                                id="signature-upload"
                                type="file"
                                className="hidden"
                                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  handleFileChange(file, 'signature', onChange);
                                }}
                                {...field}
                              />
                            </label>
                          </div>

                          {signaturePreview && (
                            <div className="relative">
                              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <FileImage className="w-8 h-8 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{value?.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {value?.size
                                      ? (value.size / 1024 / 1024).toFixed(2) + ' MB'
                                      : ''}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFile('signature')}
                                  className="h-8 w-8"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="mt-2">
                                <img
                                  src={signaturePreview}
                                  alt="Signature preview"
                                  className="w-full h-32 object-contain bg-white rounded border"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={uploadCertificateInfoMutation.isPending || !isFormValid()}
                  className="sm:ml-auto"
                >
                  {uploadCertificateInfoMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Información
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  asChild
                  disabled={uploadCertificateInfoMutation.isPending}
                >
                  <Link href="/dashboard/organizations/">Cancelar</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading skeleton component
function CertificateUploadSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CertificateUploadPage() {
  return (
    <Suspense fallback={<CertificateUploadSkeleton />}>
      <CertificateUploadContent />
    </Suspense>
  );
}
