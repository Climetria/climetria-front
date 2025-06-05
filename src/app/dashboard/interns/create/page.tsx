"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Correo electrónico inválido" })
    .min(1, { message: "El correo electrónico es obligatorio" }),
  firstName: z.string().min(1, { message: "Los nombres son obligatorios" }),
  paternalLastName: z.string().min(1, { message: "El apellido paterno es obligatorio" }),
  maternalLastName: z.string().min(1, { message: "El apellido materno es obligatorio" }),
  phone: z.string().min(1, { message: "El celular/WhatsApp es obligatorio" }),
  documentType: z.string().min(1, { message: "El tipo de documento es obligatorio" }),
  documentNumber: z.string().min(1, { message: "El número de documento es obligatorio" }),
  university: z.string().min(1, { message: "La universidad es obligatoria" }),
  profession: z.string().min(1, { message: "La profesión estudiada es obligatoria" }),
  graduationYear: z.string().optional(),
  howDidYouKnow: z.string().min(1, { message: "Selecciona cómo te enteraste de la convocatoria" }),
  programs: z.array(z.string()).min(1, { message: "Selecciona al menos un programa de interés" }),
  country: z.string().min(1, { message: "El país es obligatorio" }),
  department: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateInternPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      paternalLastName: "",
      maternalLastName: "",
      phone: "",
      documentType: "",
      documentNumber: "",
      university: "",
      profession: "",
      graduationYear: "",
      howDidYouKnow: "",
      programs: [],
      country: "Perú",
      department: "",
    },
  })

  const watchCountry = form.watch("country")

  const departments = [
    "Amazonas",
    "Áncash",
    "Apurímac",
    "Arequipa",
    "Ayacucho",
    "Cajamarca",
    "Callao",
    "Cusco",
    "Huancavelica",
    "Huánuco",
    "Ica",
    "Junín",
    "La Libertad",
    "Lambayeque",
    "Lima",
    "Loreto",
    "Madre de Dios",
    "Moquegua",
    "Pasco",
    "Piura",
    "Puno",
    "San Martín",
    "Tacna",
    "Tumbes",
    "Ucayali",
  ]

  const onSubmit = (data: FormValues) => {
    console.log("Datos del pasante:", data)
    // Aquí iría la lógica para enviar los datos
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
                          <SelectItem value="Pasaporte">Pasaporte</SelectItem>
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

                {watchCountry === "Perú" && (
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
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
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
                        Nota: Solo es posible hacer la pasantía en un eje temático a la vez, pero puedes dejar tus
                        preferencias aquí.
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
                                  checked={field.value?.includes("CN")}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, "CN"])
                                      : field.onChange(field.value?.filter((value) => value !== "CN"))
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>CN - Carbono Neutralidad (ISO 14068)</FormLabel>
                              </div>
                            </FormItem>
                          )
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
                                  checked={field.value?.includes("HC")}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, "HC"])
                                      : field.onChange(field.value?.filter((value) => value !== "HC"))
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>HC - Huella de Carbono y Cambio Climático</FormLabel>
                              </div>
                            </FormItem>
                          )
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
                                  checked={field.value?.includes("HH")}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, "HH"])
                                      : field.onChange(field.value?.filter((value) => value !== "HH"))
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>HH - Huella Hídrica y Gestión Responsable del Agua</FormLabel>
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Registrar Pasante
                </Button>
                <Button type="button" variant="outline" asChild className="sm:flex-1">
                  <Link href="/interns">Cancelar</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
