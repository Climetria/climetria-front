'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2, Save, Edit } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { useCourse } from '@/context/CourseContext';
import { useState, useEffect } from 'react';
import { apiService, type Mentor } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ResidencyFields } from '@/components/residency-fields';
import { toast } from 'sonner';
import { LoadingCardContent } from './loading-card-content';

const formSchema = z
  .object({
    email: z
      .string()
      .email({ message: 'Correo electrónico inválido' })
      .min(1, { message: 'El correo electrónico es obligatorio' }),
    firstNames: z.string().min(1, { message: 'Los nombres son obligatorios' }),
    paternalLastName: z.string().min(1, { message: 'El apellido paterno es obligatorio' }),
    maternalLastName: z.string().min(1, { message: 'El apellido materno es obligatorio' }),
    phone: z.string().min(1, { message: 'El celular/WhatsApp es obligatorio' }),
    documentType: z.string().min(1, { message: 'El tipo de documento es obligatorio' }),
    documentNumber: z.string().min(1, { message: 'El número de documento es obligatorio' }),
    country: z.string().min(1, { message: 'El país es obligatorio' }),
    countrySelector: z.string().optional(),
    department: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.country === 'Perú' && !data.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El departamento es obligatorio si el país es Perú',
        path: ['department'],
      });
    }
    if (data.country === 'Otros') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes especificar el nombre del país',
        path: ['country'],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface MentorFormProps {
  mode: 'create' | 'edit';
  mentorId?: string;
  initialData?: Partial<Mentor>;
  onSuccess?: () => void;
}

export function MentorForm({ mode, mentorId, initialData, onSuccess }: MentorFormProps) {
  const router = useRouter();
  const { activeCourse } = useCourse();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(mode === 'edit');
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: 'DNI',
      documentNumber: '',
      email: '',
      firstNames: '',
      paternalLastName: '',
      maternalLastName: '',
      phone: '',
      country: 'Perú',
      countrySelector: 'Perú',
      department: '',
    },
  });

  // Load mentor data for edit mode
  useEffect(() => {
    const loadMentorData = async () => {
      if (mode === 'edit' && mentorId && activeCourse) {
        try {
          setIsLoadingData(true);
          setError(null);
          const mentor = await apiService.getMentorWithinCourse(activeCourse.id, mentorId);

          // Transform mentor data to form format
          const formData: Partial<FormValues> = {
            email: mentor.email,
            firstNames: mentor.firstNames,
            paternalLastName: mentor.lastNameFather,
            maternalLastName: mentor.lastNameMother,
            phone: mentor.phone,
            documentType: mentor.documentType,
            documentNumber: mentor.document,
            country: mentor.country,
            countrySelector: mentor.country === 'Perú' ? 'Perú' : 'Otros',
            department: mentor.peruDepartment, // Mantener el formato original (MAYÚSCULAS con _)
          };

          // Reset form with loaded data
          form.reset(formData);
        } catch (err) {
          console.error('Error loading mentor data:', err);
          if (err instanceof Error && err.message.includes('404')) {
            setError('El mentor no fue encontrado. Puede que haya sido eliminado.');
          } else {
            setError('Error al cargar los datos del mentor. Por favor, intenta nuevamente.');
          }
        } finally {
          setIsLoadingData(false);
        }
      } else if (initialData) {
        // Use provided initial data
        const formData: Partial<FormValues> = {
          email: initialData.email,
          firstNames: initialData.firstNames,
          paternalLastName: initialData.lastNameFather,
          maternalLastName: initialData.lastNameMother,
          phone: initialData.phone,
          documentType: initialData.documentType,
          documentNumber: initialData.document,
          country: initialData.country,
          countrySelector: initialData.country,
          department: initialData.peruDepartment?.toLowerCase().replace(/_/g, ' '),
        };
        form.reset(formData);
        setIsLoadingData(false);
      } else if (mode === 'edit') {
        setIsLoadingData(false);
        setError('ID de mentor no proporcionado.');
      }
    };

    loadMentorData();
  }, [mode, mentorId, activeCourse, initialData, form]);

  const onSubmit = async (data: FormValues) => {
    if (!activeCourse) {
      setError('No hay un curso activo seleccionado.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const mentorData = {
        phone: data.phone,
        lastNameFather: data.paternalLastName,
        lastNameMother: data.maternalLastName,
        documentType: data.documentType as 'DNI' | 'CE' | 'PASSPORT',
        document: data.documentNumber.trim(),
        email: data.email.trim(),
        country: data.country,
        firstNames: data.firstNames,
        peruDepartment:
          data.country === 'Perú' ? data.department?.toUpperCase().replace(/ /g, '_') : undefined,
      };

      if (mode === 'create') {
        await apiService.createMentorWithinCourse(activeCourse.id, mentorData);
        toast.success('Mentor registrado exitosamente');
      } else if (mode === 'edit' && mentorId) {
        await apiService.updateMentorWithinCourse(activeCourse.id, mentorId, mentorData);
        toast.success('Mentor actualizado exitosamente');
      }

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/mentors');
      }
    } catch (err: unknown) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} mentor:`, err);
      let errorMessage = `Error al ${mode === 'create' ? 'registrar' : 'actualizar'} el mentor. Por favor, intenta nuevamente.`;

      if (err instanceof Error && err.message.includes('400')) {
        errorMessage = 'Los datos enviados no son válidos. Por favor, revisa todos los campos.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeCourse) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Por favor, selecciona un curso para {mode === 'create' ? 'registrar' : 'editar'} un
          mentor.
        </AlertDescription>
      </Alert>
    );
  }

  const titles = {
    create: {
      main: 'Registrar Mentor',
      description: 'Registra un nuevo mentor en el sistema',
      card: 'Información del Mentor',
      cardDescription: 'Completa todos los datos del mentor',
    },
    edit: {
      main: 'Editar Mentor',
      description: 'Actualiza la información del mentor',
      card: 'Actualizar Información',
      cardDescription: 'Modifica los datos del mentor',
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{titles[mode].main}</h1>
          <p className="text-muted-foreground">{titles[mode].description}</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{titles[mode].card}</CardTitle>
          <CardDescription>{titles[mode].cardDescription}</CardDescription>
        </CardHeader>

        {isLoadingData ? (
          <LoadingCardContent type="mentor" />
        ) : (
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Información Personal */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paternalLastName"
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
                    name="maternalLastName"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                    name="documentNumber"
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
                                placeholders[documentType as keyof typeof placeholders] ||
                                'Ingrese número'
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {mode === 'create' ? 'Registrando...' : 'Actualizando...'}
                      </>
                    ) : (
                      <>
                        {mode === 'create' ? (
                          <Save className="h-4 w-4 mr-2" />
                        ) : (
                          <Edit className="h-4 w-4 mr-2" />
                        )}
                        {mode === 'create' ? 'Registrar Mentor' : 'Actualizar Mentor'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="sm:flex-1 bg-transparent"
                  >
                    <Link href="/dashboard/mentors">Cancelar</Link>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
