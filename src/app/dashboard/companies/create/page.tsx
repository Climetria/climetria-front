'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
import { Save, Loader2, AlertCircle } from 'lucide-react';
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
  ruc: z.string().min(1, { message: 'El RUC es obligatorio' }),
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
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateCompanyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
      country: 'Peru',
      organizationName: '',
      organizationSize: 'SMALL',
      sector: '',
      topicsOfInterest: [],
    },
  });

  // Mutation para crear empresa
  const createCompanyMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!activeCourse) {
        throw new Error('No hay un curso activo seleccionado');
      }

      const companyData = {
        ruc: data.ruc.trim(),
        email: data.email.trim(),
        contactName: data.contactName.trim(),
        phone: data.phone.trim(),
        country: data.country,
        organizationName: data.organizationName.trim(),
        organizationSize: data.organizationSize,
        sector: data.sector,
        topicsOfInterest: data.topicsOfInterest,
      };

      return apiService.createCompany(activeCourse.id, companyData);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['companies'] });

      router.push('/dashboard/companies');
    },
    onError: (error: Error) => {
      console.error('Error creating company:', error);
    },
  });

  const onSubmit = (data: FormValues) => {
    createCompanyMutation.mutate(data);
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
            <span>Por favor, selecciona un curso para registrar una empresa.</span>
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

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Registrar Empresa</h1>
          <p className="text-muted-foreground">Registra una nueva empresa en el sistema</p>
        </div>
      </div>

      {/* Error de mutación */}
      {createCompanyMutation.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {createCompanyMutation.error.message ||
              'Error al registrar la empresa. Por favor, intenta nuevamente.'}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información de la Empresa</CardTitle>
          <CardDescription>Completa todos los datos de la empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          <SelectItem value="Perú">Perú</SelectItem>
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
                                      : field.onChange(
                                          field.value?.filter((value) => value !== 'HC'),
                                        );
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
                                      : field.onChange(
                                          field.value?.filter((value) => value !== 'HH'),
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  HH - Huella Hídrica y Gestión Responsable del Agua
                                </FormLabel>
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
                                      : field.onChange(
                                          field.value?.filter((value) => value !== 'CN'),
                                        );
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

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createCompanyMutation.isPending || !form.formState.isValid}
                >
                  {createCompanyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Registrar Empresa
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="sm:flex-1"
                  //disabled={isLoading}
                >
                  <Link href="/dashboard/companies">Cancelar</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
