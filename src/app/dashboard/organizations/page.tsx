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
} from 'lucide-react';
import { apiService, type Mentor, type Organization } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCourse } from '@/context/CourseContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

// Modular components
import { PaginationControls } from '@/components/data-table/pagination-controls';
import { usePagination } from '@/hooks/use-pagination';
import { BulkUploadDialog } from '@/components/batch-upload/bulk-upload';
import { SearchAndActions } from '@/components/data-table/search-actions';
import { getOrganizationSizeLabel, getTopicLabel } from '@/lib/helper-functions';
import { DynamicMentorModal } from '@/components/assignment/dynamic-mentor-modal';

// Helper function for filtering companies
const companyFilterFn = (company: Organization, searchTerm: string) => {
  return (
    company.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.country.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export default function CompaniesPageModular() {
  const { activeCourse } = useCourse();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<Organization | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [companies, setCompanies] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isMentorsLoading, setIsMentorsLoading] = useState<boolean>(false);
  const [mentorsLoaded, setMentorsLoaded] = useState<boolean>(false);
  const isMobile = useIsMobile();

  // Dynamic modal states
  const [isDynamicModalOpen, setIsDynamicModalOpen] = useState<boolean>(false);
  const [organizationForModal, setOrganizationForModal] = useState<Organization | null>(null);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Use pagination hook
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    paginatedData: paginatedCompanies,
    totalItems,
  } = usePagination({
    data: companies,
    itemsPerPage: 10,
    searchTerm,
    filterFn: companyFilterFn,
  });

  // Fetch companies when active course changes
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!activeCourse) {
        setCompanies([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const companiesData = await apiService.getCompanies(activeCourse.id);
        setCompanies(companiesData);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Error al cargar las organizaciones. Por favor, intenta nuevamente.');
        setCompanies([]);
      } finally {
        setIsLoading(false);
        setMentorsLoaded(false); // Reset mentors loaded state
      }
    };

    fetchCompanies();
  }, [activeCourse]);

  // Fetch mentors when needed for assignment
  const fetchMentors = async () => {
    if (!activeCourse || mentorsLoaded) return;

    try {
      setIsMentorsLoading(true);
      const mentorsData = await apiService.getMentors(activeCourse.id);
      setMentors(mentorsData);
      setMentorsLoaded(true);
    } catch (err) {
      console.error('Error fetching mentors:', err);
      toast.error('Error al cargar los mentores');
    } finally {
      setIsMentorsLoading(false);
    }
  };

  // Handle opening the dynamic modal
  const handleOpenMentorModal = (organization: Organization) => {
    setOrganizationForModal(organization);
    setIsDynamicModalOpen(true);
    fetchMentors();
  };

  // Handle mentor assignment
  const handleAssignMentors = async (mentorIds: string[]) => {
    if (!organizationForModal || !activeCourse) return;

    try {
      setIsAssigning(true);

      // Assign each mentor to the organization
      for (const mentorId of mentorIds) {
        await apiService.assignMentorToOrganization(
          activeCourse.id,
          mentorId,
          organizationForModal.id,
        );
      }

      // Fetch updated organization from the API
      const updatedOrganization = await apiService.getCompany(
        activeCourse.id,
        organizationForModal.id,
      );

      // Update local state with the refreshed organization
      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === updatedOrganization.id ? updatedOrganization : company,
        ),
      );

      // Update the modal organization state
      setOrganizationForModal(updatedOrganization);

      toast.success(
        `${mentorIds.length} mentor${mentorIds.length > 1 ? 'es asignados' : ' asignado'} exitosamente`,
      );
    } catch (err) {
      console.error('Error assigning mentors:', err);
      toast.error('Error al asignar los mentores');
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle mentor unassignment
  const handleUnassignMentors = async (mentorIds: string[]) => {
    if (!organizationForModal || !activeCourse) return;

    try {
      setIsAssigning(true);

      // Unassign each mentor from the organization
      for (const mentorId of mentorIds) {
        await apiService.removeMentorFromCompany(
          activeCourse.id,
          organizationForModal.id,
          mentorId,
        );
      }

      // Fetch updated organization from the API
      const updatedOrganization = await apiService.getCompany(
        activeCourse.id,
        organizationForModal.id,
      );

      // Update local state with the refreshed organization
      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === updatedOrganization.id ? updatedOrganization : company,
        ),
      );

      // Update the modal organization state
      setOrganizationForModal(updatedOrganization);

      toast.success(
        `${mentorIds.length} mentor${mentorIds.length > 1 ? 'es desasignados' : ' desasignado'} exitosamente`,
      );
    } catch (err) {
      console.error('Error unassigning mentors:', err);
      toast.error('Error al desasignar los mentores');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleViewDetail = (company: Organization) => {
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  const handleDeleteCompany = async (company: Organization) => {
    if (!activeCourse) return;

    if (
      confirm(`¿Estás seguro de que quieres eliminar la empresa "${company.organizationName}"?`)
    ) {
      try {
        await apiService.deleteCompany(activeCourse.id, company.id);
        setCompanies(companies.filter((c) => c.id !== company.id));
        toast.success('Empresa eliminada exitosamente');
      } catch (err) {
        console.error('Error deleting company:', err);
        toast.error('Error al eliminar la empresa');
      }
    }
  };

  const handleBulkUpload = async (file: File) => {
    if (!activeCourse) return;

    try {
      // TODO: Implement API call for bulk upload companies
      console.log('Uploading companies file:', file.name);
      toast.success('Empresas cargadas exitosamente');

      // Refresh companies list
      const companiesData = await apiService.getCompanies(activeCourse.id);
      setCompanies(companiesData);
    } catch (error) {
      toast.error('Error al subir el archivo.');
      throw error;
    }
  };

  // Helper function to get mentor assignment status
  const getMentorAssignmentStatus = (company: Organization) => {
    const mentorCount = company.mentorIds?.length || 0;
    if (mentorCount === 0) return 'unassigned';
    return 'assigned';
  };

  // Helper function to render mentor status badge (clickable)
  const renderMentorStatusBadge = (company: Organization) => {
    const mentorCount = company.mentorIds?.length || 0;
    const status = getMentorAssignmentStatus(company);

    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-1 hover:bg-muted/50"
        onClick={() => handleOpenMentorModal(company)}
      >
        {status === 'assigned' ? (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
            {mentorCount} Mentor{mentorCount > 1 ? 'es' : ''}
          </Badge>
        ) : (
          <Badge variant="secondary" className="hover:bg-muted">
            Sin Mentores
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
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} empresa
                {totalItems !== 1 ? 's' : ''}. Haz clic en el estado de mentores para gestionar
                asignaciones.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : paginatedCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {companies.length === 0
                  ? 'No hay organizaciones registradas en este curso.'
                  : 'No se encontraron organizaciones con los criterios de búsqueda.'}
              </p>
            </div>
          ) : isMobile ? (
            // Cards for mobile view
            <div className="space-y-4">
              {paginatedCompanies.map((company) => (
                <Card key={company.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{company.organizationName}</h3>
                      <p className="text-xs text-muted-foreground">{company.sector}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(company)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/organizations/${company.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteCompany(company)}
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
                      <span className="text-xs">{company.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{company.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{company.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderMentorStatusBadge(company)}
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
                  <TableHead>Empresa</TableHead>
                  <TableHead>RUC</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Mentores</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.organizationName}</TableCell>
                    <TableCell>{company.ruc || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <div>{company.contactName}</div>
                        <div className="text-sm text-muted-foreground">{company.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{company.country}</TableCell>
                    <TableCell>{renderMentorStatusBadge(company)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetail(company)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/organizations/${company.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteCompany(company)}
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

      {/* Dynamic Mentor Modal */}
      <DynamicMentorModal
        isOpen={isDynamicModalOpen}
        onClose={() => {
          setIsDynamicModalOpen(false);
          setOrganizationForModal(null);
        }}
        organization={organizationForModal}
        mentors={mentors}
        onAssign={handleAssignMentors}
        onUnassign={handleUnassignMentors}
        isLoading={isMentorsLoading || isAssigning}
      />

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent
          className={`${isMobile ? 'w-full' : 'w-[800px] sm:w-[800px]'} overflow-y-auto`}
        >
          {selectedCompany && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedCompany.organizationName}
                </SheetTitle>
                <SheetDescription>Información detallada de la empresa</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Organization Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCompany.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCompany.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCompany.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedCompany.sector} |{' '}
                        {getOrganizationSizeLabel(selectedCompany.organizationSize)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCompany.country}</span>
                    </div>
                    {selectedCompany.ruc && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">RUC: {selectedCompany.ruc}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Mentors Assigned */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mentores Asignados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCompany.mentorIds && selectedCompany.mentorIds.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCompany.mentorIds.map((mentorId, index) => {
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
                                  : `Mentor ID: ${mentorId}`}
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

                {/* Topics of Interest */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ejes Temáticos de Interés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedCompany.topicsOfInterest.map((topic, index) => (
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
                      {new Date(selectedCompany.createdAt).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Última actualización:</span>{' '}
                      {new Date(selectedCompany.updatedAt).toLocaleDateString('es-ES')}
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
