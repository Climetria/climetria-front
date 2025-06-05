"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash2} from "lucide-react"

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const courses = [
    {
      id: 1,
      name: "Gestión Ambiental y Desarrollo Sostenible 2024",
      startDate: "2024-03-01",
      endDate: "2024-08-31",
      status: "active",
      coursesCount: 5,
      internsCount: 25,
      companiesCount: 8,
    },
    {
      id: 2,
      name: "Evaluación de Impacto Ambiental 2024",
      startDate: "2024-04-15",
      endDate: "2024-09-15",
      status: "active",
      coursesCount: 4,
      internsCount: 18,
      companiesCount: 6,
    },
    {
      id: 3,
      name: "Tratamiento de Aguas y Residuos 2023",
      startDate: "2023-09-01",
      endDate: "2024-02-28",
      status: "completed",
      coursesCount: 3,
      internsCount: 15,
      companiesCount: 5,
    },
  ]

  const filteredCourses = courses.filter((course) => course.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Cursos</h1>
          <p className="text-muted-foreground">Administra todos los cursos de pasantías</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard/courses/create">
            <Plus className="h-4 w-4 mr-2" />
            Crear Curso
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription>
                    {new Date(course.startDate).toLocaleDateString()} -{" "}
                    {new Date(course.endDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/courses/${course.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalle
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/courses/${course.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deshabilitar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Badge variant={course.status === "active" ? "default" : "secondary"}>
                {course.status === "active" ? "Activo" : "Completado"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg">{course.coursesCount}</div>
                  <div className="text-muted-foreground">Cursos</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{course.internsCount}</div>
                  <div className="text-muted-foreground">Pasantes</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{course.companiesCount}</div>
                  <div className="text-muted-foreground">Empresas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
