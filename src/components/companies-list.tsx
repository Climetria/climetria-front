"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  MoreHorizontal,
  Search,
  Eye,
  Edit,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface Company {
  id: string
  email: string
  nombreCompleto: string
  celular: string
  pais: string
  organizacion: string
  ruc: string
  tamanoOrganizacion: "micro_pequena" | "mediana_grande"
  sector: string
  ejesTematicos: string[]
  fechaRegistro: string
  estado: "activa" | "pendiente" | "inactiva"
}

// Datos de ejemplo
const companiesData: Company[] = [
  {
    id: "1",
    email: "contacto@ecoinnovate.pe",
    nombreCompleto: "María González Rodríguez",
    celular: "+51 999 123 456",
    pais: "peru",
    organizacion: "EcoInnovate SAC",
    ruc: "20123456789",
    tamanoOrganizacion: "micro_pequena",
    sector: "privado",
    ejesTematicos: ["hc", "cn"],
    fechaRegistro: "2024-01-15",
    estado: "activa",
  },
  {
    id: "2",
    email: "admin@greensolutions.com",
    nombreCompleto: "Carlos Mendoza Silva",
    celular: "+51 987 654 321",
    pais: "peru",
    organizacion: "Green Solutions EIRL",
    ruc: "10987654321",
    tamanoOrganizacion: "mediana_grande",
    sector: "privado",
    ejesTematicos: ["hh", "hc"],
    fechaRegistro: "2024-01-20",
    estado: "activa",
  },
  {
    id: "3",
    email: "info@municipalidad.gob.pe",
    nombreCompleto: "Ana Patricia Vega",
    celular: "+51 955 111 222",
    pais: "peru",
    organizacion: "Municipalidad Provincial de Lima",
    ruc: "20100047218",
    tamanoOrganizacion: "mediana_grande",
    sector: "publico",
    ejesTematicos: ["hc", "hh", "cn"],
    fechaRegistro: "2024-01-25",
    estado: "pendiente",
  },
  {
    id: "4",
    email: "contacto@ongverde.org",
    nombreCompleto: "Roberto Castillo Herrera",
    celular: "+51 944 333 444",
    pais: "peru",
    organizacion: "ONG Verde Perú",
    ruc: "20555666777",
    tamanoOrganizacion: "micro_pequena",
    sector: "sociedad_civil",
    ejesTematicos: ["cn"],
    fechaRegistro: "2024-02-01",
    estado: "activa",
  },
  {
    id: "5",
    email: "info@ecotextil.pe",
    nombreCompleto: "Luisa Paredes Torres",
    celular: "+51 933 222 111",
    pais: "peru",
    organizacion: "EcoTextil Perú SAC",
    ruc: "20444555666",
    tamanoOrganizacion: "mediana_grande",
    sector: "privado",
    ejesTematicos: ["hc", "hh"],
    fechaRegistro: "2024-02-05",
    estado: "activa",
  },
  {
    id: "6",
    email: "contacto@agrosustentable.com",
    nombreCompleto: "Jorge Ramírez Flores",
    celular: "+51 922 333 444",
    pais: "peru",
    organizacion: "AgroSustentable SAC",
    ruc: "20666777888",
    tamanoOrganizacion: "micro_pequena",
    sector: "privado",
    ejesTematicos: ["hc", "cn"],
    fechaRegistro: "2024-02-10",
    estado: "pendiente",
  },
]

const ejesTematicosMap = {
  hc: { label: "Huella de Carbono", code: "HC" },
  hh: { label: "Huella Hídrica", code: "HH" },
  cn: { label: "Carbono Neutralidad", code: "CN" },
}

const sectorMap = {
  publico: { label: "Sector Público", icon: "🏛️" },
  privado: { label: "Sector Privado", icon: "🏢" },
  sociedad_civil: { label: "Sociedad Civil", icon: "🤝" },
  otro: { label: "Otros", icon: "📋" },
}

const estadoMap = {
  activa: { label: "Activa", color: "bg-green-100 text-green-800" },
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  inactiva: { label: "Inactiva", color: "bg-red-100 text-red-800" },
}

export function CompaniesList() {
  const [companies] = useState<Company[]>(companiesData)
  const [searchTerm, setSearchTerm] = useState("")
  const [sectorFilter, setSectorFilter] = useState<string>("all")
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const totalCompanies = companies.length
  const percentageIncrease = 10 // Placeholder value
  const companiesThisMonth = companies.filter(
    (company) => new Date(company.fechaRegistro).getMonth() === new Date().getMonth(),
  ).length
  const activeCompanies = companies.filter((company) => company.estado === "activa").length
  const pendingCompanies = companies.filter((company) => company.estado === "pendiente").length

  // Filtrar empresas
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.organizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.ruc.includes(searchTerm) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSector = sectorFilter === "all" || company.sector === sectorFilter

    return matchesSearch && matchesSector
  })

  // Calcular paginación
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex)

  // Resetear página cuando cambian los filtros
  const resetPage = () => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }

  // Efecto para resetear página cuando cambian los filtros
  useEffect(() => {
    resetPage()
  }, [searchTerm, sectorFilter, totalPages])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1))
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1))

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Manejar selección de empresas
  const toggleSelectAll = () => {
    if (
      selectedCompanies.length === paginatedCompanies.length &&
      paginatedCompanies.every((company) => selectedCompanies.includes(company.id))
    ) {
      // Deseleccionar todas las empresas de la página actual
      setSelectedCompanies(selectedCompanies.filter((id) => !paginatedCompanies.some((company) => company.id === id)))
    } else {
      // Seleccionar todas las empresas de la página actual
      const currentPageIds = paginatedCompanies.map((company) => company.id)
      const newSelected = [...new Set([...selectedCompanies, ...currentPageIds])]
      setSelectedCompanies(newSelected)
    }
  }

  const toggleSelectCompany = (id: string) => {
    if (selectedCompanies.includes(id)) {
      setSelectedCompanies(selectedCompanies.filter((companyId) => companyId !== id))
    } else {
      setSelectedCompanies([...selectedCompanies, id])
    }
  }

  const handleViewCompany = (id: string) => {
    console.log("Ver empresa:", id)
  }

  const handleEditCompany = (id: string) => {
    console.log("Editar empresa:", id)
  }

  const handleDeleteCompany = (id: string) => {
    console.log("Eliminar empresa:", id)
  }

  const handleExportData = () => {
    console.log("Exportar datos")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Empresas Registradas</h1>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Empresas</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold">{totalCompanies}</p>
                <span className="ml-2 text-xs text-green-600">+{percentageIncrease}% desde el último mes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Empresas Hoy</p>
              <p className="text-2xl font-bold">{companiesThisMonth}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Empresas Activas</p>
              <p className="text-2xl font-bold">{activeCompanies}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Empresas Pendientes</p>
              <p className="text-2xl font-bold">{pendingCompanies}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y acciones */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por empresa, contacto, RUC o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los sectores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sectores</SelectItem>
                <SelectItem value="publico">🏛️ Sector Público</SelectItem>
                <SelectItem value="privado">🏢 Sector Privado</SelectItem>
                <SelectItem value="sociedad_civil">🤝 Sociedad Civil</SelectItem>
                <SelectItem value="otro">📋 Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleExportData} className="w-full md:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Exportar Datos
        </Button>
      </div>

      {/* Tabla de empresas */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <div className="flex items-center">
                  <Checkbox
                    checked={
                      paginatedCompanies.length > 0 &&
                      paginatedCompanies.every((company) => selectedCompanies.includes(company.id))
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Seleccionar todas"
                  />
                </div>
              </TableHead>
              <TableHead className="w-[250px]">EMPRESA / RUC</TableHead>
              <TableHead>CONTACTO</TableHead>
              <TableHead>SECTOR</TableHead>
              <TableHead>EJES TEMÁTICOS</TableHead>
              <TableHead>FECHA REGISTRO</TableHead>
              <TableHead>ESTADO</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No se encontraron empresas con los filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              paginatedCompanies.map((company) => (
                <TableRow key={company.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedCompanies.includes(company.id)}
                      onCheckedChange={() => toggleSelectCompany(company.id)}
                      aria-label={`Seleccionar ${company.organizacion}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{company.organizacion}</span>
                      <span className="text-xs text-muted-foreground">{company.ruc}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{company.nombreCompleto}</span>
                      <span className="text-xs text-muted-foreground">{company.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span>
                        {sectorMap[company.sector as keyof typeof sectorMap]?.icon}{" "}
                        {sectorMap[company.sector as keyof typeof sectorMap]?.label}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {company.ejesTematicos.map((eje) => (
                        <Badge key={eje} variant="outline" className="text-xs">
                          {ejesTematicosMap[eje as keyof typeof ejesTematicosMap]?.code}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(company.fechaRegistro).toLocaleDateString("es-PE", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={estadoMap[company.estado].color}>
                      {estadoMap[company.estado].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewCompany(company.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditCompany(company.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteCompany(company.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 border-t bg-background">
          <div className="flex items-center space-x-6">
            <p className="text-sm text-muted-foreground">
              {selectedCompanies.length} de {filteredCompanies.length} empresa(s) seleccionada(s)
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Filas por página</p>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">
                Página {currentPage} de {totalPages === 0 ? 1 : totalPages}
              </p>
              <span className="text-sm text-muted-foreground">
                ({startIndex + 1}-{Math.min(endIndex, filteredCompanies.length)} de {filteredCompanies.length})
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">Primera página</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
              </Button>

              {/* Números de página */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Página siguiente</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToLastPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Última página</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
