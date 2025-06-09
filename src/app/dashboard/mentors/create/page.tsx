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
import { AlertCircle, Loader2, Save } from 'lucide-react';
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
import { useState } from 'react';
import { apiService } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
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
  department: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateMentorPage() {
  const router = useRouter();
  const { activeCourse } = useCourse();
  const [isLoading, setIsLoading] = useState(false);
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
      country: 'Peru',
      department: '',
    },
  });

  const watchCountry = form.watch('country');
  const departments = [
    { label: 'Amazonas', value: 'AMAZONAS' },
    { label: 'Ancash', value: 'ANCASH' },
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
    { label: 'Lima Metropolitana', value: 'LIMA_METROPOLITANA' },
    { label: 'Lima Provincias', value: 'LIMA_PROVINCIAS' },
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

  const onSubmit = async (data: FormValues) => {
    if (!activeCourse) {
      setError('No hay un curso activo seleccionado.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Preparar los datos para enviar, asegurándonos de que solo incluimos los campos necesarios
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
      console.log('Datos a enviar:', mentorData);
      console.log('Course ID:', activeCourse.id);

      await apiService.createMentor(activeCourse.id, mentorData);

      // Redirect to the mentors list after successful creation
      router.push('/dashboard/mentors');
    } catch (err: unknown) {
      console.error('Error creating mentor:', err);

      let errorMessage = 'Error al registrar el mentor. Por favor, intenta nuevamente.';

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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Registrar Mentor</h1>
          <p className="text-muted-foreground">Registra un nuevo mentor en el sistema</p>
        </div>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del Mentor</CardTitle>
          <CardDescription>Completa todos los datos del mentor</CardDescription>
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
                  name="firstNames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres *</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Carlos" {...field} />
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
                        <Input placeholder="Pérez" {...field} />
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
                        <Input placeholder="García" {...field} />
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Documento *</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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

              {/* Ubicación */}
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
                          <SelectItem value="Otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchCountry === 'Perú' && (
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento de residencia</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un departamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((d) => (
                              <SelectItem key={d.value} value={d.value}>
                                {d.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Registrar Mentor
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild className="sm:flex-1">
                  <Link href="/dashboard/mentors">Cancelar</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
