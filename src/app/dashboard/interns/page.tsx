'use client';

import { useEffect, useState } from 'react';
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
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  UserPlus,
  Users,
  Globe,
  IdCard,
  AlertCircle,
  Loader2,
  University,
  Mail,
  Phone,
  User,
  Calendar,
  Speech,
  PersonStanding,
  MapPin,
  GraduationCap,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCourse } from '@/context/CourseContext';
import { apiService, type Intern } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

// Modular components
import { useFilteredPagination } from '@/hooks/use-filtered-pagination';
import { PaginationControls } from '@/components/data-table/pagination-controls';
import { BulkUploadDialog } from '@/components/batch-upload/bulk-upload';
import { SearchWithFilters } from '@/components/data-table/search-filters';
import {
  getDepartmentLabel,
  getDocTypeLabel,
  getGenderLabel,
  getMajorLabel,
  getReferralSourceLabel,
  getTopicLabel,
} from '@/lib/helper-functions';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

const internFilterFn = (intern: Intern, searchTerm: string) => {
  const matchesSearch =
    intern.firstNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.lastNameFather.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.lastNameMother.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.universityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.country.toLowerCase().includes(searchTerm.toLowerCase());

  return matchesSearch;
};

export default function InternsExplorePage() {
  const { activeCourse } = useCourse();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [internToDelete, setInternToDelete] = useState<Intern | null>(null);
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
    paginatedData: paginatedInterns,
    totalItems,
  } = useFilteredPagination({
    data: interns,
    itemsPerPage: 10,
    searchTerm,
    filterFn: internFilterFn,
  });

  useEffect(() => {
    const fetchInterns = async () => {
      if (!activeCourse) {
        setInterns([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const internsData = await apiService.getAllInternsWithinCourse(activeCourse.id);
        setInterns(internsData);
      } catch (err) {
        console.error('Error fetching interns:', err);
        setError('Error al cargar los pasantes. Por favor, intenta nuevamente.');
        setInterns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterns();
  }, [activeCourse]);

  const handleViewDetail = (intern: Intern) => {
    setSelectedIntern(intern);
    setIsDetailOpen(true);
  };

  const handleDeleteIntern = (intern: Intern) => {
    setInternToDelete(intern);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!internToDelete || !activeCourse) return;

    try {
      setIsDeleting(true);
      await apiService.deleteInternWithinCourse(activeCourse.id, internToDelete.id);
      setInterns(interns.filter((c) => c.id !== internToDelete.id));
      toast.success('Pasante eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting intern:', err);
      toast.error('Error al eliminar el pasante');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setInternToDelete(null);
    }
  };

  const handleBulkUpload = async (file: File) => {
    if (!activeCourse) return;

    try {
      const response = await apiService.uploadInternsBatchWithinCourse(activeCourse.id, file);
      if (response.validInterns.length > 0) {
        toast.success(`${response.validInterns.length} pasantes registrados con éxito.`);
        const internsData = await apiService.getAllInternsWithinCourse(activeCourse.id);
        setInterns(internsData);
      }
      if (response.invalidRows.length > 0) {
        toast.warning(`${response.invalidRows.length} filas con errores no fueron importadas.`);
      }
    } catch (error) {
      toast.error('Error al subir el archivo.');
      throw error;
    }
  };

  if (!activeCourse) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, selecciona un curso para ver los pasantes asociados.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const actions = (
    <>
      <BulkUploadDialog
        title="Carga Masiva de Pasantes"
        description="Sube un archivo CSV con los datos de los pasantes"
        acceptedFileTypes=".csv"
        triggerText="Carga Masiva"
        columns={[
          'documentType',
          'document',
          'email',
          'firstNames',
          'lastNameFather',
          'lastNameMother',
          'phone',
          'universityName',
          'graduationYear',
          'referralSource',
          'topicsOfInterest',
          'country',
          'peruDepartment',
        ]}
        onUpload={handleBulkUpload}
      />
      <Button asChild className="w-full sm:w-auto">
        <Link href="/dashboard/interns/create">
          <UserPlus className="h-4 w-4 mr-2" />
          Registrar Pasante
        </Link>
      </Button>
    </>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Pasantes</h1>
          <p className="text-muted-foreground">
            Administra todos los pasantes registrados en el curso:{' '}
            <strong>{activeCourse.name}</strong>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <SearchWithFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar pasantes..."
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
          <CardTitle>Lista de Pasantes</CardTitle>
          <CardDescription>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando pasantes...
              </div>
            ) : (
              <>
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} pasante
                {totalItems !== 1 ? 's' : ''}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : paginatedInterns.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {interns.length === 0
                  ? 'No hay pasantes registrados en este curso.'
                  : 'No se encontraron pasantes con los criterios de búsqueda.'}
              </p>
            </div>
          ) : isMobile ? (
            // Cards for mobile view
            <div className="space-y-4">
              {paginatedInterns.map((intern) => (
                <Card key={intern.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">
                        {intern.firstNames} {intern.lastNameFather} {intern.lastNameMother}
                      </h3>
                      <p className="text-xs text-muted-foreground">{intern.email}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(intern)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/interns/${intern.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteIntern(intern)}
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
                      <span className="text-xs">{intern.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <University className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{intern.majorInProgress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{intern.universityName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IdCard className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">
                        {getDocTypeLabel(intern.documentType)}: {intern.document}
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInterns.map((intern) => (
                  <TableRow key={intern.id}>
                    <TableCell className="font-medium">
                      {intern.firstNames} {intern.lastNameFather} {intern.lastNameMother}
                    </TableCell>
                    <TableCell>{intern.email}</TableCell>
                    <TableCell>{intern.phone}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{getDocTypeLabel(intern.documentType)}</div>
                        <div className="text-muted-foreground">{intern.document}</div>
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
                          <DropdownMenuItem onClick={() => handleViewDetail(intern)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/interns/${intern.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteIntern(intern)}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setInternToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        description={
          internToDelete && (
            <>
              Esta acción no se puede deshacer. Esto eliminará al pasante{' '}
              <strong>
                {internToDelete.firstNames} {internToDelete.lastNameFather}{' '}
                {internToDelete.lastNameMother}
              </strong>{' '}
              y removerá todos sus datos del sistema.
            </>
          )
        }
        confirmButtonText="Eliminar pasante"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setInternToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        description={
          internToDelete && (
            <>
              Esta acción no se puede deshacer. Esto eliminará al pasante{' '}
              <strong>
                {internToDelete.firstNames} {internToDelete.lastNameFather}{' '}
                {internToDelete.lastNameMother}
              </strong>{' '}
              y removerá todos sus datos del sistema.
            </>
          )
        }
        confirmButtonText="Eliminar pasante"
      />

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent
          className={`${isMobile ? 'w-full' : 'w-[600px] sm:w-[800px]'} p-5 overflow-y-auto`}
        >
          {selectedIntern && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {selectedIntern.firstNames} {selectedIntern.lastNameFather}{' '}
                  {selectedIntern.lastNameMother}
                </SheetTitle>
                <SheetDescription>Información detallada del pasante</SheetDescription>
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
                        Nombre Completo: {''}
                        {selectedIntern.firstNames} {selectedIntern.lastNameFather}{' '}
                        {selectedIntern.lastNameMother}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Correo: {selectedIntern.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Teléfono: {selectedIntern.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IdCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {getDocTypeLabel(selectedIntern.documentType)}: {selectedIntern.document}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PersonStanding className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Género: {getGenderLabel(selectedIntern.gender)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedIntern.peruDepartment
                          ? `Lugar de Residencia: ${getDepartmentLabel(selectedIntern.peruDepartment)}, ${selectedIntern.country}`
                          : `Lugar de Residencia: ${selectedIntern.country}`}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Académica y Preferencias</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Carrera: {getMajorLabel(selectedIntern.majorInProgress)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <University className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Universidad: {selectedIntern.universityName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Año de Egreso: {selectedIntern.graduationYear}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Speech className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Referencia: {getReferralSourceLabel(selectedIntern.referralSource)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ejes Temáticos de Interés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedIntern.topicsOfInterest.map((topic, index) => (
                        <Badge key={index} variant="outline">
                          {getTopicLabel(topic)}
                        </Badge>
                      ))}
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
                      {new Date(selectedIntern.createdAt).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Última actualización:</span>{' '}
                      {new Date(selectedIntern.updatedAt).toLocaleDateString('es-ES')}
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
