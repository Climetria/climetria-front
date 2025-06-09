'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Upload,
  UserPlus,
  Users,
  Globe,
  IdCard,
  AlertCircle,
  Loader2,
  University,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Mail, Phone } from 'lucide-react';
import { useCourse } from '@/context/CourseContext';
import { apiService, Intern } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Helper function to map topics of interest
const getTopicLabel = (topic: string) => {
  const topicMap = {
    CN: 'Carbono Neutralidad',
    HH: 'Huella Hídrica',
    HC: 'Huella de Carbono',
  };
  return topicMap[topic as keyof typeof topicMap] || topic;
};

const getDocTypeLabel = (docType: string) => {
  const docTypeMap = {
    DNI: 'DNI',
    CE: 'Carné de Extranjería',
    PASSPORT: 'Pasaporte',
  };
  return docTypeMap[docType as keyof typeof docTypeMap] || docType;
};

export default function InternList() {
  const { activeCourse } = useCourse();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        const internsData = await apiService.getInterns(activeCourse.id);
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

  const filteredInterns = interns.filter((intern) => {
    const matchesSearch =
      intern.firstNames ||
      intern.lastNameFather ||
      intern.lastNameMother.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleViewDetail = (intern: Intern) => {
    setSelectedIntern(intern);
    setIsDetailOpen(true);
  };

  const handleDeleteIntern = async (intern: Intern) => {
    if (!activeCourse) return;

    if (
      confirm(
        `¿Estás seguro de que quieres eliminar al pasante "${intern.firstNames} ${intern.lastNameFather} ${intern.lastNameMother}"?`,
      )
    ) {
      try {
        await apiService.deleteIntern(activeCourse.id, intern.id);
        setInterns(interns.filter((c) => c.id !== intern.id));
      } catch (err) {
        console.error('Error deleting intern:', err);
        alert('Error al eliminar al pasante. Por favor, intenta nuevamente.');
      }
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar pasantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Carga Masiva
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Carga Masiva de Pasantes</DialogTitle>
                <DialogDescription>
                  Sube un archivo CSV con los datos de los pasantes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input type="file" accept=".csv" />
                <div className="text-sm text-muted-foreground">
                  <p>El archivo CSV debe contener las siguientes columnas:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>nombre</li>
                    <li>email</li>
                    <li>telefono</li>
                  </ul>
                </div>
                <Button className="w-full">Subir Archivo</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link href="/dashboard/interns/create">
              <UserPlus className="h-4 w-4 mr-2" />
              Registrar Pasante
            </Link>
          </Button>
        </div>
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
                {filteredInterns.length} pasante{filteredInterns.length !== 1 ? 's' : ''} encontrado
                {filteredInterns.length !== 1 ? 's' : ''}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredInterns.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {interns.length === 0
                  ? 'No hay pasantes registrados en este curso.'
                  : 'No se encontraron pasantes con los criterios de búsqueda.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Número de celular</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterns.map((intern) => (
                  <TableRow key={intern.id}>
                    <TableCell className="font-medium truncate">
                      {intern.firstNames} {intern.lastNameFather} {intern.lastNameMother}
                    </TableCell>
                    <TableCell>{intern.email}</TableCell>
                    <TableCell>{intern.phone}</TableCell>
                    <TableCell>
                      <div>
                        <div>{getDocTypeLabel(intern.documentType)}</div>
                        <div className="text-sm text-muted-foreground">{intern.document}</div>
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
                            <Link href={`/interns/${intern.id}/edit`}>
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
      </Card>
      {/* Side Slide Detail */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
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
                {/* Información básica */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedIntern.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedIntern.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedIntern.peruDepartment}, {selectedIntern.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IdCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {getDocTypeLabel(selectedIntern.documentType)}: {selectedIntern.document}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <University className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedIntern.profession}, {selectedIntern.universityName}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Topics of Interest */}
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

                {/* Fechas */}
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
