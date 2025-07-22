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
import {
  apiService,
  type Mentor,
  type Intern,
  type Organization,
  type OrganizationWithFilter,
} from '@/lib/api';
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

// Helper functions for filtering
const organizationFilterFn = (organization: Organization, searchTerm: string) => {
  return (
    organization.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organization.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organization.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organization.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organization.country.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

const organizationWithFilterFilterFn = (
  organization: OrganizationWithFilter,
  searchTerm: string,
) => {
  return (
    organization.organization.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organization.organization.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organization.organization.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organization.organization.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organization.organization.country.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

interface OrganizationsExplorePageProps {
  mode: 'course' | 'general';
}

export default function OrganizationsExplorePage({ mode }: OrganizationsExplorePageProps) {
  const { activeCourse } = useCourse();
  const [searchTerm, setSearchTerm] = useState<string>('');

  // States for course mode
  const [selectedOrganizationWithFilter, setSelectedOrganizationWithFilter] =
    useState<OrganizationWithFilter | null>(null);
  const [organizationsWithFilter, setOrganizationsWithFilter] = useState<OrganizationWithFilter[]>(
    [],
  );
  const [organizationForModal, setOrganizationForModal] = useState<OrganizationWithFilter | null>(
    null,
  );
  const [organizationToDeleteWithFilter, setOrganizationToDeleteWithFilter] =
    useState<OrganizationWithFilter | null>(null);
  const [allOrganizationsCache, setAllOrganizationsCache] = useState<OrganizationWithFilter[]>([]);

  // States for general mode
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null);

  // Common states
  const [detailInterns, setDetailInterns] = useState<Intern[]>([]);
  const [detailMentors, setDetailMentors] = useState<Mentor[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [assignedInterns, setAssignedInterns] = useState<Intern[]>([]);
  const [isMentorsLoading, setIsMentorsLoading] = useState<boolean>(false);
  const [isInternsLoading, setIsInternsLoading] = useState<boolean>(false);
  const [mentorsLoaded, setMentorsLoaded] = useState<boolean>(false);
  const [, setInternsLoaded] = useState<boolean>(false);
  const isMobile = useIsMobile();

  // Dynamic modal states (only for course mode)
  const [isDynamicModalOpen, setIsDynamicModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'mentor' | 'intern'>('mentor');
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Configuration based on mode
  const config = {
    course: {
      title: 'Gestión de Organizaciones',
      description: `Administra las organizaciones del curso: ${activeCourse?.name || ''}`,
      createUrl: '/dashboard/organizations/create',
      editUrl: (id: string) => `/dashboard/organizations/edit?id=${id}`,
      fetchOrganizations: () => apiService.getAllOrganizationsWithinCourse(activeCourse!.id),
      deleteOrganization: (id: string) =>
        apiService.deleteOrganizationWithinCourse(activeCourse!.id, id),
      fetchOrganizationDetails: (orgId: string) =>
        Promise.all([
          apiService.getAllOrganizationInternsWithinCourse(activeCourse!.id, orgId),
          apiService.getAllOrganizationMentorsWithinCourse(activeCourse!.id, orgId),
        ]),
      requiresCourse: true,
      showCreateButton: true,
      showBulkUpload: true,
      showAssignments: true,
    },
    general: {
      title: 'Gestión General de Organizaciones',
      description: 'Administra todas las organizaciones registradas en el sistema',
      createUrl: '/dashboard/general/organizations/create',
      editUrl: (id: string) => `/dashboard/general/organizations/edit?id=${id}`,
      fetchOrganizations: () => apiService.getAllOrganizations(),
      deleteOrganization: (id: string) => apiService.deleteOrganization(id),
      fetchOrganizationDetails: () => {
        console.warn('Organization details not available in general view');
        return Promise.resolve([[], []] as [Intern[], Mentor[]]);
      },
      requiresCourse: false,
      showCreateButton: false,
      showBulkUpload: false,
      showAssignments: false,
    },
  };

  const currentConfig = config[mode];

  // Use pagination hook based on mode
  const courseModePagination = usePagination<OrganizationWithFilter>({
    data: organizationsWithFilter,
    itemsPerPage: 10,
    searchTerm,
    filterFn: organizationWithFilterFilterFn,
  });

  const generalModePagination = usePagination<Organization>({
    data: organizations,
    itemsPerPage: 10,
    searchTerm,
    filterFn: organizationFilterFn,
  });

  const pagination = mode === 'course' ? courseModePagination : generalModePagination;

  // Fetch organizations when active course changes
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (currentConfig.requiresCourse && !activeCourse) {
        if (mode === 'course') {
          setOrganizationsWithFilter([]);
          setAllOrganizationsCache([]);
        } else {
          setOrganizations([]);
        }
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const organizationsData = await currentConfig.fetchOrganizations();

        if (mode === 'course') {
          setOrganizationsWithFilter(organizationsData as OrganizationWithFilter[]);
          setAllOrganizationsCache(organizationsData as OrganizationWithFilter[]);
        } else {
          setOrganizations(organizationsData as Organization[]);
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError('Error al cargar las organizaciones. Por favor, intenta nuevamente.');
        if (mode === 'course') {
          setOrganizationsWithFilter([]);
          setAllOrganizationsCache([]);
        } else {
          setOrganizations([]);
        }
      } finally {
        setIsLoading(false);
        setMentorsLoaded(false);
        setInternsLoaded(false);
      }
    };

    fetchOrganizations();
  }, [activeCourse, mode]);

  // Fetch mentors when needed for assignment (only in course mode)
  const fetchMentors = async () => {
    if (!activeCourse || mentorsLoaded || mode !== 'course') return;

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

  const fetchOrganizationDetails = async (organizationId: string) => {
    try {
      setIsDetailLoading(true);
      if (mode === 'general') {
        setDetailInterns([]);
        setDetailMentors([]);
        return;
      }

      const [interns, mentors] = await currentConfig.fetchOrganizationDetails(organizationId);
      setDetailInterns(interns);
      setDetailMentors(mentors);
    } catch (err) {
      console.error('Error fetching detail data:', err);
      toast.error('Error al cargar detalles de la organización');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Fetch interns when needed for assignment (only in course mode)
  const fetchInterns = async (organizationId: string) => {
    if (!activeCourse || mode !== 'course') return;

    try {
      setIsInternsLoading(true);
      const matchingInternsData = await apiService.getInternsMatchingOrganization(
        activeCourse.id,
        organizationId,
      );
      const assignedInternsData = await apiService.getAllOrganizationInternsWithinCourse(
        activeCourse.id,
        organizationId,
      );

      const organizationsToCheck =
        allOrganizationsCache.length > 0
          ? allOrganizationsCache
          : await apiService.getAllOrganizationsWithinCourse(activeCourse.id);

      const internsAssignedToOtherOrgs = new Set<string>();
      organizationsToCheck.forEach((org) => {
        if (org.organization.id !== organizationId) {
          org.organization.internIds?.forEach((internId) => {
            internsAssignedToOtherOrgs.add(internId);
          });
        }
      });

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

  // Handle opening the dynamic modal for mentors (only in course mode)
  const handleOpenMentorModal = (organization: OrganizationWithFilter) => {
    if (mode !== 'course') return;
    setOrganizationForModal(organization);
    setModalType('mentor');
    setIsDynamicModalOpen(true);
    fetchMentors();
  };

  // Handle opening the dynamic modal for interns (only in course mode)
  const handleOpenInternModal = (organization: OrganizationWithFilter) => {
    if (mode !== 'course') return;
    setOrganizationForModal(organization);
    setModalType('intern');
    setIsDynamicModalOpen(true);
    fetchInterns(organization.organization.id);
  };

  // Assignment handlers (only for course mode)
  const handleAssignMentors = async (mentorIds: string[]) => {
    if (!organizationForModal || !activeCourse || mode !== 'course') return;

    try {
      setIsAssigning(true);
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

  const handleAssignInterns = async (internIds: string[]) => {
    if (!organizationForModal || !activeCourse || mode !== 'course') return;

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

  const handleUnassignMentors = async (mentorIds: string[]) => {
    if (!organizationForModal || !activeCourse || mode !== 'course') return;

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

  const handleUnassignInterns = async (internIds: string[]) => {
    if (!organizationForModal || !activeCourse || mode !== 'course') return;

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

  // Refresh organization data (only for course mode)
  const refreshOrganization = async () => {
    if (!organizationForModal || !activeCourse || mode !== 'course') return;

    try {
      const updatedOrganization = await apiService.getOrganizationWithinCourse(
        activeCourse.id,
        organizationForModal.organization.id,
      );

      setOrganizationsWithFilter((prev) =>
        prev.map((o) =>
          o.organization.id === updatedOrganization.id
            ? { ...o, organization: updatedOrganization }
            : o,
        ),
      );

      setAllOrganizationsCache((prev) =>
        prev.map((o) =>
          o.organization.id === updatedOrganization.id
            ? { ...o, organization: updatedOrganization }
            : o,
        ),
      );

      setOrganizationForModal({
        ...organizationForModal,
        organization: updatedOrganization,
      });
    } catch (err) {
      console.error('Error refreshing organization:', err);
    }
  };

  const handleViewDetail = (organization: Organization | OrganizationWithFilter) => {
    if (mode === 'course') {
      const orgWithFilter = organization as OrganizationWithFilter;
      setSelectedOrganizationWithFilter(orgWithFilter);
      fetchOrganizationDetails(orgWithFilter.organization.id);
    } else {
      const org = organization as Organization;
      setSelectedOrganization(org);
      fetchOrganizationDetails(org.id);
    }
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrganization(null);
    setSelectedOrganizationWithFilter(null);
    setDetailMentors([]);
    setDetailInterns([]);
  };

  const handleDeleteOrganization = (organization: Organization | OrganizationWithFilter) => {
    if (mode === 'course') {
      setOrganizationToDeleteWithFilter(organization as OrganizationWithFilter);
    } else {
      setOrganizationToDelete(organization as Organization);
    }
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    const orgToDelete = mode === 'course' ? organizationToDeleteWithFilter : organizationToDelete;
    if (!orgToDelete) return;
    if (currentConfig.requiresCourse && !activeCourse) return;

    try {
      setIsDeleting(true);
      const orgId =
        mode === 'course'
          ? (orgToDelete as OrganizationWithFilter).organization.id
          : (orgToDelete as Organization).id;

      await currentConfig.deleteOrganization(orgId);

      if (mode === 'course') {
        setOrganizationsWithFilter(
          organizationsWithFilter.filter((c) => c.organization.id !== orgId),
        );
        setAllOrganizationsCache(allOrganizationsCache.filter((c) => c.organization.id !== orgId));
      } else {
        setOrganizations(organizations.filter((c) => c.id !== orgId));
      }

      toast.success('Organización eliminada exitosamente');
    } catch (err) {
      console.error('Error deleting organization:', err);
      toast.error('Error al eliminar la organización');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setOrganizationToDelete(null);
      setOrganizationToDeleteWithFilter(null);
    }
  };

  const handleBulkUpload = async (file: File) => {
    if (!activeCourse || mode !== 'course') return;

    try {
      console.log('Uploading organizations file:', file.name);
      toast.success('Organizaciones cargadas exitosamente');
      const organizationsData = await apiService.getAllOrganizationsWithinCourse(activeCourse.id);
      setOrganizationsWithFilter(organizationsData);
      setAllOrganizationsCache(organizationsData);
    } catch (error) {
      toast.error('Error al subir el archivo.');
      throw error;
    }
  };

  // Helper function to render mentor status badge (clickable only in course mode)
  const renderMentorStatusBadge = (organization: Organization | OrganizationWithFilter) => {
    const org =
      mode === 'course'
        ? (organization as OrganizationWithFilter).organization
        : (organization as Organization);

    const mentorCount = org.mentorIds?.length || 0;
    const content =
      mentorCount > 0 ? (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
          <Users className="h-3 w-3 mr-1" />
          {mentorCount} Mentor{mentorCount > 1 ? 'es' : ''}
        </Badge>
      ) : (
        <Badge variant="secondary" className="hover:bg-muted">
          <Users className="h-3 w-3 mr-1" /> Sin Mentores
        </Badge>
      );

    if (mode === 'course' && currentConfig.showAssignments) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 hover:bg-muted/50"
          onClick={() => handleOpenMentorModal(organization as OrganizationWithFilter)}
        >
          {content}
        </Button>
      );
    }

    return content;
  };

  // Helper function to render intern status badge (clickable only in course mode)
  const renderInternStatusBadge = (organization: Organization | OrganizationWithFilter) => {
    const org =
      mode === 'course'
        ? (organization as OrganizationWithFilter).organization
        : (organization as Organization);

    const internCount = org.internIds?.length || 0;
    const maxInterns =
      mode === 'course'
        ? (organization as OrganizationWithFilter).filter.maximumNumberOfInterns
        : org.maximumNumberOfInterns || 0;

    const content =
      internCount > 0 ? (
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
          <GraduationCap className="h-3 w-3 mr-1" /> 0/{maxInterns} Pasantes
        </Badge>
      );

    if (mode === 'course' && currentConfig.showAssignments) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 hover:bg-muted/50"
          onClick={() => handleOpenInternModal(organization as OrganizationWithFilter)}
        >
          {content}
        </Button>
      );
    }

    return content;
  };

  if (currentConfig.requiresCourse && !activeCourse) {
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
      {currentConfig.showBulkUpload && (
        <BulkUploadDialog
          title="Carga masiva de Organizaciones"
          description="Sube un archivo CSV con los datos de las organizaciones"
          acceptedFileTypes=".csv"
          triggerText="Carga Masiva"
          columns={[
            'ruc',
            'topicsOfInterest',
            'ruc',
            'correo',
            'nombre_contacto',
            'telefono',
            'pais',
            'nombre_organizacion',
            'tamano_organizacion',
            'sector',
            'temas_interes',
            'max_internos',
            'departamentos_residencia',
            'carreras',
            'genero_preferido',
            'requisitos_extra',
          ]}
          onUpload={handleBulkUpload}
        />
      )}
      {currentConfig.showCreateButton && (
        <Button asChild className="w-full sm:w-auto">
          <Link href={currentConfig.createUrl}>
            <Building2 className="h-4 w-4 mr-2" /> Registrar Organización
          </Link>
        </Button>
      )}
    </>
  );

  // Get current modal config and entities (only for course mode)
  const currentModalConfig =
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

  const currentEntities = modalType === 'mentor' ? mentors : [...interns, ...assignedInterns];
  const currentIsLoading = modalType === 'mentor' ? isMentorsLoading : isInternsLoading;
  const currentOnAssign = modalType === 'mentor' ? handleAssignMentors : handleAssignInterns;
  const currentOnUnassign = modalType === 'mentor' ? handleUnassignMentors : handleUnassignInterns;

  // Get current data for rendering
  const currentData = mode === 'course' ? organizationsWithFilter : organizations;
  const paginatedData = pagination.paginatedData;

  // Get selected organization for detail view
  const selectedOrgForDetail =
    mode === 'course' ? selectedOrganizationWithFilter : selectedOrganization;
  const selectedOrgData =
    mode === 'course' ? selectedOrganizationWithFilter?.organization : selectedOrganization;
  const selectedOrgFilter = mode === 'course' ? selectedOrganizationWithFilter?.filter : null;

  // Get organization to delete for modal
  const orgToDeleteForModal =
    mode === 'course' ? organizationToDeleteWithFilter : organizationToDelete;
  const orgToDeleteName =
    mode === 'course'
      ? organizationToDeleteWithFilter?.organization.organizationName
      : organizationToDelete?.organizationName;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{currentConfig.title}</h1>
          <p className="text-muted-foreground">{currentConfig.description}</p>
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
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando organizaciones...
              </div>
            ) : (
              <>
                Mostrando {pagination.startIndex + 1}-
                {Math.min(pagination.endIndex, pagination.totalItems)} de {pagination.totalItems}{' '}
                organización{pagination.totalItems !== 1 ? 'es' : ''}.{' '}
                {currentConfig.showAssignments &&
                  'Haz clic en los estados para gestionar asignaciones.'}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {currentData.length === 0
                  ? `No hay organizaciones registradas ${mode === 'course' ? 'en este curso' : 'en el sistema'}.`
                  : 'No se encontraron organizaciones con los criterios de búsqueda.'}
              </p>
            </div>
          ) : isMobile ? (
            // Cards for mobile view
            <div className="space-y-4">
              {paginatedData.map((organization) => {
                const org =
                  mode === 'course'
                    ? (organization as OrganizationWithFilter).organization
                    : (organization as Organization);
                const orgId = org.id;

                return (
                  <Card key={orgId} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{org.organizationName}</h3>
                        <p className="text-xs text-muted-foreground">{org.sector}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetail(organization)}>
                            <Eye className="h-4 w-4 mr-2" /> Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={currentConfig.editUrl(orgId)}>
                              <Edit className="h-4 w-4 mr-2" /> Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteOrganization(organization)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{org.contactName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{org.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{org.email}</span>
                      </div>
                      {mode === 'course' ? (
                        <div className="flex items-center gap-2">
                          {renderMentorStatusBadge(organization)}
                          {renderInternStatusBadge(organization)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{org.country}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            // Table for desktop view
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organización</TableHead>
                  <TableHead>RUC</TableHead>
                  <TableHead>Contacto</TableHead>
                  {mode === 'course' ? (
                    <>
                      <TableHead>Mentores</TableHead>
                      <TableHead>Pasantes</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Correo</TableHead>
                      <TableHead>País</TableHead>
                    </>
                  )}
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((organization) => {
                  const org =
                    mode === 'course'
                      ? (organization as OrganizationWithFilter).organization
                      : (organization as Organization);
                  const orgId = org.id;

                  return (
                    <TableRow key={orgId}>
                      <TableCell className="font-medium">{org.organizationName}</TableCell>
                      <TableCell>{org.ruc || 'N/A'}</TableCell>
                      <TableCell>
                        <div>
                          <div>{org.contactName}</div>
                          <div className="text-sm text-muted-foreground">{org.phone}</div>
                        </div>
                      </TableCell>
                      {mode === 'course' ? (
                        <>
                          <TableCell>{renderMentorStatusBadge(organization)}</TableCell>
                          <TableCell>{renderInternStatusBadge(organization)}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{org.email}</TableCell>
                          <TableCell>{org.country}</TableCell>
                        </>
                      )}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(organization)}>
                              <Eye className="h-4 w-4 mr-2" /> Ver Detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={currentConfig.editUrl(orgId)}>
                                <Edit className="h-4 w-4 mr-2" /> Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteOrganization(organization)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          itemsPerPage={pagination.itemsPerPage}
          totalItems={pagination.totalItems}
          onPageChange={pagination.setCurrentPage}
          onItemsPerPageChange={pagination.setItemsPerPage}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
        />
      </Card>

      {/* Dynamic Assignment Modal (only for course mode) */}
      {currentConfig.showAssignments && (
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
          config={currentModalConfig}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setOrganizationToDelete(null);
          setOrganizationToDeleteWithFilter(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        description={
          orgToDeleteForModal && (
            <>
              Esta acción no se puede deshacer. Esto eliminará la organización{' '}
              <strong>{orgToDeleteName}</strong> y removerá todos sus datos del sistema.
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
          {selectedOrgForDetail && selectedOrgData && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedOrgData.organizationName}
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
                    {selectedOrgData.ruc && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">RUC: {selectedOrgData.ruc}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Contacto: {selectedOrgData.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Teléfono: {selectedOrgData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Correo: {selectedOrgData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Sector {selectedOrgData.sector} | Organización{' '}
                        {getOrganizationSizeLabel(selectedOrgData.organizationSize)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">País: {selectedOrgData.country}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Filter preferences (only show if available in course mode) */}
                {selectedOrgFilter && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Preferencias de Pasantes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedOrgFilter.placeOfResidenceFilter && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Lugar de residencia:{' '}
                            {selectedOrgFilter.placeOfResidenceFilter
                              ?.map((place) => getDepartmentLabel(place))
                              .join(', ')}
                          </span>
                        </div>
                      )}
                      {selectedOrgFilter.genderFilter && (
                        <div className="flex items-center gap-2">
                          <PersonStanding className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Género: {getGenderLabel(selectedOrgFilter.genderFilter)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Carreras:{' '}
                          {selectedOrgFilter.studiedMajorFilter
                            ?.map((major) => getMajorLabel(major))
                            .join(', ')}
                        </span>
                      </div>
                      {selectedOrgFilter.maximumNumberOfInterns && (
                        <div className="flex items-center gap-2">
                          <UsersRound className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Máximo de pasantes: {selectedOrgFilter.maximumNumberOfInterns}
                          </span>
                        </div>
                      )}
                      {selectedOrgFilter.extraRequirements && (
                        <div className="flex items-center gap-2">
                          <Text className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Requisitos adicionales: {selectedOrgFilter.extraRequirements}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Mentors Assigned */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mentores Asignados</CardTitle>
                  </CardHeader>
                  {mode === 'general' ? (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Las asignaciones de mentores solo están disponibles en la vista por curso
                      </p>
                    </CardContent>
                  ) : isDetailLoading ? (
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
                  {mode === 'general' ? (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Las asignaciones de pasantes solo están disponibles en la vista por curso
                      </p>
                    </CardContent>
                  ) : isDetailLoading ? (
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
                      {selectedOrgData.topicsOfInterest.map((topic, index) => (
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
                      {new Date(selectedOrgData.createdAt).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Última actualización:</span>{' '}
                      {new Date(selectedOrgData.updatedAt).toLocaleDateString('es-ES')}
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
