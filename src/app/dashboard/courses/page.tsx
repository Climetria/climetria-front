'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  BookMarked,
  Calendar,
  User,
  Loader2,
} from 'lucide-react';
import { apiService, type Course, type Intern, type Mentor, type Organization } from '@/lib/api';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [mentors /*setMentors*/] = useState<Mentor[]>([]);
  const [interns /*setInterns*/] = useState<Intern[]>([]);
  const [organizations /*setOrganizations*/] = useState<Organization[]>([]);

  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getAllCourses();
        setCourses(data);
      } catch (err) {
        setError('No se pudieron cargar los cursos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const handleViewDetail = (course: Course) => {
    setSelectedCourse(course);
    setIsDetailOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      setIsDeleting(true);
      await apiService.deleteCourse(courseToDelete.id);
      setCourses(courses.filter((c) => c.id !== courseToDelete.id));
      toast.success('Curso eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting course:', err);
      toast.error('Error al eliminar el curso');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      {error && <p className="text-destructive">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription>{course.year}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetail(course)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalle
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/courses/${course.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteCourse(course)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{course.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCourseToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        description={
          courseToDelete && (
            <>
              Esta acción no se puede deshacer. Esto eliminará el curso{' '}
              <strong>
                {courseToDelete.name} ({courseToDelete.year})
              </strong>
              {}
              y removerá todos sus datos del sistema.
              <br />
              <br />
              <span className="text-amber-600 font-medium">
                ⚠️ Advertencia: También se eliminarán todos los mentores, pasantes y organizaciones
                asociados a este curso.
              </span>
            </>
          )
        }
        confirmButtonText="Eliminar curso"
        title="¿Estás seguro de eliminar este curso?"
      />

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className={`w-[800px] sm:w-[800px] overflow-y-auto`}>
          {selectedCourse && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5" />
                  {selectedCourse.name}
                </SheetTitle>
                <SheetDescription>Información detallada del curso</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Course Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{selectedCourse.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Año: {selectedCourse.year}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Organizations Assigned */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Organizaciones Asignadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCourse.organizationIds && selectedCourse.organizationIds.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCourse.organizationIds.map((organizationId, index) => {
                          const organization = organizations.find((i) => i.id === organizationId);
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-muted rounded"
                            >
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {organization
                                  ? `${organization.organizationName}`
                                  : `ID de la Organización: ${organizationId}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No hay organizaciones asignadas
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Mentors Assigned */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mentores Asignados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCourse.mentorIds && selectedCourse.mentorIds.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCourse.mentorIds.map((mentorId, index) => {
                          const mentor = mentors.find((m) => m.id === mentorId);
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-muted rounded"
                            >
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {mentor
                                  ? `${mentor.firstNames} ${mentor.lastNameFather} ${mentor.lastNameMother}`
                                  : `ID del Mentor: ${mentorId}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay mentores asignados</p>
                    )}
                  </CardContent>
                </Card>

                {/* Interns Assigned */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pasantes Asignados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCourse.internIds && selectedCourse.internIds.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCourse.internIds.map((internId, index) => {
                          const intern = interns.find((i) => i.id === internId);
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-muted rounded"
                            >
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {intern
                                  ? `${intern.firstNames} ${intern.lastNameFather} ${intern.lastNameMother}`
                                  : `Intern ID: ${internId}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay pasantes asignados</p>
                    )}
                  </CardContent>
                </Card>

                {/* Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Adicional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Fecha de registro:</span>{' '}
                      {new Date(selectedCourse.createdAt).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Última actualización:</span>{' '}
                      {new Date(selectedCourse.updatedAt).toLocaleDateString('es-ES')}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
