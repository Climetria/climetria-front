/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
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
  Building2,
  Settings,
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
import { useMutation, useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
  ruc: z
    .string()
    .min(11, { message: 'El RUC debe tener 11 dígitos' })
    .max(11, { message: 'El RUC debe tener 11 dígitos' }),
  email: z
    .string()
    .email({ message: 'Correo electrónico inválido' })
    .min(1, { message: 'El correo electrónico es obligatorio' }),
  contactName: z.string().min(1, { message: 'El nombre y apellido son obligatorios' }),
  phone: z.string().min(1, { message: 'El teléfono es obligatorio' }),
  country: z.string().min(1, { message: 'El país es obligatorio' }),
  organizationName: z.string().min(1, { message: 'La organización es obligatoria' }),
  organizationSize: z.enum(['SMALL', 'LARGE']),
  sector: z.string().min(1, { message: 'El sector es obligatorio' }),
  topicsOfInterest: z.array(z.string()).min(1, { message: 'Selecciona al menos un eje temático' }),
  maximumNumberOfInterns: z
    .number()
    .min(1, { message: 'El número máximo de internos es obligatorio' }),
  placeOfResidenceFilter: z
    .string()
    .min(1, { message: 'El filtro por lugar de residencia es obligatorio' }),
  studiedMajorFilter: z.array(z.string()).min(1, { message: 'Selecciona al menos una carrera' }),
  genderFilter: z.array(z.string()).min(1, { message: 'Selecciona al menos una opción de género' }),
});

type FormValues = z.infer<typeof formSchema>;

const steps = [
  {
    id: 'basic-info',
    title: 'Datos Básicos',
    description: 'Información esencial de la organización',
    icon: Building2,
  },
  {
    id: 'preferences',
    title: 'Preferencias',
    description: 'Configuración de filtros para internos',
    icon: Settings,
  },
];

export default function CreateOrganizationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  const {
    activeCourse,
    isLoading: isLoadingCourses,
    error: courseError,
    isInitialized,
  } = useCourse();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ruc: '',
      email: '',
      contactName: '',
      phone: '',
      country: '',
      organizationName: '',
      organizationSize: 'SMALL',
      sector: '',
      topicsOfInterest: [],
      maximumNumberOfInterns: undefined,
      placeOfResidenceFilter: '',
      studiedMajorFilter: [],
      genderFilter: [],
    },
  });

  // Mutation for creating the organization
  const createOrganizationMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!activeCourse) {
        throw new Error('No hay un curso activo seleccionado');
      }

      console.log('Form data before sending:', data);

      const organizationData = {
        ruc: data.ruc.trim(),
        email: data.email.trim(),
        contactName: data.contactName.trim(),
        phone: data.phone.trim(),
        country: data.country,
        organizationName: data.organizationName.trim(),
        organizationSize: data.organizationSize,
        sector: data.sector,
        topicsOfInterest: data.topicsOfInterest,
        maximumNumberOfInterns: data.maximumNumberOfInterns,
        placeOfResidenceFilter: data.placeOfResidenceFilter,
        studiedMajorFilter: data.studiedMajorFilter,
        genderFilter: data.genderFilter,
      };

      console.log('Organization data to send:', organizationData);

      return apiService.createOrganizationWithinCourse(activeCourse.id, organizationData);
    },
    onSuccess: (data) => {
      console.log('Organization created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      router.push('/dashboard/organizations');
    },
    onError: (error: Error) => {
      console.error('Error creating organization:', error);
    },
  });

  const onSubmit = (data: FormValues) => {
    createOrganizationMutation.mutate(data);
  };

  const nextStep = async () => {
    const fieldsToValidate =
      currentStep === 0
        ? [
            'ruc',
            'email',
            'contactName',
            'phone',
            'country',
            'organizationName',
            'organizationSize',
            'sector',
            'topicsOfInterest',
          ]
        : [
            'maximumNumberOfInterns',
            'placeOfResidenceFilter',
            'studiedMajorFilter',
            'genderFilter',
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

  // Loading skeleton mientras se cargan los cursos
  if (!isInitialized || isLoadingCourses) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
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

  // No hay curso activo
  if (!activeCourse) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Por favor, selecciona un curso para registrar una organización.</span>
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Registrar Organización</h1>
        <p className="text-muted-foreground">Registra una nueva organización en el sistema</p>
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
          {createOrganizationMutation.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {createOrganizationMutation.error.message ||
                  'Error al registrar la organización. Por favor, intenta nuevamente.'}
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
                  {currentStep === 1 && <PreferencesStep form={form} />}

                  {/* Navigation Buttons - FUERA del form */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                    <div className="flex gap-4">
                      {currentStep > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          disabled={createOrganizationMutation.isPending}
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Anterior
                        </Button>
                      )}

                      {currentStep < steps.length - 1 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={createOrganizationMutation.isPending}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={createOrganizationMutation.isPending || !form.formState.isValid}
                          onClick={() => form.handleSubmit(onSubmit)()}
                        >
                          {createOrganizationMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Registrando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Registrar Organización
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
                      disabled={createOrganizationMutation.isPending}
                    >
                      <Link href="/dashboard/organizations">Cancelar</Link>
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

// Componente para la primera sección - Datos Básicos
function BasicInfoStep({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="ruc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RUC *</FormLabel>
              <FormControl>
                <Input placeholder="20123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre y Apellido del Contacto *</FormLabel>
              <FormControl>
                <Input placeholder="Juan Pérez" {...field} />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>País *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un país" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Peru">Perú</SelectItem>
                  <SelectItem value="Colombia">Colombia</SelectItem>
                  <SelectItem value="Ecuador">Ecuador</SelectItem>
                  <SelectItem value="Bolivia">Bolivia</SelectItem>
                  <SelectItem value="Chile">Chile</SelectItem>
                  <SelectItem value="Argentina">Argentina</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organizationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Organización *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de la organización" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="organizationSize"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tamaño de la organización *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SMALL" id="small" />
                    <Label htmlFor="small">Micro o pequeña</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="LARGE" id="large" />
                    <Label htmlFor="large">Mediana o grande</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sector"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sector *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un sector" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Público">Público</SelectItem>
                  <SelectItem value="Privado">Privado</SelectItem>
                  <SelectItem value="Sociedad civil">Sociedad civil</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="topicsOfInterest"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel>
                Selecciona uno o más ejes temáticos que sean de interés de la organización *
              </FormLabel>
              <FormDescription>Selecciona todas las opciones que apliquen</FormDescription>
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
                        <FormLabel>CN - Carbono Neutralidad</FormLabel>
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

// Componente para la segunda sección - Preferencias
function PreferencesStep({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Configuración de Filtros</h3>
        <p className="text-sm text-muted-foreground">
          Estos filtros te ayudarán a encontrar internos que se ajusten mejor a las necesidades de
          tu organización.
        </p>
      </div>

      <FormField
        control={form.control}
        name="maximumNumberOfInterns"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número máximo de internos *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ej: 5"
                value={field.value?.toString() || ''}
                onChange={(e) =>
                  field.onChange(e.target.value ? Number(e.target.value) : undefined)
                }
                required
              />
            </FormControl>
            <FormDescription>
              Especifica el número máximo de internos que tu organización puede recibir
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="placeOfResidenceFilter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Filtro por lugar de residencia *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} required>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un departamento" />
                </SelectTrigger>
              </FormControl>
              {/* TODO: Fetch real values */}
              <SelectContent>
                <SelectItem value="LIMA">Lima</SelectItem>
                <SelectItem value="AREQUIPA">Arequipa</SelectItem>
                <SelectItem value="CUSCO">Cusco</SelectItem>
                <SelectItem value="PIURA">Piura</SelectItem>
                <SelectItem value="LA_LIBERTAD">La Libertad</SelectItem>
                <SelectItem value="LAMBAYEQUE">Lambayeque</SelectItem>
                <SelectItem value="JUNIN">Junín</SelectItem>
                <SelectItem value="ANCASH">Áncash</SelectItem>
                <SelectItem value="ICA">Ica</SelectItem>
                <SelectItem value="CAJAMARCA">Cajamarca</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>Filtra internos por su lugar de residencia</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="studiedMajorFilter"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel>Filtro por carrera estudiada</FormLabel>
              <FormDescription>
                Selecciona las carreras disponibles para los internos
              </FormDescription>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { value: 'ENVIRONMENTAL_ENGINEERING', label: 'Ingeniería Ambiental' },
                { value: 'FOREST_ENGINEERING', label: 'Ingeniería Forestal' },
                { value: 'BIOLOGY', label: 'Biología' },
                { value: 'ENVIRONMENTAL_MANAGEMENT', label: 'Gestión Ambiental' },
                { value: 'OTHERS', label: 'Otros' },
              ].map((major) => (
                <FormField
                  key={major.value}
                  control={form.control}
                  name="studiedMajorFilter"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(major.value)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), major.value])
                                : field.onChange(
                                    field.value?.filter((value) => value !== major.value) || [],
                                  );
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">{major.label}</FormLabel>
                        </div>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="genderFilter"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel>Filtro por género</FormLabel>
              <FormDescription>Selecciona las opciones de género que prefieres</FormDescription>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                { value: 'MALE', label: 'Masculino' },
                { value: 'FEMALE', label: 'Femenino' },
                { value: 'BOTH', label: 'Ambos' },
              ].map((gender) => (
                <FormField
                  key={gender.value}
                  control={form.control}
                  name="genderFilter"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(gender.value)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), gender.value])
                                : field.onChange(
                                    field.value?.filter((value) => value !== gender.value) || [],
                                  );
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">{gender.label}</FormLabel>
                        </div>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
