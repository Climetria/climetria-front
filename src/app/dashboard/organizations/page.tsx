'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Building2,
  Globe,
  Phone,
  Mail,
  User,
  Building,
  Loader2,
  AlertCircle,
  Users,
  GraduationCap,
  PersonStanding,
  MapPin,
  UsersRound,
  Text,
} from 'lucide-react';
import { apiService, type Mentor, type Intern, type OrganizationWithFilter } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCourse } from '@/context/CourseContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

// Modular components
import { PaginationControls } from '@/components/data-table/pagination-controls';
import { usePagination } from '@/hooks/use-pagination';
import { BulkUploadDialog } from '@/components/batch-upload/bulk-upload';
import { SearchAndActions } from '@/components/data-table/search-actions';
import {
  getDepartmentLabel,
  getGenderLabel,
  getMajorLabel,
  getOrganizationSizeLabel,
  getTopicLabel,
} from '@/lib/helper-functions';
import { DynamicAssignmentModal } from '@/components/assignment/dynamic-assignment-modal';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import {
  organizationInternAssignmentConfig,
  organizationMentorAssignmentConfig,
} from '@/config/assignment-config';
import { LoadingListSkeleton } from '@/components/loading-list-skeleton';

// Helper function for filtering organizations
const organizationFilterFn = (organization: OrganizationWithFilter, searchTerm: string) => {
  return (
    organization.organization.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organization.organization.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organization.organization.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organization.organization.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organization.organization.country.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export default function OrganizationsExplorePage() {
  const { activeCourse } = useCourse();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationWithFilter | null>(
    null,
  );
  const [detailInterns, setDetailInterns] = useState<Intern[]>([]);
  const [detailMentors, setDetailMentors] = useState<Mentor[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [organizations, setOrganizations] = useState<OrganizationWithFilter[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [assignedInterns, setAssignedInterns] = useState<Intern[]>([]);
  const [isMentorsLoading, setIsMentorsLoading] = useState<boolean>(false);
  const [isInternsLoading, setIsInternsLoading] = useState<boolean>(false);
  const [mentorsLoaded, setMentorsLoaded] = useState<boolean>(false);
  const [, /*internsLoaded*/ setInternsLoaded] = useState<boolean>(false);
  const isMobile = useIsMobile();

  // Cache for organizations to avoid multiple API calls
  const [allOrganizationsCache, setAllOrganizationsCache] = useState<OrganizationWithFilter[]>([]);

  // Dynamic modal states
  const [isDynamicModalOpen, setIsDynamicModalOpen] = useState<boolean>(false);
  const [organizationForModal, setOrganizationForModal] = useState<OrganizationWithFilter | null>(
    null,
  );
  const [modalType, setModalType] = useState<'mentor' | 'intern'>('mentor');
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<OrganizationWithFilter | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Use pagination hook
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    paginatedData: paginatedOrganizations,
    totalItems,
  } = usePagination<OrganizationWithFilter>({
    data: organizations,
    itemsPerPage: 10,
    searchTerm,
    filterFn: organizationFilterFn,
  });

  // Fetch organizations when active course changes
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!activeCourse) {
        setOrganizations([]);
        setAllOrganizationsCache([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const organizationsData = await apiService.getAllOrganizationsWithinCourse(activeCourse.id);
        setOrganizations(organizationsData);
        setAllOrganizationsCache(organizationsData); // Cache for intern filtering
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError('Error al cargar las organizaciones. Por favor, intenta nuevamente.');
        setOrganizations([]);
        setAllOrganizationsCache([]);
      } finally {
        setIsLoading(false);
        setMentorsLoaded(false);
        setInternsLoaded(false);
      }
    };

    fetchOrganizations();
  }, [activeCourse]);

  // Fetch mentors when needed for assignment
  const fetchMentors = async () => {
    if (!activeCourse || mentorsLoaded) return;

    try {
      setIsMentorsLoading(true);
      const mentorsData = await apiService.getAllMentorsWithinCourse(activeCourse.id);
      setMentors(mentorsData);
      setMentorsLoaded(true);
    } catch (err) {
      console.error('Error fetching mentors:', err);
      toast.error('Error al cargar los mentores');
    } finally {
      setIsMentorsLoading(false);
    }
  };

  const fetchOrganizationDetails = async (organization: OrganizationWithFilter) => {
    if (!activeCourse) return;

    try {
      setIsDetailLoading(true);
      const [interns, mentors] = await Promise.all([
        apiService.getAllOrganizationInternsWithinCourse(
          activeCourse.id,
          organization.organization.id,
        ),
        apiService.getAllOrganizationMentorsWithinCourse(
          activeCourse.id,
          organization.organization.id,
        ),
      ]);
      setDetailInterns(interns);
      setDetailMentors(mentors);
    } catch (err) {
      console.error('Error fetching detail data:', err);
      toast.error('Error al cargar detalles de la organización');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Fetch interns when needed for assignment - UPDATED TO PREVENT DOUBLE ASSIGNMENT
  const fetchInterns = async (organizationId: string) => {
    if (!activeCourse) return;

    try {
      setIsInternsLoading(true);

      // Fetch all interns that match the organization criteria
      const matchingInternsData = await apiService.getInternsMatchingOrganization(
        activeCourse.id,
        organizationId,
      );

      // Fetch currently assigned interns to THIS organization
      const assignedInternsData = await apiService.getAllOrganizationInternsWithinCourse(
        activeCourse.id,
        organizationId,
      );

      // Use cached organizations data or fetch if not available
      const organizationsToCheck =
        allOrganizationsCache.length > 0
          ? allOrganizationsCache
          : await apiService.getAllOrganizationsWithinCourse(activeCourse.id);

      // Create a Set of intern IDs that are already assigned to OTHER organizations
      const internsAssignedToOtherOrgs = new Set<string>();

      organizationsToCheck.forEach((org) => {
        // Skip the current organization we're assigning to
        if (org.organization.id !== organizationId) {
          org.organization.internIds?.forEach((internId) => {
            internsAssignedToOtherOrgs.add(internId);
          });
        }
      });

      // Filter out interns that are already assigned to other organizations
      const availableInterns = matchingInternsData.filter(
        (intern) => !internsAssignedToOtherOrgs.has(intern.id),
      );

      setInterns(availableInterns);
      setAssignedInterns(assignedInternsData);
      setInternsLoaded(true);
    } catch (err) {
      console.error('Error fetching interns:', err);
      toast.error('Error al cargar los pasantes');
    } finally {
      setIsInternsLoading(false);
    }
  };

  // Handle opening the dynamic modal for mentors
  const handleOpenMentorModal = (organization: OrganizationWithFilter) => {
    setOrganizationForModal(organization);
    setModalType('mentor');
    setIsDynamicModalOpen(true);
    fetchMentors();
  };

  // Handle opening the dynamic modal for interns
  const handleOpenInternModal = (organization: OrganizationWithFilter) => {
    setOrganizationForModal(organization);
    setModalType('intern');
    setIsDynamicModalOpen(true);
    fetchInterns(organization.organization.id);
  };

  // Handle mentor assignment
  const handleAssignMentors = async (mentorIds: string[]) => {
    if (!organizationForModal || !activeCourse) return;

    try {
      setIsAssigning(true);
      // For mentors, we only assign one at a time (replace existing)
      for (const mentorId of mentorIds) {
        await apiService.assignMentorToOrganization(
          activeCourse.id,
          mentorId,
          organizationForModal.organization.id,
        );
      }
      await refreshOrganization();
      toast.success('Mentor asignado exitosamente');
    } catch (err) {
      console.error('Error assigning mentor:', err);
      toast.error('Error al asignar el mentor');
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle intern assignment
  const handleAssignInterns = async (internIds: string[]) => {
    if (!organizationForModal || !activeCourse) return;

    try {
      setIsAssigning(true);
      for (const internId of internIds) {
        await apiService.assignInternToOrganization(
          activeCourse.id,
          organizationForModal.organization.id,
          internId,
        );
      }
      await refreshOrganization();
      // Refresh the interns data to update the modal
      await fetchInterns(organizationForModal.organization.id);
      toast.success(
        `${internIds.length} pasante${internIds.length > 1 ? 's asignados' : ' asignado'} exitosamente`,
      );
    } catch (err) {
      console.error('Error assigning interns:', err);
      toast.error('Error al asignar los pasantes');
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle mentor unassignment
  const handleUnassignMentors = async (mentorIds: string[]) => {
    if (!organizationForModal || !activeCourse) return;

    try {
      setIsAssigning(true);
      for (const mentorId of mentorIds) {
        await apiService.removeMentorFromOrganizationWithinCourse(
          activeCourse.id,
          organizationForModal.organization.id,
          mentorId,
        );
      }
      await refreshOrganization();
      toast.success('Mentor desasignado exitosamente');
    } catch (err) {
      console.error('Error unassigning mentor:', err);
      toast.error('Error al desasignar el mentor');
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle intern unassignment
  const handleUnassignInterns = async (internIds: string[]) => {
    if (!organizationForModal || !activeCourse) return;

    try {
      setIsAssigning(true);
      for (const internId of internIds) {
        await apiService.removeInternFromOrganizationWithinCourse(
          activeCourse.id,
          organizationForModal.organization.id,
          internId,
        );
      }
      await refreshOrganization();
      // Refresh the interns data to update the modal
      await fetchInterns(organizationForModal.organization.id);
      toast.success(
        `${internIds.length} pasante${internIds.length > 1 ? 's desasignados' : ' desasignado'} exitosamente`,
      );
    } catch (err) {
      console.error('Error unassigning interns:', err);
      toast.error('Error al desasignar los pasantes');
    } finally {
      setIsAssigning(false);
    }
  };

  // Refresh organization data - UPDATED TO REFRESH CACHE
  const refreshOrganization = async () => {
    if (!organizationForModal || !activeCourse) return;

    try {
      const updatedOrganization = await apiService.getOrganizationWithinCourse(
        activeCourse.id,
        organizationForModal.organization.id,
      );

      // Update the main organizations array
      setOrganizations((prev) =>
        prev.map((o) =>
          o.organization.id === updatedOrganization.id
            ? { ...o, organization: updatedOrganization }
            : o,
        ),
      );

      // Update the cached organizations array
      setAllOrganizationsCache((prev) =>
        prev.map((o) =>
          o.organization.id === updatedOrganization.id
            ? { ...o, organization: updatedOrganization }
            : o,
        ),
      );

      // Update the modal organization
      setOrganizationForModal({
        ...organizationForModal,
        organization: updatedOrganization,
      });
    } catch (err) {
      console.error('Error refreshing organization:', err);
    }
  };

  const handleViewDetail = (organization: OrganizationWithFilter) => {
    setSelectedOrganization(organization);
    fetchOrganizationDetails(organization);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrganization(null);
    setDetailMentors([]);
    setDetailInterns([]);
  };

  const handleDeleteOrganization = (organization: OrganizationWithFilter) => {
    setOrganizationToDelete(organization);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!organizationToDelete || !activeCourse) return;

    try {
      setIsDeleting(true);
      await apiService.deleteOrganizationWithinCourse(
        activeCourse.id,
        organizationToDelete.organization.id,
      );
      setOrganizations(
        organizations.filter((c) => c.organization.id !== organizationToDelete.organization.id),
      );
      // Also update cache
      setAllOrganizationsCache(
        allOrganizationsCache.filter(
          (c) => c.organization.id !== organizationToDelete.organization.id,
        ),
      );
      toast.success('Organización eliminada exitosamente');
    } catch (err) {
      console.error('Error deleting organization:', err);
      toast.error('Error al eliminar la organización');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setOrganizationToDelete(null);
    }
  };

  const handleBulkUpload = async (file: File) => {
    if (!activeCourse) return;

    try {
      console.log('Uploading organizations file:', file.name);
      toast.success('Organizaciones cargadas exitosamente');
      const organizationsData = await apiService.getAllOrganizationsWithinCourse(activeCourse.id);
      setOrganizations(organizationsData);
      setAllOrganizationsCache(organizationsData); // Update cache
    } catch (error) {
      toast.error('Error al subir el archivo.');
      throw error;
    }
  };

  // Helper function to render mentor status badge (clickable)
  const renderMentorStatusBadge = (organization: OrganizationWithFilter) => {
    const mentorCount = organization.organization.mentorIds?.length || 0;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-1 hover:bg-muted/50"
        onClick={() => handleOpenMentorModal(organization)}
      >
        {mentorCount > 0 ? (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
            <Users className="h-3 w-3 mr-1" />
            {mentorCount} Mentor{mentorCount > 1 ? 'es' : ''}
          </Badge>
        ) : (
          <Badge variant="secondary" className="hover:bg-muted">
            <Users className="h-3 w-3 mr-1" />
            Sin Mentores
          </Badge>
        )}
      </Button>
    );
  };

  // Helper function to render intern status badge (clickable)
  const renderInternStatusBadge = (organization: OrganizationWithFilter) => {
    const internCount = organization.organization.internIds?.length || 0;
    const maxInterns = organization.filter.maximumNumberOfInterns || 0;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-1 hover:bg-muted/50"
        onClick={() => handleOpenInternModal(organization)}
      >
        {internCount > 0 ? (
          <Badge
            variant="default"
            className={`${
              internCount >= maxInterns
                ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            <GraduationCap className="h-3 w-3 mr-1" />
            {internCount}/{maxInterns} Pasantes
          </Badge>
        ) : (
          <Badge variant="secondary" className="hover:bg-muted">
            <GraduationCap className="h-3 w-3 mr-1" />
            0/{maxInterns} Pasantes
          </Badge>
        )}
      </Button>
    );
  };

  if (!activeCourse) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, selecciona un curso para ver las organizaciones asociadas.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const actions = (
    <>
      <BulkUploadDialog
        title="Carga masiva de Organizaciones"
        description="Sube un archivo CSV con los datos de las organizaciones"
        acceptedFileTypes=".csv"
        triggerText="Carga Masiva"
        columns={[
          'organizationName',
          'contactName',
          'email',
          'phone',
          'sector',
          'organizationSize',
          'country',
          'ruc',
          'topicsOfInterest',
        ]}
        onUpload={handleBulkUpload}
      />
      <Button asChild className="w-full sm:w-auto">
        <Link href="/dashboard/organizations/create">
          <Building2 className="h-4 w-4 mr-2" />
          Registrar Organización
        </Link>
      </Button>
    </>
  );

  // Get current modal config and entities
  const currentConfig =
    modalType === 'mentor'
      ? {
          ...organizationMentorAssignmentConfig,
          assignedEntityIds: organizationForModal?.organization.mentorIds || [],
        }
      : {
          ...organizationInternAssignmentConfig,
          maxAssignments: organizationForModal?.organization.maximumNumberOfInterns || 0,
          assignedEntityIds: organizationForModal?.organization.internIds || [],
        };

  // For interns, we need to combine available and assigned interns
  const currentEntities = modalType === 'mentor' ? mentors : [...interns, ...assignedInterns];
  const currentIsLoading = modalType === 'mentor' ? isMentorsLoading : isInternsLoading;
  const currentOnAssign = modalType === 'mentor' ? handleAssignMentors : handleAssignInterns;
  const currentOnUnassign = modalType === 'mentor' ? handleUnassignMentors : handleUnassignInterns;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Organizaciones</h1>
          <p className="text-muted-foreground">
            Administra las organizaciones del curso: <strong>{activeCourse.name}</strong>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <SearchAndActions
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar organizaciones..."
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
          <CardTitle>Lista de organizaciones</CardTitle>
          <CardDescription>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando organizaciones...
              </div>
            ) : (
              <>
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems}{' '}
                organización
                {totalItems !== 1 ? 's' : ''}. Haz clic en los estados para gestionar asignaciones.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : paginatedOrganizations.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {organizations.length === 0
                  ? 'No hay organizaciones registradas en este curso.'
                  : 'No se encontraron organizaciones con los criterios de búsqueda.'}
              </p>
            </div>
          ) : isMobile ? (
            // Cards for mobile view
            <div className="space-y-4">
              {paginatedOrganizations.map((organization) => (
                <Card key={organization.organization.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">
                        {organization.organization.organizationName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {organization.organization.sector}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(organization)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/organizations/${organization.organization.id}/edit`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteOrganization(organization)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{organization.organization.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{organization.organization.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{organization.organization.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderMentorStatusBadge(organization)}
                      {renderInternStatusBadge(organization)}
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
                  <TableHead>Organización</TableHead>
                  <TableHead>RUC</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Mentores</TableHead>
                  <TableHead>Pasantes</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrganizations.map((organization) => (
                  <TableRow key={organization.organization.id}>
                    <TableCell className="font-medium">
                      {organization.organization.organizationName}
                    </TableCell>
                    <TableCell>{organization.organization.ruc || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <div>{organization.organization.contactName}</div>
                        <div className="text-sm text-muted-foreground">
                          {organization.organization.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{renderMentorStatusBadge(organization)}</TableCell>
                    <TableCell>{renderInternStatusBadge(organization)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetail(organization)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/organizations/${organization.organization.id}/edit`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteOrganization(organization)}
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

      {/* Dynamic Assignment Modal */}
      <DynamicAssignmentModal
        isOpen={isDynamicModalOpen}
        onClose={() => {
          setIsDynamicModalOpen(false);
          setOrganizationForModal(null);
        }}
        organization={organizationForModal}
        entities={currentEntities}
        onAssign={currentOnAssign}
        onUnassign={currentOnUnassign}
        isLoading={currentIsLoading || isAssigning}
        config={currentConfig}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setOrganizationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        description={
          organizationToDelete && (
            <>
              Esta acción no se puede deshacer. Esto eliminará la organización{' '}
              <strong>{organizationToDelete.organization.organizationName}</strong> y removerá todos
              sus datos del sistema.
            </>
          )
        }
        confirmButtonText="Eliminar organización"
        title="¿Estás seguro de eliminar esta organización?"
      />

      {/* Detail Sheet */}
      <Sheet
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) handleCloseDetail();
        }}
      >
        <SheetContent
          className={`${isMobile ? 'w-full' : 'w-[800px] sm:w-[800px]'} overflow-y-auto p-5`}
        >
          {selectedOrganization && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedOrganization.organization.organizationName}
                </SheetTitle>
                <SheetDescription>Información detallada de la organización</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Organization Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedOrganization.organization.ruc && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          RUC: {selectedOrganization.organization.ruc}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Contacto: {selectedOrganization.organization.contactName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Teléfono: {selectedOrganization.organization.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Correo: {selectedOrganization.organization.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Sector {selectedOrganization.organization.sector} | Organización{' '}
                        {getOrganizationSizeLabel(
                          selectedOrganization.organization.organizationSize,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        País: {selectedOrganization.organization.country}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preferencias de Pasantes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedOrganization.filter.placeOfResidenceFilter && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Lugar de residencia:{' '}
                          {getDepartmentLabel(selectedOrganization.filter.placeOfResidenceFilter)}
                        </span>
                      </div>
                    )}
                    {selectedOrganization.filter.genderFilter && (
                      <div className="flex items-center gap-2">
                        <PersonStanding className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Género: {getGenderLabel(selectedOrganization.filter.genderFilter)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Carreras:{' '}
                        {selectedOrganization.filter.studiedMajorFilter
                          ?.map((major) => getMajorLabel(major))
                          .join(', ')}
                      </span>
                    </div>
                    {selectedOrganization.filter.maximumNumberOfInterns && (
                      <div className="flex items-center gap-2">
                        <UsersRound className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Máximo de pasantes: {selectedOrganization.filter.maximumNumberOfInterns}
                        </span>
                      </div>
                    )}
                    {selectedOrganization.filter.extraRequirements && (
                      <div className="flex items-center gap-2">
                        <Text className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Requisitos adicionales: {selectedOrganization.filter.extraRequirements}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Mentors Assigned */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mentores Asignados</CardTitle>
                  </CardHeader>
                  {isDetailLoading ? (
                    <LoadingListSkeleton count={2} />
                  ) : (
                    <CardContent>
                      {detailMentors.length > 0 ? (
                        <div className="space-y-2">
                          {detailMentors.map((mentor, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-muted rounded"
                            >
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {mentor.firstNames} {mentor.lastNameFather} {mentor.lastNameMother}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No hay mentores asignados</p>
                      )}
                    </CardContent>
                  )}
                </Card>

                {/* Interns Assigned */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pasantes Asignados</CardTitle>
                  </CardHeader>
                  {isDetailLoading ? (
                    <LoadingListSkeleton count={4} />
                  ) : (
                    <CardContent>
                      {detailInterns.length > 0 ? (
                        <div className="space-y-2">
                          {detailInterns.map((intern, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-muted rounded"
                            >
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {intern.firstNames} {intern.lastNameFather} {intern.lastNameMother}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No hay pasantes asignados</p>
                      )}
                    </CardContent>
                  )}
                </Card>

                {/* Topics of Interest */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ejes Temáticos de Interés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrganization.organization.topicsOfInterest.map((topic, index) => (
                        <Badge key={index} variant="outline">
                          {getTopicLabel(topic)}
                        </Badge>
                      ))}
                    </div>
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
                      {new Date(selectedOrganization.organization.createdAt).toLocaleDateString(
                        'es-ES',
                      )}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Última actualización:</span>{' '}
                      {new Date(selectedOrganization.organization.updatedAt).toLocaleDateString(
                        'es-ES',
                      )}
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
