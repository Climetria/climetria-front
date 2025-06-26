'use client';

import Link from 'next/link';
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
import { AlertCircle, Save } from 'lucide-react';
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
import { useCourse } from '@/context/CourseContext';
import { useState } from 'react';
import { apiService } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { ResidencyFields } from '@/components/residency-fields';

const formSchema = z
  .object({
    email: z
      .string()
      .email({ message: 'Correo electrónico inválido' })
      .min(1, { message: 'El correo electrónico es obligatorio' }),
    firstName: z.string().min(1, { message: 'Los nombres son obligatorios' }),
    paternalLastName: z.string().min(1, { message: 'El apellido paterno es obligatorio' }),
    maternalLastName: z.string().min(1, { message: 'El apellido materno es obligatorio' }),
    phone: z.string().min(1, { message: 'El celular/WhatsApp es obligatorio' }),
    documentType: z.string().min(1, { message: 'El tipo de documento es obligatorio' }),
    documentNumber: z.string().min(1, { message: 'El número de documento es obligatorio' }),
    university: z.string().min(1, { message: 'La universidad es obligatoria' }),
    profession: z.string().min(1, { message: 'La profesión estudiada es obligatoria' }),
    graduationYear: z.string().optional(),
    howDidYouKnow: z
      .string()
      .min(1, { message: 'Selecciona cómo te enteraste de la convocatoria' }),
    programs: z.array(z.string()).min(1, { message: 'Selecciona al menos un programa de interés' }),
    country: z.string().min(1, { message: 'El país es obligatorio' }),
    countrySelector: z.string().optional(), // <- new field for country selector (UI purposes only)
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

export default function CreateInternPage() {
  const router = useRouter();
  const { activeCourse } = useCourse();
  const [, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      firstName: '',
      paternalLastName: '',
      maternalLastName: '',
      phone: '',
      documentType: 'DNI',
      documentNumber: '',
      university: '',
      profession: '',
      graduationYear: '',
      howDidYouKnow: '',
      programs: [],
      country: 'Perú',
      countrySelector: 'Perú',
      department: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!activeCourse) {
      setError('No hay un curso activo seleccionado.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const internData = {
        phone: data.phone,
        lastNameFather: data.paternalLastName,
        lastNameMother: data.maternalLastName,
        documentType: data.documentType as 'DNI' | 'CE' | 'PASSPORT',
        document: data.documentNumber.trim(),
        email: data.email.trim(),
        country: data.country,
        firstNames: data.firstName.trim(),
        universityName: data.university.trim(),
        profession: data.profession.trim(),
        graduationYear: data.graduationYear ? parseInt(data.graduationYear) : undefined,
        referralSource: data.howDidYouKnow,
        topicsOfInterest: data.programs,
        peruDepartment:
          data.country === 'Perú' ? data.department?.toUpperCase().replace(/ /g, '_') : undefined,
      };
      console.log('Datos a enviar:', internData);
      console.log('Course ID:', activeCourse.id);

      await apiService.createInternWithinCourse(activeCourse.id, internData);

      router.push('/dashboard/interns');
    } catch (err: unknown) {
      console.error('Error creating intern:', err);

      let errorMessage = 'Error al registrar el pasante. Por favor, intenta nuevamente.';

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
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, selecciona un curso para registrar un mentor.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Registrar Pasante</h1>
          <p className="text-muted-foreground">Registra un nuevo pasante en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Pasante</CardTitle>
          <CardDescription>Completa todos los datos del pasante</CardDescription>
        </CardHeader>
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
                  name="firstName"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="university"
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
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profesión estudiada o en curso *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingeniería Ambiental" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Información Académica */}
              <FormField
                control={form.control}
                name="graduationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año de egreso (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Residency */}
              <ResidencyFields control={form.control} setValue={form.setValue} />

              {/* Cómo se enteró */}
              <FormField
                control={form.control}
                name="howDidYouKnow"
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
                name="programs"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Selecciona uno o más programas que sean de tu interés *</FormLabel>
                      <FormDescription>
                        Nota: Solo es posible hacer la pasantía en un eje temático a la vez, pero
                        puedes dejar tus preferencias aquí.
                      </FormDescription>
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="programs"
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
                                <FormLabel>CN - Carbono Neutralidad (ISO 14068)</FormLabel>
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="programs"
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
                        name="programs"
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
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1 cursor-pointer">
                  <Save className="h-4 w-4 mr-2" />
                  Registrar Pasante
                </Button>
                <Button type="button" variant="outline" asChild className="sm:flex-1">
                  <Link href="/dashboard/interns">Cancelar</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
