 
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  UserCheck,
  Globe,
  IdCard,
  AlertCircle,
  Loader2,
  UserPlus,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCourse } from '@/context/CourseContext';
import { apiService, type Mentor } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

// Modular components
import { PaginationControls } from '@/components/data-table/pagination-controls';
import { useFilteredPagination } from '@/hooks/use-filtered-pagination';
import { SearchWithFilters } from '@/components/data-table/search-filters';
import { getDocTypeLabel } from '@/lib/helper-functions';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

const mentorFilterFn = (mentor: Mentor, searchTerm: string, filters: Record<string, string>) => {
  const matchesSearch =
    mentor.firstNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.lastNameFather.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.lastNameMother.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.country.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesStatus =
    filters.status === 'all' ||
    (filters.status === 'assigned' && mentor.organizationStatus === 'assigned') ||
    (filters.status === 'unassigned' && mentor.organizationStatus === 'unassigned');

  return matchesSearch && matchesStatus;
};

export default function MentorsExplorePage() {
  const { activeCourse } = useCourse();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [mentorToDelete, setMentorToDelete] = useState<Mentor | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const isMobile = useIsMobile();

  // Use filtered pagination hook
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    paginatedData: paginatedMentors,
    //filteredData: filteredMentors,
    totalItems,
  } = useFilteredPagination({
    data: mentors,
    itemsPerPage: 10,
    searchTerm,
    filters: { status: selectedStatus },
    filterFn: mentorFilterFn,
  });

  useEffect(() => {
    const fetchMentors = async () => {
      if (!activeCourse) {
        setMentors([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const mentorsData = await apiService.getAllMentorsWithinCourse(activeCourse.id);
        setMentors(mentorsData);
      } catch (err) {
        console.error('Error fetching mentors:', err);
        setError('Error al cargar los mentores. Por favor, intenta nuevamente.');
        setMentors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, [activeCourse]);

  const handleViewDetail = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsDetailOpen(true);
  };

  const handleDeleteMentor = (mentor: Mentor) => {
    setMentorToDelete(mentor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!mentorToDelete || !activeCourse) return;

    try {
      setIsDeleting(true);
      await apiService.deleteMentorWithinCourse(activeCourse.id, mentorToDelete.id);
      setMentors(mentors.filter((m) => m.id !== mentorToDelete.id));
      toast.success('Mentor eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting mentor:', err);
      toast.error('Error al eliminar el mentor');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setMentorToDelete(null);
    }
  };

  if (!activeCourse) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, selecciona un curso para ver los mentores asociados.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusFilters = [
    {
      value: selectedStatus,
      onChange: setSelectedStatus,
      placeholder: 'Estado',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'assigned', label: 'Asignados' },
        { value: 'unassigned', label: 'No asignados' },
      ],
    },
  ];

  const actions = (
    <>
      <Button asChild className="w-full sm:w-auto">
        <Link href="/dashboard/mentors/create">
          <UserCheck className="h-4 w-4 mr-2" />
          Registrar Mentor
        </Link>
      </Button>
    </>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Mentores</h1>
          <p className="text-muted-foreground">
            Administra todos los mentores asignados al curso: <strong>{activeCourse.name}</strong>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <SearchWithFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar mentores..."
          filters={statusFilters}
          actions={actions}
        />
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Mentores</CardTitle>
          <CardDescription>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando mentores...
              </div>
            ) : (
              <>
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} mentor
                {totalItems !== 1 ? 'es' : ''}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : paginatedMentors.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {mentors.length === 0
                  ? 'No hay mentores asignados a este curso.'
                  : 'No se encontraron mentores con los criterios de búsqueda.'}
              </p>
            </div>
          ) : isMobile ? (
            // Cards for mobile view
            <div className="space-y-4">
              {paginatedMentors.map((mentor) => (
                <Card key={mentor.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">
                        {mentor.firstNames} {mentor.lastNameFather} {mentor.lastNameMother}
                      </h3>
                      <p className="text-xs text-muted-foreground">{mentor.email}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(mentor)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/mentors/${mentor.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteMentor(mentor)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{mentor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{mentor.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IdCard className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">
                        {getDocTypeLabel(mentor.documentType)}: {mentor.document}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            // Table for desktop view
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMentors.map((mentor) => (
                  <TableRow key={mentor.id}>
                    <TableCell className="font-medium">
                      {mentor.firstNames} {mentor.lastNameFather} {mentor.lastNameMother}
                    </TableCell>
                    <TableCell>{mentor.email}</TableCell>
                    <TableCell>{mentor.phone}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{getDocTypeLabel(mentor.documentType)}</div>
                        <div className="text-muted-foreground">{mentor.document}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetail(mentor)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/mentors/${mentor.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteMentor(mentor)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          startIndex={startIndex}
          endIndex={endIndex}
        />
      </Card>

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className={`${isMobile ? 'w-full' : 'w-[600px] sm:w-[800px]'}`}>
          {selectedMentor && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  {selectedMentor.firstNames} {selectedMentor.lastNameFather}{' '}
                  {selectedMentor.lastNameMother}
                </SheetTitle>
                <SheetDescription>Información detallada del mentor</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedMentor.firstNames} {selectedMentor.lastNameFather}{' '}
                        {selectedMentor.lastNameMother}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedMentor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedMentor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedMentor.peruDepartment
                          ? `${selectedMentor.peruDepartment}, ${selectedMentor.country}`
                          : selectedMentor.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IdCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {getDocTypeLabel(selectedMentor.documentType)}: {selectedMentor.document}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Adicional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Fecha de registro:</span>{' '}
                      {new Date(selectedMentor.createdAt).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Última actualización:</span>{' '}
                      {new Date(selectedMentor.updatedAt).toLocaleDateString('es-ES')}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMentorToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        description={
          mentorToDelete && (
            <>
              Esta acción no se puede deshacer. Esto eliminará al mentor{' '}
              <strong>
                {mentorToDelete.firstNames} {mentorToDelete.lastNameFather}{' '}
                {mentorToDelete.lastNameMother}
              </strong>{' '}
              y removerá todos sus datos del sistema.
            </>
          )
        }
        confirmButtonText="Eliminar mentor"
      />
    </div>
  );
}
