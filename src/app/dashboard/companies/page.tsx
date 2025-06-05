'use client';

import { useState } from 'react';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Building2,
  Globe,
  Phone,
  Mail,
  User,
  Building,
} from 'lucide-react';

interface Intern {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

interface Mentor {
  id: number;
  name: string;
  email: string;
}

interface Company {
  id: number;
  organizationName: string;
  contactName: string;
  phone: string;
  email: string;
  organizationSize: string;
  country: string;
  internsCount: number;
  mentorsCount: number;
  topicsOfInterest: string;
  sector: string;
  status: 'active' | 'inactive';
  interns: Intern[];
  mentors: Mentor[];
}

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const companies: Company[] = [
    {
      id: 1,
      organizationName: 'TechCorp',
      contactName: 'Ariana Ramirez',
      phone: '+54 11 4567-8901',
      email: 'contacto@techcorp.com',
      organizationSize: 'Micro o pequeña',
      country: 'Perú',
      internsCount: 8,
      mentorsCount: 3,
      topicsOfInterest:
        'HC - Huella de Carbono y Cambio Climático, HH - Huella Hídrica y Gestión Responsable del Agua, CN - Carbono Neutralidad',
      sector: 'Privado',
      status: 'active',
      interns: [
        { id: 1, name: 'Ana García', email: 'ana@email.com', status: 'active' },
        { id: 2, name: 'Carlos López', email: 'carlos@email.com', status: 'active' },
      ],
      mentors: [
        { id: 1, name: 'Dr. Juan Pérez', email: 'juan@techcorp.com' },
        { id: 2, name: 'Ing. María Silva', email: 'maria@techcorp.com' },
      ],
    },
    {
      id: 2,
      organizationName: 'EcoSolutions',
      contactName: 'Luis Fernández',
      phone: '+54 11 2345-6789',
      email: 'luis@ecosolutions.pe',
      organizationSize: 'Mediana',
      country: 'Argentina',
      internsCount: 5,
      mentorsCount: 2,
      topicsOfInterest:
        'HC - Huella de Carbono y Cambio Climático, HH - Huella Hídrica y Gestión Responsable del Agua',
      sector: 'Privado',
      status: 'active',
      interns: [
        { id: 3, name: 'Sofía Martínez', email: 'a@q.com', status: 'active' },
        { id: 4, name: 'Pedro Gómez', email: 'a@.', status: 'inactive' },
      ],
      mentors: [
        { id: 3, name: 'Lic. Ana Torres', email: 'a@q.com' },
        { id: 4, name: 'Ing. Roberto Díaz', email: 'a@.' },
      ],
    },
    {
      id: 3,
      organizationName: 'GreenTech',
      contactName: 'María López',
      phone: '+54 11 3456-7890',
      email: 'contacto@greentech.com',
      organizationSize: 'Grande',
      country: 'Chile',
      internsCount: 12,
      mentorsCount: 5,
      topicsOfInterest:
        'HC - Huella de Carbono y Cambio Climático, HH - Huella Hídrica y Gestión Responsable del Agua, CN - Carbono Neutralidad',
      sector: 'Privado',
      status: 'inactive',
      interns: [
        { id: 5, name: 'Laura Pérez', email: 'laura@mail.com', status: 'active' },
        { id: 6, name: 'Javier Ruiz', email: 'javi@mail.com', status: 'inactive' },
      ],
      mentors: [
        { id: 5, name: 'Dr. Carlos Ramírez', email: 'carlitoss@mail.com' },
        { id: 6, name: 'Ing. Paula Fernández', email: 'paulaing@mail.com' },
      ],
    },
  ];

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleViewDetail = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Empresas</h1>
          <p className="text-muted-foreground">Administra todas las empresas participantes</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar empresas..."
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
                <DialogTitle>Carga Masiva de Empresas</DialogTitle>
                <DialogDescription>
                  Sube un archivo CSV con los datos de las empresas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input type="file" accept=".csv" />
                <div className="text-sm text-muted-foreground">
                  <p>El archivo CSV debe contener las siguientes columnas:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>nombre</li>
                    <li>contacto</li>
                    <li>telefono</li>
                  </ul>
                </div>
                <Button className="w-full">Subir Archivo</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link href="/dashboard/companies/create">
              <Building2 className="h-4 w-4 mr-2" />
              Registrar Empresa
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <CardDescription>
            {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''} encontrada
            {filteredCompanies.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Pasantes</TableHead>
                <TableHead>Mentores</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.organizationName}</TableCell>
                  <TableCell>
                    <div>
                      <div>{company.contactName}</div>
                      <div className="text-sm text-muted-foreground">{company.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{company.internsCount}</TableCell>
                  <TableCell className="text-center">{company.mentorsCount}</TableCell>
                  <TableCell>
                    <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                      {company.status === 'active' ? 'Activa' : 'Inactiva'}
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
                        <DropdownMenuItem onClick={() => handleViewDetail(company)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/companies/${company.id}/edit`}>
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
        <SheetContent className="w-[800px] sm:w-[800px] overflow-y-auto">
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
                {/* Información básica */}
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
                        {selectedCompany.sector} | {selectedCompany.organizationSize}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCompany.country}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Ejes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ejes Temáticos de Interés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedCompany.topicsOfInterest.split(', ').map((req, index) => (
                        <Badge key={index} variant="outline">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs para Pasantes y Mentores */}
                <Tabs defaultValue="interns" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="interns">Pasantes Asignados</TabsTrigger>
                    <TabsTrigger value="mentors">Mentores Asignados</TabsTrigger>
                  </TabsList>

                  <TabsContent value="interns" className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        {selectedCompany.interns.length > 0 ? (
                          <div className="space-y-4">
                            {selectedCompany.interns.map((intern) => (
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

                  <TabsContent value="mentors" className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        {selectedCompany.mentors.length > 0 ? (
                          <div className="space-y-4">
                            {selectedCompany.mentors.map((mentor) => (
                              <div
                                key={mentor.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div>
                                  <div className="font-medium">{mentor.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {mentor.email}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-8">
                            No hay mentores asignados
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
