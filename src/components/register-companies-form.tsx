'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Mail, Phone, Globe, FileText, Users, Target } from 'lucide-react';

// Validación de RUC peruano (11 dígitos que comienzan con 10 o 20)
const isValidRUC = (value: string) => {
  return /^(10|20)\d{9}$/.test(value);
};

// Esquema de validación con Zod
const formSchema = z
  .object({
    email: z.string().email({ message: 'Ingrese un correo electrónico válido' }),
    nombreCompleto: z.string().min(3, { message: 'Ingrese su nombre completo' }),
    celular: z.string().min(9, { message: 'Ingrese un número de celular válido' }),
    pais: z.string().min(1, { message: 'Seleccione un país' }),
    paisOtro: z.string().optional(),
    organizacion: z.string().min(2, { message: 'Ingrese el nombre de la organización' }),
    ruc: z.string().refine(isValidRUC, {
      message: 'Ingrese un RUC válido (11 dígitos que comienzan con 10 o 20)',
    }),
    tamanoOrganizacion: z.enum(['micro_pequena', 'mediana_grande'], {
      message: 'Seleccione el tamaño de la organización',
    }),
    sector: z.string().min(1, { message: 'Seleccione un sector' }),
    sectorOtro: z.string().optional(),
    ejesTematicos: z.array(z.string()).min(1, {
      message: 'Seleccione al menos un eje temático',
    }),
  })
  .refine(
    (data) => {
      if (data.pais === 'otro' && !data.paisOtro?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Especifique el país cuando selecciona 'Otros'",
      path: ['paisOtro'],
    },
  )
  .refine(
    (data) => {
      if (data.sector === 'otro' && !data.sectorOtro?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Especifique el sector cuando selecciona 'Otros'",
      path: ['sectorOtro'],
    },
  );

type FormValues = z.infer<typeof formSchema>;

export function RegistroEmpresaForm() {
  // Definir los ejes temáticos disponibles
  const ejesTematicos = [
    {
      id: 'hc',
      label: 'Huella de Carbono y Cambio Climático',
      code: 'HC',
      description: 'Medición y reducción de emisiones de CO2',
    },
    {
      id: 'hh',
      label: 'Huella Hídrica y Gestión Responsable del Agua',
      code: 'HH',
      description: 'Optimización del uso del recurso hídrico',
    },
    {
      id: 'cn',
      label: 'Carbono Neutralidad',
      code: 'CN',
      description: 'Compensación total de emisiones de carbono',
    },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      nombreCompleto: '',
      celular: '',
      pais: '',
      paisOtro: '',
      organizacion: '',
      ruc: '',
      tamanoOrganizacion: undefined,
      sector: '',
      sectorOtro: '',
      ejesTematicos: [],
    },
  });

  const { watch, handleSubmit } = form;
  const paisSeleccionado = watch('pais');
  const sectorSeleccionado = watch('sector');

  const onSubmit = (data: FormValues) => {
    console.log('Form data:', data);
  };

  return (
    <div className="space-y-8 pl-4 md:pl-6 lg:pl-8">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Información de Contacto
              </CardTitle>
              <CardDescription>Ingrese sus datos personales de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico *</FormLabel>
                      <FormControl>
                        <Input placeholder="correo@ejemplo.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nombreCompleto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre y apellido *</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez González" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="celular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Celular / WhatsApp *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+51 999 999 999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        País *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un país" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="peru">🇵🇪 Perú</SelectItem>
                          <SelectItem value="otro">🌍 Otros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {paisSeleccionado === 'otro' && (
                  <FormField
                    control={form.control}
                    name="paisOtro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especifique el país *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del país" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información de la Organización */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Información de la Organización
              </CardTitle>
              <CardDescription>Detalles sobre su empresa u organización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="organizacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la organización *</FormLabel>
                        <FormControl>
                          <Input placeholder="Empresa SAC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ruc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          RUC *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="20123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tamanoOrganizacion"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Tamaño de la organización *
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                            <FormControl>
                              <RadioGroupItem value="micro_pequena" />
                            </FormControl>
                            <div className="flex-1">
                              <FormLabel className="font-normal cursor-pointer">
                                Micro o pequeña empresa
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Hasta 100 trabajadores
                              </p>
                            </div>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                            <FormControl>
                              <RadioGroupItem value="mediana_grande" />
                            </FormControl>
                            <div className="flex-1">
                              <FormLabel className="font-normal cursor-pointer">
                                Mediana o grande empresa
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Más de 100 trabajadores
                              </p>
                            </div>
                          </FormItem>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un sector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="publico">🏛️ Sector Público</SelectItem>
                          <SelectItem value="privado">🏢 Sector Privado</SelectItem>
                          <SelectItem value="sociedad_civil">🤝 Sociedad Civil</SelectItem>
                          <SelectItem value="otro">📋 Otros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {sectorSeleccionado === 'otro' && (
                  <FormField
                    control={form.control}
                    name="sectorOtro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especifique el sector *</FormLabel>
                        <FormControl>
                          <Input placeholder="Tipo de sector" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ejes Temáticos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Ejes Temáticos de Interés
              </CardTitle>
              <CardDescription>
                Seleccione las áreas de sostenibilidad que son relevantes para su organización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="ejesTematicos"
                render={() => (
                  <FormItem>
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                      {ejesTematicos.map((eje) => (
                        <FormField
                          key={eje.id}
                          control={form.control}
                          name="ejesTematicos"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={eje.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(eje.id)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...(field.value || []), eje.id]
                                        : field.value?.filter((value) => value !== eje.id) || [];
                                      field.onChange(updatedValue);
                                    }}
                                  />
                                </FormControl>
                                <div className="grid gap-1.5 leading-none flex-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {eje.code}
                                    </Badge>
                                    <FormLabel className="font-medium cursor-pointer">
                                      {eje.label}
                                    </FormLabel>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{eje.description}</p>
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
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end">
            <Button type="submit" className="w-full sm:w-auto">
              Registrar empresa
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
