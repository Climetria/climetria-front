 
'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Separator } from '@/components/ui/separator';
import {
  Award,
  Calendar,
  CheckCircle,
  FileText,
  MessageSquare,
  Users,
  Building2,
  Star,
} from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { apiService, type DashboardMetrics } from '@/lib/api';
import { useCourse } from '@/context/CourseContext';
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';
import { ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const chartConfig = {
  value: {
    label: 'Cantidad',
    color: '#90EE90',
  },
  internsWithOrg: {
    label: 'Alumnos con Organización',
    color: '#90EE90',
  },
  organizationsWithTeam: {
    label: 'Organizaciones con Equipo',
    color: '#228B22',
  },
};

// Green color progression for multiple bars in the same chart
const greenColors = ['#90EE90', '#32CD32', '#228B22', '#006400', '#004d00'];

export default function DashboardPage() {
  const { activeCourse } = useCourse();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!activeCourse?.id) return;

      try {
        setLoading(true);
        const data = await apiService.getDashboardMetrics(activeCourse.id);
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las métricas');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [activeCourse?.id]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-2">Error al cargar el dashboard</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return 'En Desarrollo';
      case 'PENDING':
        return 'Pendiente';
      case 'FINISHED':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const parsedStudents = metrics.studentsPerCourse.map((item) => ({
    ...item,
    value: Number(item.value),
  }));

  return (
    <div className="space-y-6">
      {/* Top 3 Students Section */}
      {metrics.topInterns.length > 0 && (
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top 3 Alumnos con Mejores Puntajes
            </CardTitle>
            <CardDescription>
              Ranking de estudiantes destacados con indicadores de recomendación como mentores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topInterns.slice(0, 3).map((intern, index) => (
                <div
                  key={intern.internId}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{intern.fullName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {intern.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Recomendado como Mentor
                          </Badge>
                        )}
                        {intern.recommendationComment && (
                          <Badge variant="outline" className="text-xs">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Con Comentarios
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{intern.totalNote}</p>
                    <p className="text-xs text-muted-foreground">Puntos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Calendar Section */}
      {metrics.courseCalendar.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metrics.courseCalendar.map((course) => (
            <Card key={course.courseId} className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  {course.courseName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Inicio:</span>
                    <span className="font-medium">
                      {new Date(course.startDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fin:</span>
                    <span className="font-medium">
                      {new Date(course.endDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-center">
                  <Badge className={getStatusColor(course.status)}>
                    {getStatusText(course.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Students Per Course */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Alumnos por Curso
            </CardTitle>
            <CardDescription>Distribución de estudiantes por eje temático</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart
                accessibilityLayer
                data={parsedStudents}
                layout="vertical"
                margin={{
                  left: 0,
                }}
              >
                <YAxis
                  dataKey="courseName"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={120}
                />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" fill={greenColors[0]} radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Final Reports */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informes Finales Entregados
            </CardTitle>
            <CardDescription>Alumnos que completaron su informe final por curso</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart
                accessibilityLayer
                data={metrics.finalReportsPerCourse}
                layout="vertical"
                margin={{
                  left: 0,
                }}
              >
                <YAxis
                  dataKey="courseName"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={120}
                />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" fill={greenColors[0]} radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Talks */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Charlas de Resultados
            </CardTitle>
            <CardDescription>
              Alumnos que realizaron su charla de resultados por curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart
                accessibilityLayer
                data={metrics.talksPerCourse}
                layout="vertical"
                margin={{
                  left: 0,
                }}
              >
                <YAxis
                  dataKey="courseName"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={120}
                />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" fill={greenColors[0]} radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Fully Evaluated */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Alumnos Completamente Evaluados
            </CardTitle>
            <CardDescription>
              Estudiantes con todas sus calificaciones completas por curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart
                accessibilityLayer
                data={metrics.fullyEvaluatedPerCourse}
                layout="vertical"
                margin={{
                  left: 0,
                }}
              >
                <YAxis
                  dataKey="courseName"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={120}
                />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" fill={greenColors[0]} radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Certificates */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificados Entregados
            </CardTitle>
            <CardDescription>Alumnos que recibieron sus certificados por curso</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart
                accessibilityLayer
                data={metrics.certificatesPerCourse}
                layout="vertical"
                margin={{
                  left: 0,
                }}
              >
                <YAxis
                  dataKey="courseName"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={120}
                />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar
                  dataKey="value"
                  fill="#90EE90"
                  radius={5}
                  className="hover:opacity-80 transition-opacity duration-200"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Interns and Organizations - Stacked Horizontal */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Alumnos y Organizaciones
            </CardTitle>
            <CardDescription>
              Distribución de alumnos con organizaciones y equipos por curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart
                accessibilityLayer
                data={metrics.internsAndOrganizations}
                layout="vertical"
                margin={{
                  left: 0,
                }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="courseName"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={120}
                />
                <XAxis type="number" hide />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="internsWithOrg"
                  stackId="a"
                  fill="var(--color-internsWithOrg)"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="organizationsWithTeam"
                  stackId="a"
                  fill="var(--color-organizationsWithTeam)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
