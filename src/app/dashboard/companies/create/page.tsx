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
  fullName: z.string().min(1, { message: "El nombre y apellido son obligatorios" }),
  phone: z.string().min(1, { message: "El teléfono es obligatorio" }),
  country: z.string().min(1, { message: "El país es obligatorio" }),
  organization: z.string().min(1, { message: "La organización es obligatoria" }),
  organizationSize: z.enum(["Micro o pequeña", "Mediana o grande"]),
  sector: z.string().min(1, { message: "El sector es obligatorio" }),
  thematicAxes: z.array(z.string()).min(1, { message: "Selecciona al menos un eje temático" }),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateCompanyPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      country: "Perú",
      organization: "",
      organizationSize: "Micro o pequeña",
      sector: "",
      thematicAxes: [],
    },
  })

  const onSubmit = (data: FormValues) => {
    console.log("Datos del formulario:", data)
    // Aquí iría la lógica para enviar los datos
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Registrar Empresa</h1>
          <p className="text-muted-foreground">Registra una nueva empresa en el sistema</p>
        </div>
      </div>

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
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre y Apellido *</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez" {...field} />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organización *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de la organización" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            <RadioGroupItem value="Micro o pequeña" id="micro" />
                            <Label htmlFor="micro">Micro o pequeña</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Mediana o grande" id="mediana" />
                            <Label htmlFor="mediana">Mediana o grande</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <FormField
                control={form.control}
                name="thematicAxes"
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
                        name="thematicAxes"
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
                        name="thematicAxes"
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
                      <FormField
                        control={form.control}
                        name="thematicAxes"
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
                                <FormLabel>CN - Carbono Neutralidad</FormLabel>
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
                  Registrar Empresa
                </Button>
                <Button type="button" variant="outline" asChild className="sm:flex-1">
                  <Link href="/dashboard/companies">Cancelar</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
