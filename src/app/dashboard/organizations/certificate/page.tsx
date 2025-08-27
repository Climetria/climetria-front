'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Save,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Upload,
  FileImage,
  X,
  Edit3,
  Eye,
  Camera,
  User,
} from 'lucide-react';
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  signerFullName: z
    .string()
    .min(1, { message: 'El nombre completo del firmante es obligatorio' })
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  signerTitle: z
    .string()
    .min(1, { message: 'El cargo del firmante es obligatorio' })
    .min(2, { message: 'El cargo debe tener al menos 2 caracteres' }),
  logo: z
    .instanceof(File)
    .refine((file) => file?.size <= MAX_FILE_SIZE, 'El archivo debe ser menor a 5MB')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      'Solo se aceptan archivos .jpg, .jpeg, .png y .webp',
    )
    .optional(),
  signature: z
    .instanceof(File)
    .refine((file) => file?.size <= MAX_FILE_SIZE, 'El archivo debe ser menor a 5MB')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      'Solo se aceptan archivos .jpg, .jpeg, .png y .webp',
    )
    .optional(),
});

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [existingSignatureUrl, setExistingSignatureUrl] = useState<string | null>(null);
  const [hasLoadedExistingData, setHasLoadedExistingData] = useState(false);

  const organizationId = searchParams.get('id');
  const {
    activeCourse,
    isLoading: isLoadingCourses,
    error: courseError,
    isInitialized,
  } = useCourse();

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

  useEffect(() => {
    if (organizationData && !hasLoadedExistingData) {
      const hasExistingData =
        organizationData.signerFullName ||
        organizationData.signerTitle ||
        organizationData.logoUrl ||
        organizationData.signerSignatureUrl;
      if (!hasExistingData) {
        setIsEditMode(true);
      }

      if (organizationData.signerFullName) {
        form.setValue('signerFullName', organizationData.signerFullName);
      }
      if (organizationData.signerTitle) {
        form.setValue('signerTitle', organizationData.signerTitle);
      }
      if (organizationData.logoUrl) {
        setExistingLogoUrl(organizationData.logoUrl);
      }
      if (organizationData.signerSignatureUrl) {
        setExistingSignatureUrl(organizationData.signerSignatureUrl);
      }

      setHasLoadedExistingData(true);
    }
  }, [organizationData, hasLoadedExistingData, form]);

  const uploadCertificateInfoMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!activeCourse || !organizationId) {
        throw new Error('No hay un curso activo seleccionado o ID de organización');
      }

      const hasExistingLogo = existingLogoUrl;
      const hasExistingSignature = existingSignatureUrl;

      if (!data.logo && !hasExistingLogo) {
        throw new Error('El logo es obligatorio');
      }

      if (!data.signature && !hasExistingSignature) {
        throw new Error('La firma es obligatoria');
      }

      const formData = new FormData();
      formData.append('signerFullName', data.signerFullName.trim());
      formData.append('signerTitle', data.signerTitle.trim());

      if (data.logo) {
        formData.append('logo', data.logo);
      }
      if (data.signature) {
        formData.append('signature', data.signature);
      }

      return apiService.uploadOrganizationCertificateInfo(organizationId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setIsEditMode(false);
      setLogoPreview(null);
      setSignaturePreview(null);
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

  const isFormValid = () => {
    const values = form.getValues();
    const hasValidText =
      values.signerFullName.trim().length >= 2 && values.signerTitle.trim().length >= 2;
    const hasValidLogo = values.logo instanceof File || existingLogoUrl;
    const hasValidSignature = values.signature instanceof File || existingSignatureUrl;

    return hasValidText && hasValidLogo && hasValidSignature;
  };

  const renderImageContainer = (
    field: 'logo' | 'signature',
    label: string,
    existingImageUrl: string | null,
    preview: string | null,
    value: File | undefined,
    onChange: (file: File | undefined) => void,
    isLogo = false,
  ) => {
    const inputId = `${field}-upload`;
    const currentImage = preview || existingImageUrl;
    const hasImage = !!currentImage;

    return (
      <div className="space-y-3">
        <label className="text-sm font-medium">{label} *</label>
        <div
          className={`relative ${isLogo ? 'aspect-[3/2]' : 'aspect-square'} w-full max-w-[200px] mx-auto bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden group`}
        >
          {hasImage ? (
            <>
              <img
                src={currentImage || '/placeholder.svg'}
                alt={label}
                className="w-full h-full object-contain bg-white"
              />
              {isEditMode && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => document.getElementById(inputId)?.click()}
                      className="bg-white/90 hover:bg-white text-black"
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      Cambiar
                    </Button>
                    {preview && (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFile(field)}
                        className="bg-red-500/90 hover:bg-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              {isLogo ? <FileImage className="h-8 w-8 mb-2" /> : <User className="h-8 w-8 mb-2" />}
              <span className="text-xs text-center px-2">
                {isEditMode ? 'Click para subir' : 'Sin imagen'}
              </span>
              {isEditMode && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => document.getElementById(inputId)?.click()}
                  className="mt-2 h-8 text-xs"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Subir
                </Button>
              )}
            </div>
          )}
        </div>
        <input
          id={inputId}
          type="file"
          className="hidden"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleFileChange(file, field, onChange);
          }}
          disabled={!isEditMode}
        />
        {preview && value && (
          <div className="text-xs text-center text-gray-500">
            {value.name} • {(value.size / 1024 / 1024).toFixed(1)} MB
          </div>
        )}
      </div>
    );
  };

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
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Información de Certificado
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? 'Editando' : 'Información de'} certificado de{' '}
              <span className="font-medium">{organizationData?.organizationName}</span>
            </p>
          </div>
          {!isEditMode && (
            <Button variant="outline" onClick={() => setIsEditMode(true)} className="ml-auto">
              <Edit3 className="h-4 w-4 mr-2" />
              Editar información
            </Button>
          )}
        </div>
      </div>

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Datos del Certificado</CardTitle>
              <CardDescription>
                {isEditMode
                  ? 'Completa la información del firmante y sube los archivos necesarios'
                  : 'Información actual del certificado'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isEditMode ? (
                <>
                  <Edit3 className="h-4 w-4" />
                  Editando
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Solo lectura
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <Input
                          placeholder="Ej: Juan Carlos Pérez López"
                          {...field}
                          disabled={!isEditMode}
                          className={!isEditMode ? 'bg-gray-50' : ''}
                        />
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
                        <Input
                          placeholder="Ej: Director General, Gerente de RRHH"
                          {...field}
                          disabled={!isEditMode}
                          className={!isEditMode ? 'bg-gray-50' : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field: { onChange, value } }) => (
                    <FormItem>
                      <FormControl>
                        {renderImageContainer(
                          'logo',
                          'Logo de la Organización',
                          existingLogoUrl,
                          logoPreview,
                          value,
                          onChange,
                          true,
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="signature"
                  render={({ field: { onChange, value } }) => (
                    <FormItem>
                      <FormControl>
                        {renderImageContainer(
                          'signature',
                          'Firma del Firmante',
                          existingSignatureUrl,
                          signaturePreview,
                          value,
                          onChange,
                          false,
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isEditMode && (
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={uploadCertificateInfoMutation.isPending || !isFormValid()}
                    className="sm:ml-auto"
                  >
                    {uploadCertificateInfoMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsEditMode(false);
                      setLogoPreview(null);
                      setSignaturePreview(null);
                      form.reset();
                      if (organizationData?.signerFullName) {
                        form.setValue('signerFullName', organizationData.signerFullName);
                      }
                      if (organizationData?.signerTitle) {
                        form.setValue('signerTitle', organizationData.signerTitle);
                      }
                    }}
                    disabled={uploadCertificateInfoMutation.isPending}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

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
