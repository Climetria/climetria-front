'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { apiService, type CourseMetric, type DashboardMetrics } from '@/lib/api';
import { useCourse } from '@/context/CourseContext';
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';
import { ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const chartConfig = {
  value: {
    label: 'Cantidad',
    color: 'var(--primary)',
  },
  internsWithOrg: {
    label: 'Alumnos con Organización',
    color: 'var(--primary)',
  },
  organizationsWithTeam: {
    label: 'Organizaciones con Equipo',
    color: '#7fb98f',
  },
};

// Altura según la cantidad de cursos, para que las barras no se estiren
const chartHeight = (rows: number) => Math.max(rows, 1) * 56 + 24;

// Las fechas de curso son @db.Date (medianoche UTC): formatear en UTC evita que salgan un día antes
const formatCourseDate = (date: string) =>
  new Date(date).toLocaleDateString('es-PE', { timeZone: 'UTC' });

function EmptyChart() {
  return (
    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
      Aún no hay datos
    </div>
  );
}

function CourseBarChart({ data }: { data: CourseMetric[] }) {
  const rows = data.map((item) => ({ ...item, value: Number(item.value) }));
  if (rows.length === 0 || rows.every((row) => row.value === 0)) return <EmptyChart />;

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto w-full"
      style={{ height: chartHeight(rows.length) }}
    >
      <BarChart accessibilityLayer data={rows} layout="vertical" margin={{ left: 0, right: 32 }}>
        <YAxis
          dataKey="courseName"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          width={140}
        />
        <XAxis dataKey="value" type="number" hide allowDecimals={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} maxBarSize={28}>
          <LabelList dataKey="value" position="right" className="fill-foreground" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function ChartCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { activeCourse, courses, isFetched: coursesFetched } = useCourse();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!activeCourse?.id) return;

      try {
        setLoading(true);
        const data = await apiService.getDashboardMetricsWithinCourse(activeCourse.id);
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las métricas');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [activeCourse?.id]);

  // Sin cursos no hay métricas que pedir: sin esto el esqueleto de carga se queda para siempre
  if (coursesFetched && courses.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <Calendar className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">Aún no hay cursos</p>
            <p className="text-sm text-muted-foreground">
              Crea el primer curso para empezar a registrar organizaciones, mentores y pasantes.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/courses/create">Crear curso</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Top 3 Students Section */}
      {metrics.topInternsByCourse.length > 0 && (
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
              {metrics.topInternsByCourse.slice(0, 3).map((intern, index) => (
                <div
                  key={intern.internId}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors duration-200"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{intern.fullName}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
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
                  <div className="shrink-0 pl-4 text-right">
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
                    <span className="font-medium">{formatCourseDate(course.startDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fin:</span>
                    <span className="font-medium">{formatCourseDate(course.endDate)}</span>
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
        <ChartCard
          icon={Users}
          title="Alumnos por Curso"
          description="Alumnos inscritos en cada curso"
        >
          <CourseBarChart data={metrics.studentsPerCourse} />
        </ChartCard>

        <ChartCard
          icon={FileText}
          title="Informes Finales Entregados"
          description="Alumnos que completaron su informe final por curso"
        >
          <CourseBarChart data={metrics.finalReportsPerCourse} />
        </ChartCard>

        <ChartCard
          icon={MessageSquare}
          title="Charlas de Resultados"
          description="Alumnos que realizaron su charla de resultados por curso"
        >
          <CourseBarChart data={metrics.talksPerCourse} />
        </ChartCard>

        <ChartCard
          icon={CheckCircle}
          title="Alumnos Completamente Evaluados"
          description="Alumnos con todas sus calificaciones completas por curso"
        >
          <CourseBarChart data={metrics.fullyEvaluatedPerCourse} />
        </ChartCard>

        <ChartCard
          icon={Award}
          title="Certificados Entregados"
          description="Alumnos que recibieron sus certificados por curso"
        >
          <CourseBarChart data={metrics.certificatesPerCourse} />
        </ChartCard>

        <ChartCard
          icon={Building2}
          title="Alumnos y Organizaciones"
          description="Alumnos asignados a una organización y organizaciones con equipo, por curso"
        >
          {metrics.internsAndOrganizations.length === 0 ? (
            <EmptyChart />
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto w-full"
              style={{ height: chartHeight(metrics.internsAndOrganizations.length) * 1.5 + 32 }}
            >
              <BarChart
                accessibilityLayer
                data={metrics.internsAndOrganizations}
                layout="vertical"
                margin={{ left: 0, right: 32 }}
                barGap={4}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="courseName"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={140}
                />
                <XAxis type="number" hide allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="internsWithOrg"
                  fill="var(--color-internsWithOrg)"
                  radius={4}
                  maxBarSize={20}
                >
                  <LabelList
                    dataKey="internsWithOrg"
                    position="right"
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
                <Bar
                  dataKey="organizationsWithTeam"
                  fill="var(--color-organizationsWithTeam)"
                  radius={4}
                  maxBarSize={20}
                >
                  <LabelList
                    dataKey="organizationsWithTeam"
                    position="right"
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
