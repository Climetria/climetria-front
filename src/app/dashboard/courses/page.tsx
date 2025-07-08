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
  Loader2,
} from 'lucide-react';
import {
  apiService,
  OrganizationWithFilter,
  type Course,
  type Intern,
  type Mentor,
} from '@/lib/api';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { DetailSection } from '@/components/course-detail';
import { useIsMobile } from '@/hooks/use-mobile';

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationWithFilter[]>([]);
  const isMobile = useIsMobile();

  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function fetchDetailData() {
      if (!selectedCourse?.id) return;

      setDetailLoading(true);
      try {
        const [mentorsData, internsData, orgsData] = await Promise.all([
          apiService.getAllMentorsWithinCourse(selectedCourse.id),
          apiService.getAllInternsWithinCourse(selectedCourse.id),
          apiService.getAllOrganizationsWithinCourse(selectedCourse.id),
        ]);
        setMentors(mentorsData);
        setInterns(internsData);
        setOrganizations(orgsData);
      } catch (err) {
        console.error('Error al cargar detalles del curso:', err);
      } finally {
        setDetailLoading(false);
      }
    }

    fetchDetailData();
  }, [selectedCourse]);

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
                  <CardDescription>{course.description}</CardDescription>
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
                      <Link href={`/dashboard/courses/edit?id=${course.id}`}>
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
              <p className="text-muted-foreground text-sm">Fecha de Inicio: {course.startDate}</p>
              <p className="text-muted-foreground text-sm">Fecha de Fin: {course.endDate}</p>
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
                {courseToDelete.name} ({courseToDelete.startDate})
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
        <SheetContent
          className={`${isMobile ? 'w-full' : 'w-[800px] sm:w-[800px]'} overflow-y-auto p-5`}
        >
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
                      <span className="text-sm">Fecha de Inicio: {selectedCourse.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Fecha de Fin: {selectedCourse.endDate}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Organizations Assigned */}
                <DetailSection
                  title="Organizaciones Asignadas"
                  loading={detailLoading}
                  type="organization"
                  ids={selectedCourse?.organizationIds || []}
                  data={organizations}
                />

                {/* Mentors Assigned */}
                <DetailSection
                  title="Mentores Asignados"
                  loading={detailLoading}
                  type="mentor"
                  ids={selectedCourse?.mentorIds || []}
                  data={mentors}
                />

                {/* Interns Assigned */}
                <DetailSection
                  title="Pasantes Asignados"
                  loading={detailLoading}
                  type="intern"
                  ids={selectedCourse?.internIds || []}
                  data={interns}
                />

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
