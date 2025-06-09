'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { apiService, Company } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCourse } from '@/context/CourseContext';

// Helper function to map organization size
const getOrganizationSizeLabel = (size: string) => {
  const sizeMap = {
    SMALL: 'Pequeña',
    LARGE: 'Grande',
  };
  return sizeMap[size as keyof typeof sizeMap] || size;
};

// Helper function to map topics of interest
const getTopicLabel = (topic: string) => {
  const topicMap = {
    CN: 'Carbono Neutralidad',
    HH: 'Huella Hídrica',
    HC: 'Huella de Carbono',
  };
  return topicMap[topic as keyof typeof topicMap] || topic;
};

export default function CompaniesPage() {
  const { activeCourse } = useCourse();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setError('Error al cargar las empresas. Por favor, intenta nuevamente.');
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [activeCourse]);

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleViewDetail = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  const handleDeleteCompany = async (company: Company) => {
    if (!activeCourse) return;

    if (
      confirm(`¿Estás seguro de que quieres eliminar la empresa "${company.organizationName}"?`)
    ) {
      try {
        await apiService.deleteCompany(activeCourse.id, company.id);
        setCompanies(companies.filter((c) => c.id !== company.id));
      } catch (err) {
        console.error('Error deleting company:', err);
        alert('Error al eliminar la empresa. Por favor, intenta nuevamente.');
      }
    }
  };

  if (!activeCourse) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, selecciona un curso para ver las empresas asociadas.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Empresas</h1>
          <p className="text-muted-foreground">
            Administra las empresas del curso: <strong>{activeCourse.name}</strong>
          </p>
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
                    <li>organizationName</li>
                    <li>contactName</li>
                    <li>email</li>
                    <li>phone</li>
                  </ul>
                </div>
                <Button className="w-full">Subir Archivo</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link href={`/dashboard/companies/create`}>
              <Building2 className="h-4 w-4 mr-2" />
              Registrar Empresa
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
          <CardTitle>Lista de Empresas</CardTitle>
          <CardDescription>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando empresas...
              </div>
            ) : (
              <>
                {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''}{' '}
                encontrada
                {filteredCompanies.length !== 1 ? 's' : ''}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {companies.length === 0
                  ? 'No hay empresas registradas en este curso.'
                  : 'No se encontraron empresas con los criterios de búsqueda.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>País</TableHead>
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
                    <TableCell>{company.sector}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getOrganizationSizeLabel(company.organizationSize)}
                      </Badge>
                    </TableCell>
                    <TableCell>{company.country}</TableCell>
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

                {/* Fechas */}
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
