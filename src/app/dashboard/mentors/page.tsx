'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  UserCheck,
  Globe,
  IdCard,
  AlertCircle,
  Loader2,
  UserPlus,
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
import { apiService, Mentor } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

const getDocTypeLabel = (docType: string) => {
  const docTypeMap = {
    DNI: 'DNI',
    CE: 'Carné de Extranjería',
    PASSPORT: 'Pasaporte',
  };
  return docTypeMap[docType as keyof typeof docTypeMap] || docType;
};

export default function MentorsPage() {
  const { activeCourse } = useCourse();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.firstNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.country.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

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
        setMentors(mentors.filter((c) => c.id !== mentor.id));
      } catch (err) {
        console.error('Error deleting mentor:', err);
        alert('Error al eliminar al mentor. Por favor, intenta nuevamente.');
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
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Mentores</h1>
          <p className="text-muted-foreground">
            Administra todos los mentores asignados al curso: <strong>{activeCourse.name}</strong>
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar mentores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
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
                <DialogTitle>Carga Masiva de Mentores</DialogTitle>
                <DialogDescription>
                  Sube un archivo CSV con los datos de los mentores
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
                    <li>empresa</li>
                    <li>especialidad</li>
                  </ul>
                </div>
                <Button className="w-full">Subir Archivo</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link href="/dashboard/mentors/create">
              <UserCheck className="h-4 w-4 mr-2" />
              Registrar Mentor
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
          <CardTitle>Lista de Mentores</CardTitle>
          <CardDescription>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando pasantes...
              </div>
            ) : (
              <>
                {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 'es' : ''} encontrado
                {filteredMentors.length !== 1 ? 's' : ''}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {mentors.length === 0
                  ? 'No hay mentores asignados a este curso.'
                  : 'No se encontraron mentores con los criterios de búsqueda.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMentors.map((mentor) => (
                  <TableRow key={mentor.id}>
                    <TableCell className="font-medium truncate">
                      {mentor.firstNames} {mentor.lastNameFather} {mentor.lastNameMother}
                    </TableCell>
                    <TableCell>{mentor.email}</TableCell>
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
      </Card>
      {/* Side Slide Detail */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
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
                {/* Información básica */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                        {selectedMentor.peruDepartment}, {selectedMentor.country}
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

                {/* Fechas */}
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
