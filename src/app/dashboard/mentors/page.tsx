/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { apiService, type Mentor, type Organization } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

// Modular components
import { AssignmentModal } from '@/components/assignment/assignment-modal';
import { UnassignmentModal } from '@/components/assignment/unassignment-modal';
import { PaginationControls } from '@/components/data-table/pagination-controls';
import { StatusBadge } from '@/components/status-badge';
import { useFilteredPagination } from '@/hooks/use-filtered-pagination';
import { mentorAssignmentConfig, mentorUnassignmentConfig } from '@/config/mentor-assignment';
import { SearchWithFilters } from '@/components/data-table/search-filters';
import { getDocTypeLabel } from '@/lib/helper-functions';

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

export default function MentorsPageModular() {
  const { activeCourse } = useCourse();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [companies, setCompanies] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCompaniesLoading, setIsCompaniesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Assignment modal states
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState<boolean>(false);
  const [isUnassignmentModalOpen, setIsUnassignmentModalOpen] = useState<boolean>(false);
  const [mentorToAssign, setMentorToAssign] = useState<Mentor | null>(null);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

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
        const mentorsData = await apiService.getMentors(activeCourse.id);
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

  // Fetch companies when needed for assignment
  const fetchCompanies = async () => {
    if (!activeCourse || companies.length > 0) return;

    try {
      setIsCompaniesLoading(true);
      const companiesData = await apiService.getCompanies(activeCourse.id);
      setCompanies(companiesData);
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setIsCompaniesLoading(false);
    }
  };

  const handleAssignMentor = (mentor: Mentor) => {
    setMentorToAssign(mentor);
    setIsAssignmentModalOpen(true);
    fetchCompanies();
  };

  const handleUnassignMentor = (mentor: Mentor) => {
    setMentorToAssign(mentor);
    setIsUnassignmentModalOpen(true);
  };

  const handleConfirmAssignment = async (companyId: string) => {
    if (!mentorToAssign || !activeCourse) return;

    const selectedCompany = companies.find((company) => company.id === companyId);
    if (!selectedCompany) {
      toast.error('La empresa seleccionada no existe o no está disponible');
      return;
    }

    try {
      setIsAssigning(true);

      // Call the API to assign the mentor to a company
      await apiService.assignMentorToOrganization(activeCourse.id, mentorToAssign.id, companyId);

      // Fetch updated mentor from the API
      const updatedMentor = await apiService.getMentor(activeCourse.id, mentorToAssign.id);

      // Update local state with the refreshed mentor
      setMentors((prevMentors) =>
        prevMentors.map((mentor) => (mentor.id === updatedMentor.id ? updatedMentor : mentor)),
      );

      setIsAssignmentModalOpen(false);
      setMentorToAssign(null);
      toast.success('Mentor asignado exitosamente');
    } catch (err) {
      console.error('Error assigning mentor:', err);
      toast.error('Error al asignar el mentor');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleConfirmUnassignment = async () => {
    if (!mentorToAssign || !activeCourse) return;

    // Get the first organization ID to remove (assuming single assignment for now)
    const organizationId = mentorToAssign.organizationIds?.[0];
    if (!organizationId) {
      toast.error('No se encontró una asignación para remover');
      return;
    }

    try {
      setIsAssigning(true);

      // Call the API to unassign the mentor
      await apiService.removeMentorFromCompany(activeCourse.id, organizationId, mentorToAssign.id);

      // Refetch updated mentor from the API
      const updatedMentor = await apiService.getMentor(activeCourse.id, mentorToAssign.id);

      // Update local state with the refreshed mentor
      setMentors((prevMentors) =>
        prevMentors.map((mentor) => (mentor.id === updatedMentor.id ? updatedMentor : mentor)),
      );

      setIsUnassignmentModalOpen(false);
      setMentorToAssign(null);
      toast.success('Mentor desasignado exitosamente');
    } catch (err) {
      console.error('Error unassigning mentor:', err);
      toast.error('Error al desasignar el mentor');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleViewDetail = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsDetailOpen(true);
  };

  const handleDeleteMentor = async (mentor: Mentor) => {
    if (!activeCourse) return;

    if (
      confirm(
        `¿Estás seguro de que quieres eliminar al mentor "${mentor.firstNames} ${mentor.lastNameFather} ${mentor.lastNameMother}"?`,
      )
    ) {
      try {
        await apiService.deleteMentor(activeCourse.id, mentor.id);
        setMentors(mentors.filter((m) => m.id !== mentor.id));
        toast.success('Mentor eliminado exitosamente');
      } catch (err) {
        console.error('Error deleting mentor:', err);
        toast.error('Error al eliminar el mentor');
      }
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
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        entity={mentor}
                        status={(mentor as any).organizationStatus || 'unassigned'}
                        onAssign={handleAssignMentor}
                        onUnassign={handleUnassignMentor}
                      />
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

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setMentorToAssign(null);
        }}
        assignee={mentorToAssign}
        assignableEntities={companies}
        onAssign={handleConfirmAssignment}
        isLoading={isCompaniesLoading || isAssigning}
        config={mentorAssignmentConfig}
      />

      {/* Unassignment Modal */}
      <UnassignmentModal
        isOpen={isUnassignmentModalOpen}
        onClose={() => {
          setIsUnassignmentModalOpen(false);
          setMentorToAssign(null);
        }}
        entity={mentorToAssign}
        onUnassign={handleConfirmUnassignment}
        isLoading={isAssigning}
        config={mentorUnassignmentConfig}
      />

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
    </div>
  );
}
