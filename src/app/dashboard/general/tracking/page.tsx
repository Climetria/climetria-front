'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Award, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { apiService, type Intern, type Grade, type Attendance } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Types for the evaluation data
type AttendanceValue = 'A' | 'T' | 'F' | 'FJ' | '';
type ScoreValue = 1 | 2 | 3 | 4 | 5 | 0;

interface StudentData {
  id: string;
  gradeId?: string;
  nombres: string;
  apellidos: string;
  courseName?: string;
  mentorName?: string;
  attendance: {
    s1: AttendanceValue;
    s2: AttendanceValue;
    s3: AttendanceValue;
    s4: AttendanceValue;
    s5: AttendanceValue;
    s6: AttendanceValue;
  };
  inscriptionEvaluation: {
    compromisoInicial: ScoreValue;
    comunicacionAsertiva: ScoreValue;
    puntualidad: ScoreValue;
    participacionClase: ScoreValue;
    proactividad: ScoreValue;
  };
  classEvaluation: {
    habilidadesComunicacion: ScoreValue;
    puntualidadEntrega: ScoreValue;
  };
  internshipEvaluation: {
    reduccionOrtografia: ScoreValue;
    desempenoPartner: ScoreValue;
    recomendacionMentoria: string;
  };
  finalEvaluation: {
    totalNote: number;
    finalReportCheck: boolean;
    talkCheck: boolean;
    recommendationCheck: boolean;
    internshipCertificate: boolean;
    courseCertificate: boolean;
  };
}

export default function GlobalInternshipTracking() {
  const [data, setData] = useState<StudentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Map API attendance to component attendance
  const mapApiAttendanceToComponent = (apiAttendance?: Attendance): AttendanceValue => {
    if (!apiAttendance) return '';
    return apiAttendance as AttendanceValue;
  };

  // Convert API data to component format
  const convertApiDataToComponent = (
    intern: Intern,
    grade?: Grade,
    courseName?: string,
    mentorName?: string,
  ): StudentData => {
    return {
      id: intern.id,
      gradeId: grade?.id,
      nombres: intern.firstNames,
      apellidos: `${intern.lastNameFather} ${intern.lastNameMother}`.trim(),
      courseName: courseName,
      mentorName: mentorName,
      attendance: {
        s1: mapApiAttendanceToComponent(grade?.s1),
        s2: mapApiAttendanceToComponent(grade?.s2),
        s3: mapApiAttendanceToComponent(grade?.s3),
        s4: mapApiAttendanceToComponent(grade?.s4),
        s5: mapApiAttendanceToComponent(grade?.s5),
        s6: mapApiAttendanceToComponent(grade?.s6),
      },
      inscriptionEvaluation: {
        compromisoInicial: (grade?.initialCommitment || 0) as ScoreValue,
        comunicacionAsertiva: (grade?.assertiveCommunication || 0) as ScoreValue,
        puntualidad: (grade?.punctuality || 0) as ScoreValue,
        participacionClase: (grade?.classParticipation || 0) as ScoreValue,
        proactividad: (grade?.proactivity || 0) as ScoreValue,
      },
      classEvaluation: {
        habilidadesComunicacion: (grade?.communicationSkills || 0) as ScoreValue,
        puntualidadEntrega: (grade?.punctualityOfDelivery || 0) as ScoreValue,
      },
      internshipEvaluation: {
        reduccionOrtografia: (grade?.redaction || 0) as ScoreValue,
        desempenoPartner: (grade?.performance || 0) as ScoreValue,
        recomendacionMentoria: grade?.recommendation || '',
      },
      finalEvaluation: {
        totalNote: grade?.totalNote || 0,
        finalReportCheck: grade?.finalReportCheck || false,
        talkCheck: grade?.talkCheck || false,
        recommendationCheck: grade?.recommendationCheck || false,
        internshipCertificate: grade?.internshipCertificate || false,
        courseCertificate: grade?.courseCertificate || false,
      },
    };
  };

  // Fetch data from API using global endpoints
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Get all data globally
      const [interns, grades, courses, mentors] = await Promise.all([
        apiService.getAllInterns(),
        apiService.getInternGradeGlobally(),
        apiService.getAllCourses(),
        apiService.getAllMentors(),
      ]);

      // Create maps for quick lookup
      const courseMap = new Map(courses.map((course) => [course.id, course.name]));
      const mentorMap = new Map(
        mentors.map((mentor) => [
          mentor.id,
          `${mentor.firstNames} ${mentor.lastNameFather} ${mentor.lastNameMother}`.trim(),
        ]),
      );
      const gradeMap = new Map(
        Array.isArray(grades) ? grades.map((grade) => [grade.internId, grade]) : [],
      );

      // Convert to student data format
      const studentsWithGrades = interns.map((intern) => {
        const grade = gradeMap.get(intern.id);
        // Handle courseIds as array - take the first course if available
        const courseId =
          intern.courseIds && intern.courseIds.length > 0 ? intern.courseIds[0] : intern.courseId; // Fallback to singular courseId for backward compatibility
        const courseName = courseId
          ? courseMap.get(courseId) || 'Curso desconocido'
          : 'Sin curso asignado';
        // Map mentor ID to mentor name
        const mentorName = grade?.mentorId
          ? mentorMap.get(grade.mentorId) || 'Mentor desconocido'
          : 'Sin asignar';

        return convertApiDataToComponent(intern, grade, courseName, mentorName);
      });

      setData(studentsWithGrades);
    } catch (error) {
      console.error('Error fetching global data:', error);
      toast.error('No se pudieron cargar los datos globales de los pasantes.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle certificate button click
  const handleInternshipCertificateClick = (studentId: string, gradeId?: string) => {
    if (!gradeId) {
      toast.error('No se puede generar el certificado. No hay calificaciones disponibles.');
      return;
    }
    router.push(`/internship-certificate/?id=${gradeId}`);
  };

  const handleCourseCertificateClick = (studentId: string) => {
    router.push(`/course-certificate/?id=${studentId}`);
  };

  // Read-only attendance display component
  const AttendanceDisplay = ({ value }: { value: AttendanceValue }) => (
    <div className="w-full h-8 text-sm text-center flex items-center justify-center font-medium">
      {value || '-'}
    </div>
  );

  // Read-only score display component
  const ScoreDisplay = ({ value }: { value: ScoreValue }) => (
    <div className="w-full h-8 text-sm text-center flex items-center justify-center font-medium">
      {value || '-'}
    </div>
  );

  // Read-only checkbox display component
  const CheckboxDisplay = ({ checked }: { checked: boolean }) => (
    <div className="flex justify-center">
      <div
        className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
          checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
        }`}
      >
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
    </div>
  );

  // Total note display component (read-only)
  const TotalNoteDisplay = ({ value }: { value: number }) => (
    <div className="w-full h-8 text-sm text-center flex items-center justify-center font-medium">
      {value ? value.toFixed(1) : '0.0'}
    </div>
  );

  // Read-only recommendation display
  const RecommendationDisplay = ({ value }: { value: string }) => (
    <div className="w-48 min-h-[32px] max-h-[80px] text-sm p-2 bg-gray-50 rounded border overflow-y-auto">
      {value || 'Sin comentarios'}
    </div>
  );

  // Internship certificate button component
  const InternshipCertificateButton = ({
    studentId,
    gradeId,
    internshipCertificate,
  }: {
    studentId: string;
    gradeId?: string;
    internshipCertificate: boolean;
  }) => {
    return (
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleInternshipCertificateClick(studentId, gradeId)}
          disabled={!internshipCertificate || !gradeId}
          className={`h-8 w-8 p-0 ${
            internshipCertificate && gradeId
              ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title={
            !gradeId
              ? 'No hay calificaciones disponibles'
              : internshipCertificate
                ? 'Generar certificado de pasantía'
                : 'Certificado de pasantía no disponible'
          }
        >
          <Award className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Course certificate button component
  const CourseCertificateButton = ({
    studentId,
    courseCertificate,
  }: {
    studentId: string;
    courseCertificate: boolean;
  }) => {
    return (
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCourseCertificateClick(studentId)}
          disabled={!courseCertificate}
          className={`h-8 w-8 p-0 ${
            courseCertificate
              ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title={
            courseCertificate
              ? 'Generar certificado del curso'
              : 'Certificado del curso no disponible'
          }
        >
          <GraduationCap className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const filteredData = data.filter(
    (student) =>
      student.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.courseName && student.courseName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.mentorName && student.mentorName.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (loading) {
    return (
      <div className="w-full p-6 overflow-x-hidden">
        {/* Header section - Always visible */}
        <div className="flex items-center gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Seguimiento Global de Pasantías</h1>
            <p className="text-muted-foreground">
              Vista global de todas las evaluaciones y asistencia de los pasantes registrados
            </p>
          </div>
        </div>

        {/* Controls section - Always visible */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar pasantes, cursos o mentores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Table section with loading */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Seguimiento Global</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando datos globales de pasantes...
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-6 overflow-x-hidden">
      {/* Header section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Seguimiento Global de Pasantías</h1>
          <p className="text-muted-foreground">
            Vista global de todas las evaluaciones y asistencia de los pasantes registrados
          </p>
        </div>
      </div>

      {/* Controls section */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar pasantes, cursos o mentores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Table section with sticky headers and columns */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Seguimiento Global</CardTitle>
          <CardDescription>
            Mostrando {filteredData.length} de {data.length} pasantes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[70vh]">
            <div className="max-w-[1600px]">
              <Table>
                <TableHeader className="sticky top-0 z-20 bg-white">
                  {/* First row - Main group headers */}
                  <TableRow>
                    <TableHead className="w-12 sticky left-0 z-30 bg-white border-r" rowSpan={2}>
                      N°
                    </TableHead>
                    <TableHead
                      className="min-w-[120px] sticky left-8 z-30 bg-white border-r"
                      rowSpan={2}
                    >
                      Nombres
                    </TableHead>
                    <TableHead
                      className="min-w-[120px] sticky left-[150px] z-30 bg-white border-r"
                      rowSpan={2}
                    >
                      Apellidos
                    </TableHead>
                    <TableHead
                      className="min-w-[120px] sticky left-[270px] z-30 bg-white border-r"
                      rowSpan={2}
                    >
                      Curso
                    </TableHead>
                    <TableHead
                      className="min-w-[120px] sticky left-[390px] z-30 bg-white border-r"
                      rowSpan={2}
                    >
                      Mentor
                    </TableHead>
                    <TableHead
                      className="text-center bg-slate-100 border-r border-slate-300"
                      colSpan={6}
                    >
                      <div className="py-2 px-4 font-semibold text-slate-700">ASISTENCIA</div>
                    </TableHead>
                    <TableHead
                      className="text-center bg-gray-100 border-r border-gray-300"
                      colSpan={5}
                    >
                      <div className="py-2 px-4 font-semibold text-gray-700">
                        EVALUACIÓN DE INSCRIPCIÓN
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center bg-zinc-100 border-r border-zinc-300"
                      colSpan={2}
                    >
                      <div className="py-2 px-4 font-semibold text-zinc-700">
                        EVALUACIÓN DE CLASE
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center bg-stone-100 border-r border-stone-300"
                      colSpan={3}
                    >
                      <div className="py-2 px-4 font-semibold text-stone-700">
                        EVALUACIÓN DE PASANTÍA
                      </div>
                    </TableHead>
                    <TableHead className="text-center bg-amber-100" colSpan={6}>
                      <div className="py-2 px-4 font-semibold text-amber-700">EVALUACIÓN FINAL</div>
                    </TableHead>
                  </TableRow>

                  {/* Second row - Individual column headers */}
                  <TableRow>
                    {/* Asistencia */}
                    <TableHead className="w-16 text-center bg-slate-50 whitespace-normal break-words">
                      S1
                    </TableHead>
                    <TableHead className="w-16 text-center bg-slate-50 whitespace-normal break-words">
                      S2
                    </TableHead>
                    <TableHead className="w-16 text-center bg-slate-50 whitespace-normal break-words">
                      S3
                    </TableHead>
                    <TableHead className="w-16 text-center bg-slate-50 whitespace-normal break-words">
                      S4
                    </TableHead>
                    <TableHead className="w-16 text-center bg-slate-50 whitespace-normal break-words">
                      S5
                    </TableHead>
                    <TableHead className="w-16 text-center bg-slate-50 border-r border-slate-300 whitespace-normal break-words text-xs">
                      S6
                    </TableHead>

                    <TableHead className="w-28 text-center bg-gray-50 whitespace-normal break-words text-xs">
                      Compromiso Inicial
                    </TableHead>
                    <TableHead className="w-28 text-center bg-gray-50 whitespace-normal break-words text-xs">
                      Comunicación Asertiva
                    </TableHead>
                    <TableHead className="w-28 text-center bg-gray-50 whitespace-normal break-words text-xs">
                      Puntualidad
                    </TableHead>
                    <TableHead className="w-28 text-center bg-gray-50 whitespace-normal break-words text-xs">
                      Participación
                    </TableHead>
                    <TableHead className="w-28 text-center bg-gray-50 border-r border-gray-300 whitespace-normal break-words text-xs">
                      Proactividad
                    </TableHead>

                    <TableHead className="w-28 text-center bg-zinc-50 whitespace-normal break-words text-xs">
                      Hab. Comunicación
                    </TableHead>
                    <TableHead className="w-28 text-center bg-zinc-50 border-r border-zinc-300 whitespace-normal break-words text-xs">
                      Puntualidad Entrega
                    </TableHead>

                    <TableHead className="w-28 text-center bg-stone-50 whitespace-normal break-words text-xs">
                      Redacción Ortografía
                    </TableHead>
                    <TableHead className="w-28 text-center bg-stone-50 whitespace-normal break-words text-xs">
                      Desempeño Partner
                    </TableHead>
                    <TableHead className="w-48 text-center bg-stone-50 border-r border-stone-300 break-words text-xs">
                      Recomendación Mentoría
                    </TableHead>

                    {/* Evaluación Final */}
                    <TableHead className="w-30 text-center bg-amber-50 text-xs">
                      Informe Final
                    </TableHead>
                    <TableHead className="w-30 text-center bg-amber-50 text-xs">Charla</TableHead>
                    <TableHead className="w-30 text-center bg-amber-50 text-xs">
                      Recomendación
                    </TableHead>
                    <TableHead className="w-30 text-center bg-amber-50 text-xs">
                      Total Nota
                    </TableHead>
                    <TableHead className="w-30 text-center bg-amber-50 text-xs whitespace-normal break-words">
                      Certificado Pasantía
                    </TableHead>
                    <TableHead className="w-30 text-center bg-amber-50 text-xs whitespace-normal break-words">
                      Certificado del Curso
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="text-center sticky left-0 z-10 bg-white border-r">
                        {index + 1}
                      </TableCell>

                      {/* General Information - Sticky */}
                      <TableCell className="sticky left-8 z-10 bg-white border-r">
                        <div className="text-sm h-8 p-1 flex items-center">{student.nombres}</div>
                      </TableCell>
                      <TableCell className="sticky left-[150px] z-10 bg-white border-r">
                        <div className="text-sm h-8 p-1 flex items-center">{student.apellidos}</div>
                      </TableCell>
                      <TableCell className="sticky left-[270px] z-10 bg-white border-r">
                        <div className="text-sm h-8 p-1 flex items-center">
                          {student.courseName}
                        </div>
                      </TableCell>
                      <TableCell className="sticky left-[390px] z-10 bg-white border-r">
                        <div className="text-sm h-8 p-1 flex items-center">
                          {student.mentorName}
                        </div>
                      </TableCell>

                      {/* Attendance - Read Only */}
                      <TableCell className="w-16 bg-slate-25">
                        <AttendanceDisplay value={student.attendance.s1} />
                      </TableCell>
                      <TableCell className="w-16 bg-slate-25">
                        <AttendanceDisplay value={student.attendance.s2} />
                      </TableCell>
                      <TableCell className="w-16 bg-slate-25">
                        <AttendanceDisplay value={student.attendance.s3} />
                      </TableCell>
                      <TableCell className="w-16 bg-slate-25">
                        <AttendanceDisplay value={student.attendance.s4} />
                      </TableCell>
                      <TableCell className="w-16 bg-slate-25">
                        <AttendanceDisplay value={student.attendance.s5} />
                      </TableCell>
                      <TableCell className="bg-slate-25 border-r border-slate-300">
                        <AttendanceDisplay value={student.attendance.s6} />
                      </TableCell>

                      {/* Inscription Evaluation - Read Only */}
                      <TableCell className="bg-gray-25">
                        <ScoreDisplay value={student.inscriptionEvaluation.compromisoInicial} />
                      </TableCell>
                      <TableCell className="bg-gray-25">
                        <ScoreDisplay value={student.inscriptionEvaluation.comunicacionAsertiva} />
                      </TableCell>
                      <TableCell className="bg-gray-25">
                        <ScoreDisplay value={student.inscriptionEvaluation.puntualidad} />
                      </TableCell>
                      <TableCell className="bg-gray-25">
                        <ScoreDisplay value={student.inscriptionEvaluation.participacionClase} />
                      </TableCell>
                      <TableCell className="bg-gray-25 border-r border-gray-300">
                        <ScoreDisplay value={student.inscriptionEvaluation.proactividad} />
                      </TableCell>

                      {/* Class Evaluation - Read Only */}
                      <TableCell className="bg-zinc-25">
                        <ScoreDisplay value={student.classEvaluation.habilidadesComunicacion} />
                      </TableCell>
                      <TableCell className="bg-zinc-25 border-r border-zinc-300">
                        <ScoreDisplay value={student.classEvaluation.puntualidadEntrega} />
                      </TableCell>

                      {/* Internship Evaluation - Read Only */}
                      <TableCell className="bg-stone-25">
                        <ScoreDisplay value={student.internshipEvaluation.reduccionOrtografia} />
                      </TableCell>
                      <TableCell className="bg-stone-25">
                        <ScoreDisplay value={student.internshipEvaluation.desempenoPartner} />
                      </TableCell>
                      <TableCell className="w-48 bg-stone-25 border-r border-stone-300 align-top">
                        <RecommendationDisplay
                          value={student.internshipEvaluation.recomendacionMentoria}
                        />
                      </TableCell>

                      {/* Final Evaluation - Read Only */}
                      <TableCell className="bg-amber-25">
                        <CheckboxDisplay checked={student.finalEvaluation.finalReportCheck} />
                      </TableCell>
                      <TableCell className="bg-amber-25">
                        <CheckboxDisplay checked={student.finalEvaluation.talkCheck} />
                      </TableCell>
                      <TableCell className="bg-amber-25">
                        <CheckboxDisplay checked={student.finalEvaluation.recommendationCheck} />
                      </TableCell>
                      <TableCell className="bg-amber-25">
                        <TotalNoteDisplay value={student.finalEvaluation.totalNote} />
                      </TableCell>
                      <TableCell className="bg-amber-25">
                        <InternshipCertificateButton
                          studentId={student.id}
                          gradeId={student.gradeId}
                          internshipCertificate={student.finalEvaluation.internshipCertificate}
                        />
                      </TableCell>
                      <TableCell className="bg-amber-25">
                        <CourseCertificateButton
                          studentId={student.id}
                          courseCertificate={student.finalEvaluation.courseCertificate}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Footer with legend */}
          <div className="mt-4 pt-4 border-t px-6 pb-6">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium">Asistencia:</span>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    A = Asistió
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    T = Tardanza
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    F = Falta
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    FJ = Falta Justificada
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Puntuación:</span>
                <Badge variant="outline" className="text-xs">
                  1-5 (1 = Muy Bajo, 5 = Excelente)
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Total Nota:</span>
                <Badge variant="outline" className="text-xs">
                  0-20 (Calculada automáticamente)
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Certificados:</span>
                <Badge variant="outline" className="text-xs">
                  Disponibles según criterios del sistema
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Vista:</span>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  Solo lectura - Vista global
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
