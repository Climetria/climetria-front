/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Save,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
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
import { ResidencyFields } from '@/components/residency-fields';

const formSchema = z
  .object({
    // Datos Básicos (Paso 1)
    documentType: z.string().min(1, { message: 'El tipo de documento es obligatorio' }),
    document: z.string().min(1, { message: 'El número de documento es obligatorio' }),
    email: z
      .string()
      .email({ message: 'Correo electrónico inválido' })
      .min(1, { message: 'El correo electrónico es obligatorio' }),
    firstNames: z.string().min(1, { message: 'Los nombres son obligatorios' }),
    lastNameFather: z.string().min(1, { message: 'El apellido paterno es obligatorio' }),
    lastNameMother: z.string().min(1, { message: 'El apellido materno es obligatorio' }),
    gender: z.string().min(1, { message: 'El género es obligatorio' }),
    phone: z.string().min(1, { message: 'El celular/WhatsApp es obligatorio' }),
    country: z.string().min(1, { message: 'El país es obligatorio' }),
    countrySelector: z.string().optional(), // <- new field for country selector (UI purposes only)
    department: z.string().optional(),
    // Datos Adicionales (Paso 2)
    universityName: z.string().min(1, { message: 'La universidad es obligatoria' }),
    majorInProgress: z.string().min(1, { message: 'La carrera en curso es obligatoria' }),
    graduationYear: z.string().min(1, { message: 'El año de graduación es obligatorio' }),
    referralSource: z
      .string()
      .min(1, { message: 'Selecciona cómo te enteraste de la convocatoria' }),
    topicsOfInterest: z
      .array(z.string())
      .min(1, { message: 'Selecciona al menos un programa de interés' }),
  })
  .superRefine((data, ctx) => {
    if (data.country === 'Peru' && !data.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El departamento es obligatorio si el país es Perú',
        path: ['peruDepartment'],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const steps = [
  {
    id: 'basic-info',
    title: 'Datos Básicos',
    description: 'Información personal del pasante',
    icon: User,
  },
  {
    id: 'additional-info',
    title: 'Datos Adicionales',
    description: 'Información académica y preferencias',
    icon: GraduationCap,
  },
];

interface InternFormProps {
  mode: 'create' | 'edit';
  internId?: string;
}

const departments = [
  { label: 'Amazonas', value: 'AMAZONAS' },
  { label: 'Áncash', value: 'ANCASH' },
  { label: 'Apurímac', value: 'APURIMAC' },
  { label: 'Arequipa', value: 'AREQUIPA' },
  { label: 'Ayacucho', value: 'AYACUCHO' },
  { label: 'Cajamarca', value: 'CAJAMARCA' },
  { label: 'Callao', value: 'CALLAO' },
  { label: 'Cusco', value: 'CUSCO' },
  { label: 'Huancavelica', value: 'HUANCAVELICA' },
  { label: 'Huánuco', value: 'HUANUCO' },
  { label: 'Ica', value: 'ICA' },
  { label: 'Junín', value: 'JUNIN' },
  { label: 'La Libertad', value: 'LA_LIBERTAD' },
  { label: 'Lambayeque', value: 'LAMBAYEQUE' },
  { label: 'Lima', value: 'LIMA' },
  { label: 'Loreto', value: 'LORETO' },
  { label: 'Madre de Dios', value: 'MADRE_DE_DIOS' },
  { label: 'Moquegua', value: 'MOQUEGUA' },
  { label: 'Pasco', value: 'PASCO' },
  { label: 'Piura', value: 'PIURA' },
  { label: 'Puno', value: 'PUNO' },
  { label: 'San Martín', value: 'SAN_MARTIN' },
  { label: 'Tacna', value: 'TACNA' },
  { label: 'Tumbes', value: 'TUMBES' },
  { label: 'Ucayali', value: 'UCAYALI' },
];

export function InternForm({ mode, internId }: InternFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  const {
    activeCourse,
    isLoading: isLoadingCourses,
    error: courseError,
    isInitialized,
  } = useCourse();

  // Query to fetch intern data when editing
  const {
    data: internData,
    isLoading: isLoadingIntern,
    error: internError,
  } = useQuery({
    queryKey: ['intern', activeCourse?.id, internId],
    queryFn: () => {
      if (!activeCourse?.id || !internId) throw new Error('Missing required parameters');
      return apiService.getInternWithinCourse(activeCourse.id, internId);
    },
    enabled: mode === 'edit' && !!activeCourse?.id && !!internId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: 'DNI',
      document: '',
      email: '',
      firstNames: '',
      lastNameFather: '',
      lastNameMother: '',
      gender: '',
      phone: '',
      country: 'Perú',
      countrySelector: 'Perú',
      department: '',
      universityName: '',
      majorInProgress: '',
      graduationYear: '',
      referralSource: '',
      topicsOfInterest: [],
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && internData) {
      // Transform department from API format to form format
      const transformedDepartment = internData.peruDepartment
        ? departments.find((d) => d.value === internData.peruDepartment)?.value || ''
        : '';

      const formData = {
        documentType: internData.documentType,
        document: internData.document,
        email: internData.email,
        firstNames: internData.firstNames,
        lastNameFather: internData.lastNameFather,
        lastNameMother: internData.lastNameMother,
        gender: internData.gender,
        phone: internData.phone,
        country: internData.country,
        countrySelector:
          internData.country === 'Peru' ? 'Perú' : internData.country === 'Perú' ? 'Perú' : 'Otros',
        department: transformedDepartment,
        universityName: internData.universityName,
        majorInProgress: internData.majorInProgress,
        graduationYear: internData.graduationYear.toString(),
        referralSource: internData.referralSource,
        topicsOfInterest: internData.topicsOfInterest,
      };

      // Set form values
      Object.entries(formData).forEach(([key, value]) => {
        form.setValue(key as keyof FormValues, value as any);
      });

      form.trigger();
    }
  }, [internData, mode, form]);

  // Mutation for creating/updating the intern
  const createOrUpdateInternMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!activeCourse) {
        throw new Error('No hay un curso activo seleccionado');
      }

      console.log('Form data before sending:', data);

      const internData = {
        documentType: data.documentType as 'DNI' | 'CE' | 'PASSPORT',
        document: data.document.trim(),
        email: data.email.trim(),
        firstNames: data.firstNames.trim(),
        lastNameFather: data.lastNameFather.trim(),
        lastNameMother: data.lastNameMother.trim(),
        gender: data.gender as 'MALE' | 'FEMALE' | 'I_PREFER_NOT_TO_SAY_IT',
        phone: data.phone.trim(),
        country: data.countrySelector === 'Otros' ? data.country : data.countrySelector,
        peruDepartment:
          data.countrySelector === 'Perú' && data.department ? data.department : undefined,
        universityName: data.universityName.trim(),
        majorInProgress: data.majorInProgress as
          | 'ENVIRONMENTAL_ENGINEERING'
          | 'FOREST_ENGINEERING'
          | 'BIOLOGY'
          | 'ENVIRONMENTAL_MANAGEMENT'
          | 'OTHERS',
        graduationYear: Number.parseInt(data.graduationYear),
        referralSource: data.referralSource,
        topicsOfInterest: data.topicsOfInterest,
      };

      console.log('Intern data to send:', internData);

      if (mode === 'edit' && internId) {
        return apiService.updateInternWithinCourse(activeCourse.id, internId, internData);
      } else {
        return apiService.createInternWithinCourse(activeCourse.id, internData);
      }
    },
    onSuccess: (data) => {
      console.log(`Intern ${mode === 'edit' ? 'updated' : 'created'} successfully:`, data);
      queryClient.invalidateQueries({ queryKey: ['interns'] });
      router.push('/dashboard/interns');
    },
    onError: (error: Error) => {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} intern:`, error);
    },
  });

  const onSubmit = (data: FormValues) => {
    createOrUpdateInternMutation.mutate(data);
  };

  const nextStep = async () => {
    const fieldsToValidate =
      currentStep === 0
        ? [
            'documentType',
            'document',
            'email',
            'firstNames',
            'lastNameFather',
            'lastNameMother',
            'gender',
            'phone',
            'country',
            'peruDepartment',
          ]
        : [
            'universityName',
            'majorInProgress',
            'graduationYear',
            'referralSource',
            'topicsOfInterest',
          ];

    const isStepValid = await form.trigger(fieldsToValidate as any);
    if (isStepValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Loading states
  if (!isInitialized || isLoadingCourses || (mode === 'edit' && isLoadingIntern)) {
    return <InternFormSkeleton />;
  }

  // Error al cargar cursos
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

  if (internError) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar los datos del pasante. Por favor, recarga la página o contacta al
            soporte técnico.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No hay curso activo
  if (!activeCourse) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Por favor, selecciona un curso para {mode === 'create' ? 'registrar' : 'editar'} un
              pasante.
            </span>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/courses')}
              className="ml-4"
            >
              Ver cursos
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {mode === 'create' ? 'Registrar Pasante' : 'Editar Pasante'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'create'
            ? 'Registra un nuevo pasante en el sistema'
            : 'Modifica los datos del pasante'}
        </p>
      </div>

      {/* Layout principal con sidebar minimalista */}
      <div className="flex gap-8">
        {/* Steps Sidebar - Más compacto */}
        <div className="w-1/4 min-w-[160px] flex flex-col gap-6">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-8 ml-4 mt-2 ${isCompleted ? 'bg-primary' : 'bg-muted'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Main Content - Ocupa 3/4 del espacio */}
        <div className="flex-1">
          {/* Error de mutación */}
          {createOrUpdateInternMutation.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {createOrUpdateInternMutation.error.message ||
                  `Error al ${mode === 'edit' ? 'actualizar' : 'registrar'} el pasante. Por favor, intenta nuevamente.`}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <StepIcon className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                  <CardDescription>{currentStepData.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-6">
                  {currentStep === 0 && <BasicInfoStep form={form} />}
                  {currentStep === 1 && <AdditionalInfoStep form={form} />}

                  {/* Navigation Buttons - FUERA del form */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                    <div className="flex gap-4">
                      {currentStep > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          disabled={createOrUpdateInternMutation.isPending}
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Anterior
                        </Button>
                      )}
                      {currentStep < steps.length - 1 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={createOrUpdateInternMutation.isPending}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={
                            createOrUpdateInternMutation.isPending || !form.formState.isValid
                          }
                          onClick={() => form.handleSubmit(onSubmit)()}
                        >
                          {createOrUpdateInternMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {mode === 'edit' ? 'Actualizando...' : 'Registrando...'}
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {mode === 'edit' ? 'Actualizar Pasante' : 'Registrar Pasante'}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      asChild
                      className="sm:ml-auto"
                      disabled={createOrUpdateInternMutation.isPending}
                    >
                      <Link href="/dashboard/interns">Cancelar</Link>
                    </Button>
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
function InternFormSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="flex gap-8">
        {/* Steps Sidebar Skeleton */}
        <div className="w-1/4 min-w-[160px] flex flex-col gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex flex-col items-start">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              {i < 1 && <Skeleton className="w-0.5 h-8 ml-4 mt-2" />}
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5" />
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componente para la primera sección - Datos Básicos
function BasicInfoStep({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  return (
    <div className="space-y-6">
      {/* Email y Nombres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico *</FormLabel>
              <FormControl>
                <Input placeholder="correo@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstNames"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombres *</FormLabel>
              <FormControl>
                <Input placeholder="Nombres" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Apellidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="lastNameFather"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido Paterno *</FormLabel>
              <FormControl>
                <Input placeholder="Apellido Paterno" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastNameMother"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido Materno *</FormLabel>
              <FormControl>
                <Input placeholder="Apellido Materno" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Documento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Documento *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                  <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="document"
          render={({ field }) => {
            const documentType = form.watch('documentType');
            const placeholders = {
              DNI: '12345678 (8 dígitos)',
              CE: '123456789876 (min. 12 dígitos)',
              PASSPORT: 'AB1234567',
            };
            return (
              <FormItem>
                <FormLabel>Número de Documento *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      placeholders[documentType as keyof typeof placeholders] || 'Ingrese número'
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>

      {/* Género y Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Género *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MALE" id="male" />
                    <Label htmlFor="male">Masculino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FEMALE" id="female" />
                    <Label htmlFor="female">Femenino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="I_PREFER_NOT_TO_SAY_IT" id="prefer-not-to-say" />
                    <Label htmlFor="prefer-not-to-say">Prefiero no decirlo</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Celular / WhatsApp *</FormLabel>
              <FormControl>
                <Input placeholder="+51 999 123 456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Residency */}
      <ResidencyFields control={form.control} setValue={form.setValue} />
    </div>
  );
}

// Componente para la segunda sección - Datos Adicionales
function AdditionalInfoStep({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  return (
    <div className="space-y-6">
      {/* Universidad y Carrera */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="universityName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Universidad *</FormLabel>
              <FormControl>
                <Input placeholder="Universidad Nacional Agraria La Molina" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="majorInProgress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrera en curso *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu carrera" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ENVIRONMENTAL_ENGINEERING">Ingeniería Ambiental</SelectItem>
                  <SelectItem value="FOREST_ENGINEERING">Ingeniería Forestal</SelectItem>
                  <SelectItem value="BIOLOGY">Biología</SelectItem>
                  <SelectItem value="ENVIRONMENTAL_MANAGEMENT">Gestión Ambiental</SelectItem>
                  <SelectItem value="OTHERS">Otros</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Profesión y Año de graduación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="graduationYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Año de egreso *</FormLabel>
              <FormControl>
                <Input placeholder="2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Cómo se enteró */}
      <FormField
        control={form.control}
        name="referralSource"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>¿Cómo te enteraste de la convocatoria? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="redes-sociales" id="redes" />
                  <Label htmlFor="redes">Redes sociales de Climetría</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recomendacion" id="recomendacion" />
                  <Label htmlFor="recomendacion">Recomendación de ex-alumno/a</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ceia-unalm" id="ceia" />
                  <Label htmlFor="ceia">CEIA UNALM</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="otros" id="otros" />
                  <Label htmlFor="otros">Otros</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Programas de Interés */}
      <FormField
        control={form.control}
        name="topicsOfInterest"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel>Selecciona uno o más programas que sean de tu interés *</FormLabel>
              <FormDescription>
                Nota: Solo es posible hacer la pasantía en un eje temático a la vez, pero puedes
                dejar tus preferencias aquí.
              </FormDescription>
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="topicsOfInterest"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes('CN')}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, 'CN'])
                              : field.onChange(field.value?.filter((value) => value !== 'CN'));
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>CN - Carbono Neutralidad (ISO 14068)</FormLabel>
                      </div>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="topicsOfInterest"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes('HC')}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, 'HC'])
                              : field.onChange(field.value?.filter((value) => value !== 'HC'));
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>HC - Huella de Carbono y Cambio Climático</FormLabel>
                      </div>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="topicsOfInterest"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes('HH')}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, 'HH'])
                              : field.onChange(field.value?.filter((value) => value !== 'HH'));
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>HH - Huella Hídrica y Gestión Responsable del Agua</FormLabel>
                      </div>
                    </FormItem>
                  );
                }}
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
