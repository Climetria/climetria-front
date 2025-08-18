/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Plus, MoreHorizontal, Eye, Edit, UserMinus, Trash2, Building2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PromoterDetailModal } from '@/components/promoter-detail-modal';
import { PromoterListModal } from '@/components/promoter-list-modal';

// Mock data para promotores
const mockPromoters = [
  {
    id: '1',
    logoUrl:
      'https://climetria-images-for-certificates.s3.us-east-1.amazonaws.com/logos/8b6b332d-d61c-4df0-a0ff-efd55a797462.png',
    signerFullName: 'Juan Pérez',
    signerTitle: 'Gerente General',
    signerSignatureUrl:
      'https://climetria-images-for-certificates.s3.us-east-1.amazonaws.com/signatures/7376e254-040b-4db5-9613-81872eabf702.png',
    organizationName: 'Empresa ABC',
    status: 'active',
    assignedCourses: 3,
  },
  {
    id: '2',
    logoUrl:
      'https://climetria-images-for-certificates.s3.us-east-1.amazonaws.com/logos/8b6b332d-d61c-4df0-a0ff-efd55a797462.png',
    signerFullName: 'María González',
    signerTitle: 'Directora de RRHH',
    signerSignatureUrl:
      'https://climetria-images-for-certificates.s3.us-east-1.amazonaws.com/signatures/7376e254-040b-4db5-9613-81872eabf702.png',
    organizationName: 'Corporación XYZ',
    status: 'active',
    assignedCourses: 1,
  },
];

// Mock data para Climetría (sponsor fijo)
const mockClimetria = {
  id: 'climetria',
  logoUrl:
    'https://climetria-images-for-certificates.s3.us-east-1.amazonaws.com/logos/8b6b332d-d61c-4df0-a0ff-efd55a797462.png',
  signerFullName: 'Carlos Rodríguez',
  signerTitle: 'CEO Climetría',
  signerSignatureUrl:
    'https://climetria-images-for-certificates.s3.us-east-1.amazonaws.com/signatures/7376e254-040b-4db5-9613-81872eabf702.png',
  organizationName: 'Climetría',
  status: 'active',
  assignedCourses: 15,
};

export default function PromotoresPage() {
  const router = useRouter();
  const [showPromoterList, setShowPromoterList] = useState(false);
  const [selectedPromoter, setSelectedPromoter] = useState<any>(null);
  const [showPromoterDetail, setShowPromoterDetail] = useState(false);

  const handleViewDetail = (promoter: any) => {
    setSelectedPromoter(promoter);
    setShowPromoterDetail(true);
  };

  const handleEditPromoter = (promoterId: string) => {
    router.push(`/promotores/editar/${promoterId}`);
  };

  const handleEditClimetria = () => {
    router.push('/promotores/editar/climetria');
  };

  const handleUnassign = (promoterId: string) => {
    // Mock API call
    console.log('Desasignando promotor:', promoterId);
  };

  const handleDelete = (promoterId: string) => {
    // Mock API call
    console.log('Eliminando promotor:', promoterId);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          Gestión de Promotores y Climetría
        </h1>
        <p className="text-muted-foreground">
          Administra los promotores y la información de Climetría para los certificados
        </p>
      </div>

      <div className="space-y-6">
        {/* Sección de Promotores */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Promotores</CardTitle>
                  <CardDescription>
                    Organizaciones que promueven y certifican cursos
                  </CardDescription>
                </div>
              </div>
              <Button onClick={() => setShowPromoterList(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Promotor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {mockPromoters.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No hay promotores registrados</p>
                <Button onClick={() => setShowPromoterList(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Promotor
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organización</TableHead>
                    <TableHead>Firmante</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPromoters.map((promoter) => (
                    <TableRow key={promoter.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={promoter.logoUrl || '/placeholder.svg'}
                              alt={promoter.organizationName}
                            />
                            <AvatarFallback>
                              {promoter.organizationName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{promoter.organizationName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{promoter.signerFullName}</TableCell>
                      <TableCell>{promoter.signerTitle}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(promoter)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPromoter(promoter.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUnassign(promoter.id)}>
                              <UserMinus className="h-4 w-4 mr-2" />
                              Desasignar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(promoter.id)}
                              className="text-destructive"
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

        {/* Sección de Climetría */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Climetría</CardTitle>
                  <CardDescription>
                    Información del sponsor principal para certificados
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" onClick={handleEditClimetria}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Datos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={mockClimetria.logoUrl || '/placeholder.svg'}
                  alt={mockClimetria.organizationName}
                />
                <AvatarFallback>CL</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{mockClimetria.organizationName}</h3>
                <p className="text-muted-foreground">
                  <span className="font-medium">Firmante:</span> {mockClimetria.signerFullName}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Cargo:</span> {mockClimetria.signerTitle}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => handleViewDetail(mockClimetria)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal para lista de promotores */}
      <PromoterListModal
        open={showPromoterList}
        onOpenChange={setShowPromoterList}
        promoters={mockPromoters}
      />

      {/* Modal para detalle de promotor */}
      <PromoterDetailModal
        open={showPromoterDetail}
        onOpenChange={setShowPromoterDetail}
        promoter={selectedPromoter}
      />
    </div>
  );
}
