'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone } from 'lucide-react';

type Intern = {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
};

type Mentor = {
  id: number;
  documentType: string;
  document: string;
  email: string;
  firstNames: string;
  lastNameFather: string;
  lastNameMother: string;
  phone: string;
  country: string;
  department: string;
  internsCount: number;
  status: 'active' | 'inactive';
  startDate: string;
  assignedInterns: Intern[];
};

export default function MentorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const mentors: Mentor[] = [
    {
      id: 1,
      documentType: 'DNI',
      document: '12345678',
      email: 'juan.perez@techcorp.com',
      firstNames: 'Juan',
      lastNameFather: 'Pérez',
      lastNameMother: 'Gómez',
      phone: '+54 11 1111-2222',
      country: 'Peru',
      department: 'Lima',
      internsCount: 3,
      status: 'active',
      startDate: '2024-01-15',
      assignedInterns: [
        { id: 1, name: 'Ana García', email: 'ana@email.com', status: 'active' },
        { id: 2, name: 'Carlos López', email: 'carlos@email.com', status: 'active' },
      ],
    },
    {
      id: 2,
      firstNames: 'Laura',
      lastNameFather: 'Martín',
      lastNameMother: 'Fernández',
      documentType: 'DNI',
      document: '87654321',
      email: 'laura.martin@devstudio.com',
      phone: '+54 11 3333-4444',
      country: 'Peru',
      department: 'Cusco',
      internsCount: 2,
      status: 'active',
      startDate: '2023-09-01',
      assignedInterns: [{ id: 3, name: 'Sofía Gómez', email: 'sofia@email.com', status: 'active' }],
    },
    {
      id: 3,
      firstNames: 'Roberto',
      lastNameFather: 'Silva',
      lastNameMother: 'Torres',
      documentType: 'DNI',
      document: '11223344',
      email: 'roberto.silva@datacorp.com',
      phone: '+54 11 5555-6666',
      country: 'Peru',
      department: 'Arequipa',
      internsCount: 4,
      status: 'active',
      startDate: '2022-05-20',
      assignedInterns: [
        { id: 4, name: 'Martín Castro', email: 'martin@email.com', status: 'active' },
        { id: 5, name: 'Valentina Díaz', email: 'valentina@email.com', status: 'active' },
        { id: 6, name: 'Lucas Pérez', email: 'lucas@email.com', status: 'active' },
      ],
    },
  ];

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.firstNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || mentor.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsDetailOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Mentores</h1>
          <p className="text-muted-foreground">Administra todos los mentores del curso</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Mentores</CardTitle>
          <CardDescription>
            {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 'es' : ''} encontrado
            {filteredMentors.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mentor</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Pasantes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMentors.map((mentor) => (
                <TableRow key={mentor.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{mentor.firstNames}</div>
                      <div className="text-sm text-muted-foreground">{mentor.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{mentor.country}</TableCell>
                  <TableCell className="text-center">{mentor.internsCount}</TableCell>
                  <TableCell>
                    <Badge variant={mentor.status === 'active' ? 'default' : 'secondary'}>
                      {mentor.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
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
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deshabilitar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                        {selectedMentor.department}, {selectedMentor.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IdCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedMentor.documentType}: {selectedMentor.document}
                      </span>
                    </div>
                    {/*
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Inicio: {new Date(selectedMentor.startDate).toLocaleDateString()}</span>
                    </div>*/}
                  </CardContent>
                </Card>

                {/* Tabs para Pasantes */}
                <Tabs defaultValue="interns" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="interns">Pasantes Asignados</TabsTrigger>
                  </TabsList>

                  <TabsContent value="interns" className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        {selectedMentor.assignedInterns &&
                        selectedMentor.assignedInterns.length > 0 ? (
                          <div className="space-y-4">
                            {selectedMentor.assignedInterns.map((intern) => (
                              <div
                                key={intern.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div>
                                  <div className="font-medium">{intern.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {intern.email}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <Badge
                                    variant={intern.status === 'active' ? 'default' : 'secondary'}
                                  >
                                    {intern.status === 'active' ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-8">
                            No hay pasantes asignados
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
