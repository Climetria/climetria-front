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
  UserPlus,
  Users,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Intern {
  id: number;
  documentType: string; // You might want to create a specific type for DocumentType
  document: string;
  email: string;
  firstNames: string;
  lastNameFather: string;
  lastNameMother: string;
  phone: string;
  universityName: string;
  profession: string;
  graduationYear: number;
  referralSource: string;
  country: string;
  peruDepartment: string;
  company: string;
  mentor: string;
  status: 'active' | 'inactive';
  startDate: string;
}

export default function InternList() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const interns: Intern[] = [
    {
      id: 1,
      documentType: 'DNI',
      document: '12345678',
      email: 'ana.garcia@example.com',
      firstNames: 'Ana Maria',
      lastNameFather: 'Garcia',
      lastNameMother: 'Lopez',
      phone: '+51 987654321',
      universityName: 'Universidad Nacional Mayor de San Marcos',
      profession: 'Ingeniería de Software',
      graduationYear: 2023,
      referralSource: 'LinkedIn',
      country: 'Perú',
      peruDepartment: 'Lima',
      company: 'TechCorp',
      mentor: 'Juan Perez',
      status: 'active',
      startDate: '2024-01-15',
    },
    {
      id: 2,
      documentType: 'CE',
      document: '87654321',
      email: 'carlos.rodriguez@example.com',
      firstNames: 'Carlos Jose',
      lastNameFather: 'Rodriguez',
      lastNameMother: 'Silva',
      phone: '+51 912345678',
      universityName: 'Pontificia Universidad Católica del Perú',
      profession: 'Ingeniería Industrial',
      graduationYear: 2024,
      referralSource: 'Universidad',
      country: 'Perú',
      peruDepartment: 'Arequipa',
      company: 'InnovaSoft',
      mentor: 'Maria Torres',
      status: 'inactive',
      startDate: '2023-08-20',
    },
  ];

  const filteredInterns = interns.filter((intern) => {
    const matchesSearch =
      intern.firstNames ||
      intern.lastNameFather ||
      intern.lastNameMother.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || intern.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (intern: Intern) => {
    setSelectedIntern(intern);
    setIsDetailOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Pasantes</h1>
          <p className="text-muted-foreground">Administra todos los pasantes registrados</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pasantes</CardTitle>
          <CardDescription>
            {filteredInterns.length} pasante{filteredInterns.length !== 1 ? 's' : ''} encontrado
            {filteredInterns.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Estado</TableHead>
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
                  <TableCell>{intern.company}</TableCell>
                  <TableCell>{intern.mentor}</TableCell>
                  <TableCell>
                    <Badge variant={intern.status === 'active' ? 'default' : 'secondary'}>
                      {intern.status === 'active' ? 'Activo' : 'Inactivo'}
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
                        {selectedIntern.documentType}: {selectedIntern.document}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Asignaciones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Asignaciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Empresa:</Label>
                      <p className="text-sm text-muted-foreground">{selectedIntern.company}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Mentor:</Label>
                      <p className="text-sm text-muted-foreground">{selectedIntern.mentor}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Fecha de Inicio:</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedIntern.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs para Calificaciones y Certificados */}
                <Tabs defaultValue="grades" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="grades">Calificaciones</TabsTrigger>
                    <TabsTrigger value="certificates">Certificados</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
