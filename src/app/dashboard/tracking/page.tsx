/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Save, Search, Loader2, Award, GraduationCap } from 'lucide-react';
import { useCourse } from '@/context/CourseContext';
import { toast } from 'sonner';
import { apiService, type Intern, type Grade, type Attendance } from '@/lib/api';
import { useRouter } from 'next/navigation';

// Types for the evaluation data
type AttendanceValue = 'A' | 'T' | 'F' | 'FJ' | '';
type ScoreValue = 1 | 2 | 3 | 4 | 5 | 0;

interface StudentData {
  id: string;
  gradeId?: string; // Agregar esta línea
  nombres: string;
  apellidos: string;
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

export default function InternshipEvaluation() {
  const [data, setData] = useState<StudentData[]>([]);
  const [originalData, setOriginalData] = useState<StudentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const { activeCourse } = useCourse();
  const router = useRouter();

  // Map API attendance to component attendance
  const mapApiAttendanceToComponent = (apiAttendance?: Attendance): AttendanceValue => {
    if (!apiAttendance) return '';
    return apiAttendance as AttendanceValue;
  };

  // Map component attendance to API attendance
  const mapComponentAttendanceToApi = (
    componentAttendance: AttendanceValue,
  ): Attendance | undefined => {
    if (!componentAttendance) return undefined;
    return componentAttendance as Attendance;
  };

  // Convert API data to component format
  const convertApiDataToComponent = (intern: Intern, grade?: Grade): StudentData => {
    return {
      id: intern.id,
      gradeId: grade?.id, // Agregar esta línea
      nombres: intern.firstNames,
      apellidos: `${intern.lastNameFather} ${intern.lastNameMother}`.trim(),
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

  // Convert component data to API format
  const convertComponentDataToApi = (studentData: StudentData): Partial<Grade> => {
    return {
      s1: mapComponentAttendanceToApi(studentData.attendance.s1),
      s2: mapComponentAttendanceToApi(studentData.attendance.s2),
      s3: mapComponentAttendanceToApi(studentData.attendance.s3),
      s4: mapComponentAttendanceToApi(studentData.attendance.s4),
      s5: mapComponentAttendanceToApi(studentData.attendance.s5),
      s6: mapComponentAttendanceToApi(studentData.attendance.s6),
      initialCommitment: studentData.inscriptionEvaluation.compromisoInicial || undefined,
      assertiveCommunication: studentData.inscriptionEvaluation.comunicacionAsertiva || undefined,
      punctuality: studentData.inscriptionEvaluation.puntualidad || undefined,
      classParticipation: studentData.inscriptionEvaluation.participacionClase || undefined,
      proactivity: studentData.inscriptionEvaluation.proactividad || undefined,
      communicationSkills: studentData.classEvaluation.habilidadesComunicacion || undefined,
      punctualityOfDelivery: studentData.classEvaluation.puntualidadEntrega || undefined,
      redaction: studentData.internshipEvaluation.reduccionOrtografia || undefined,
      performance: studentData.internshipEvaluation.desempenoPartner || undefined,
      recommendation: studentData.internshipEvaluation.recomendacionMentoria || undefined,
      // totalNote is calculated in backend, don't send it
      finalReportCheck: studentData.finalEvaluation.finalReportCheck,
      talkCheck: studentData.finalEvaluation.talkCheck,
      recommendationCheck: studentData.finalEvaluation.recommendationCheck,
    };
  };

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!activeCourse?.id) return;

    try {
      setLoading(true);
      const interns = await apiService.getAllInternsWithinCourse(activeCourse.id);
      const studentsWithGrades = await Promise.all(
        interns.map(async (intern) => {
          try {
            const grade = await apiService.getInternGrade(activeCourse.id, intern.id);
            return convertApiDataToComponent(intern, grade);
          } catch (error) {
            // If grade doesn't exist, create it with default values
            console.log(`No grade found for intern ${intern.id}, using defaults. Error:`, error);
            return convertApiDataToComponent(intern);
          }
        }),
      );

      setData(studentsWithGrades);
      setOriginalData(JSON.parse(JSON.stringify(studentsWithGrades)));
      setHasChanges(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('No se pudieron cargar los datos de los pasantes.');
    } finally {
      setLoading(false);
    }
  }, [activeCourse?.id]);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check for changes
  useEffect(() => {
    const hasDataChanged = JSON.stringify(data) !== JSON.stringify(originalData);
    setHasChanges(hasDataChanged);
  }, [data, originalData]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const updateStudentData = (
    studentId: string,
    field: string,
    value: string | number | boolean,
  ) => {
    setData((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          const keys = field.split('.');
          const updatedStudent = { ...student };
          if (keys.length === 2) {
            const [parentKey, childKey] = keys;
            if (parentKey in updatedStudent) {
              (updatedStudent as any)[parentKey] = {
                ...(updatedStudent as any)[parentKey],
                [childKey]: value,
              };
            }
          } else {
            (updatedStudent as any)[field] = value;
          }
          return updatedStudent;
        }
        return student;
      }),
    );
  };

  const handleSave = async () => {
    if (!activeCourse?.id) return;

    try {
      setSaving(true);

      // Save each student's grades
      await Promise.all(
        data.map(async (student) => {
          const gradeData = convertComponentDataToApi(student);
          try {
            // Try to update existing grade
            await apiService.updateInternGrade(activeCourse.id, student.id, gradeData);
          } catch (error) {
            console.log(error);
            // If grade doesn't exist, create it first then update
            try {
              await apiService.createInternGrade(activeCourse.id, student.id);
              await apiService.updateInternGrade(activeCourse.id, student.id, gradeData);
            } catch (createError) {
              console.error(`Error saving grade for student ${student.id}:`, createError);
              throw createError;
            }
          }
        }),
      );

      // Refresh data to get updated values from backend (including certificate flags)
      const interns = await apiService.getAllInternsWithinCourse(activeCourse.id);
      const updatedStudentsWithGrades = await Promise.all(
        interns.map(async (intern) => {
          try {
            const grade = await apiService.getInternGrade(activeCourse.id, intern.id);
            return convertApiDataToComponent(intern, grade);
          } catch (error) {
            console.log(`No grade found for intern ${intern.id}, using defaults. Error:`, error);
            return convertApiDataToComponent(intern);
          }
        }),
      );

      setData(updatedStudentsWithGrades);
      setOriginalData(JSON.parse(JSON.stringify(updatedStudentsWithGrades)));
      setHasChanges(false);
      toast.success('Las calificaciones se han guardado correctamente.');
    } catch (error) {
      console.error('Error saving grades:', error);
      toast.error('Hubo un problema al guardar las calificaciones.');
    } finally {
      setSaving(false);
    }
  };

  // Handle certificate button click
  const handleInternshipCertificateClick = (studentId: string, gradeId?: string) => {
    if (!gradeId) {
      toast.error('No se puede generar el certificado. Guarda las calificaciones primero.');
      return;
    }
    router.push(`/internship-certificate/?id=${gradeId}`);
  };

  const handleCourseCertificateClick = (studentId: string) => {
    // TODO: Define the actual route for course certificate generation
    router.push(`/course-certificate/?id=${studentId}`);
  };

  // Simple attendance select component
  const AttendanceSelect = ({
    value,
    onChange,
  }: {
    value: AttendanceValue;
    onChange: (value: AttendanceValue) => void;
  }) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full h-8 text-sm">
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="A">A</SelectItem>
        <SelectItem value="T">T</SelectItem>
        <SelectItem value="F">F</SelectItem>
        <SelectItem value="FJ">FJ</SelectItem>
      </SelectContent>
    </Select>
  );

  // Simple score select component
  const ScoreSelect = ({
    value,
    onChange,
  }: {
    value: ScoreValue;
    onChange: (value: ScoreValue) => void;
  }) => (
    <Select
      value={value.toString()}
      onValueChange={(val) => onChange(Number.parseInt(val) as ScoreValue)}
    >
      <SelectTrigger className="w-full h-8 text-sm">
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">1</SelectItem>
        <SelectItem value="2">2</SelectItem>
        <SelectItem value="3">3</SelectItem>
        <SelectItem value="4">4</SelectItem>
        <SelectItem value="5">5</SelectItem>
      </SelectContent>
    </Select>
  );

  // Checkbox component for final evaluation
  const EvaluationCheckbox = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <div className="flex justify-center">
      <Checkbox checked={checked} onCheckedChange={onChange} className="h-5 w-5" />
    </div>
  );

  // Total note display component (read-only)
  const TotalNoteDisplay = ({ value }: { value: number }) => (
    <div className="w-full h-8 text-sm text-center flex items-center justify-center font-medium">
      {value ? value.toFixed(1) : '0.0'}
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
              ? 'Guarda las calificaciones primero'
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
      student.apellidos.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="w-full p-6 overflow-x-hidden">
        {/* Header section - Always visible */}
        <div className="flex items-center gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Notas de Pasantías</h1>
            <p className="text-muted-foreground">
              Administra las evaluaciones y asistencia de todos los pasantes registrados en el
              curso: <strong>{activeCourse?.name || 'Cargando...'}</strong>
            </p>
          </div>
        </div>

        {/* Controls section - Always visible */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar pasantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
                disabled
              />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button disabled className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>

        {/* Table section with loading */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Lista de Evaluaciones</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando datos de pasantes...
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
    <>
      <div className="w-full p-6 overflow-x-hidden">
        {/* Header section */}
        <div className="flex items-center gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Notas de Pasantías</h1>
            <p className="text-muted-foreground">
              Administra las evaluaciones y asistencia de todos los pasantes registrados en el
              curso: <strong>{activeCourse?.name || 'Cargando...'}</strong>
            </p>
          </div>
        </div>

        {/* Controls section */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar pasantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`flex items-center gap-2 ${hasChanges ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </div>

        {/* Table section with sticky headers and columns */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Lista de Evaluaciones</CardTitle>
            <CardDescription>
              Mostrando {filteredData.length} de {data.length} pasantes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[70vh]">
              <div className="max-w-[1200px]">
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
                        <div className="py-2 px-4 font-semibold text-amber-700">
                          EVALUACIÓN FINAL
                        </div>
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
                          <div className="text-sm h-8 p-1 flex items-center">
                            {student.apellidos}
                          </div>
                        </TableCell>
                        {/* Attendance */}
                        <TableCell className="w-16 bg-slate-25">
                          <AttendanceSelect
                            value={student.attendance.s1}
                            onChange={(value) =>
                              updateStudentData(student.id, 'attendance.s1', value)
                            }
                          />
                        </TableCell>
                        <TableCell className="w-16 bg-slate-25">
                          <AttendanceSelect
                            value={student.attendance.s2}
                            onChange={(value) =>
                              updateStudentData(student.id, 'attendance.s2', value)
                            }
                          />
                        </TableCell>
                        <TableCell className="w-16 bg-slate-25">
                          <AttendanceSelect
                            value={student.attendance.s3}
                            onChange={(value) =>
                              updateStudentData(student.id, 'attendance.s3', value)
                            }
                          />
                        </TableCell>
                        <TableCell className="w-16 bg-slate-25">
                          <AttendanceSelect
                            value={student.attendance.s4}
                            onChange={(value) =>
                              updateStudentData(student.id, 'attendance.s4', value)
                            }
                          />
                        </TableCell>
                        <TableCell className="w-16 bg-slate-25">
                          <AttendanceSelect
                            value={student.attendance.s5}
                            onChange={(value) =>
                              updateStudentData(student.id, 'attendance.s5', value)
                            }
                          />
                        </TableCell>
                        <TableCell className="bg-slate-25 border-r border-slate-300">
                          <AttendanceSelect
                            value={student.attendance.s6}
                            onChange={(value) =>
                              updateStudentData(student.id, 'attendance.s6', value)
                            }
                          />
                        </TableCell>
                        {/* Inscription Evaluation */}
                        <TableCell className="bg-gray-25">
                          <ScoreSelect
                            value={student.inscriptionEvaluation.compromisoInicial}
                            onChange={(value) =>
                              updateStudentData(
                                student.id,
                                'inscriptionEvaluation.compromisoInicial',
                                value,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="bg-gray-25">
                          <ScoreSelect
                            value={student.inscriptionEvaluation.comunicacionAsertiva}
                            onChange={(value) =>
                              updateStudentData(
                                student.id,
                                'inscriptionEvaluation.comunicacionAsertiva',
                                value,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="bg-gray-25">
                          <ScoreSelect
                            value={student.inscriptionEvaluation.puntualidad}
                            onChange={(value) =>
                              updateStudentData(
                                student.id,
                                'inscriptionEvaluation.puntualidad',
                                value,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="bg-gray-25">
                          <ScoreSelect
                            value={student.inscriptionEvaluation.participacionClase}
                            onChange={(value) =>
                              updateStudentData(
                                student.id,
                                'inscriptionEvaluation.participacionClase',
                                value,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="bg-gray-25 border-r border-gray-300">
                          <ScoreSelect
                            value={student.inscriptionEvaluation.proactividad}
                            onChange={(value) =>
                              updateStudentData(
                                student.id,
                                'inscriptionEvaluation.proactividad',
                                value,
                              )
                            }
                          />
                        </TableCell>
                        {/* Class Evaluation */}
                        <TableCell className="bg-zinc-25">
                          <ScoreSelect
                            value={student.classEvaluation.habilidadesComunicacion}
                            onChange={(value) =>
                              updateStudentData(
                                student.id,
                                'classEvaluation.habilidadesComunicacion',
                                value,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="bg-zinc-25 border-r border-zinc-300">
                          <ScoreSelect
                            value={student.classEvaluation.puntualidadEntrega}
                            onChange={(value) =>
                              updateStudentData(
                                student.id,
                                'classEvaluation.puntualidadEntrega',
                                value,
                              )
                            }
                          />
                        </TableCell>
                        {/* Internship Evaluation */}
                        <TableCell className="bg-stone-25">
                          <ScoreSelect
                            value={student.internshipEvaluation.reduccionOrtografia}
                            onChange={(value) =>
                              updateStudentData(
                                student.id,
                                'internshipEvaluation.reduccionOrtografia',
                                value,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="bg-stone-25">
                          <ScoreSelect
                            value={student.internshipEvaluation.desempenoPartner}
                            onChange={(value) =>
                              updateStudentData(
                                student.id,
                                'internshipEvaluation.desempenoPartner',
                                value,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="w-48 bg-stone-25 border-r border-stone-300 align-top">
                          <Textarea
                            value={student.internshipEvaluation.recomendacionMentoria}
                            onChange={(e) =>
                              updateStudentData(
                                student.id,
                                'internshipEvaluation.recomendacionMentoria',
                                e.target.value,
                              )
                            }
                            className="w-full min-h-[32px] max-h-[80px] text-sm resize-none whitespace-normal break-words"
                            placeholder="Comentario..."
                            maxLength={500}
                          />
                        </TableCell>
                        {/* Final Evaluation */}
                        <TableCell className="bg-amber-25">
                          <EvaluationCheckbox
                            checked={student.finalEvaluation.finalReportCheck}
                            onChange={(checked) =>
                              updateStudentData(
                                student.id,
                                'finalEvaluation.finalReportCheck',
                                checked,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="bg-amber-25">
                          <EvaluationCheckbox
                            checked={student.finalEvaluation.talkCheck}
                            onChange={(checked) =>
                              updateStudentData(student.id, 'finalEvaluation.talkCheck', checked)
                            }
                          />
                        </TableCell>
                        <TableCell className="bg-amber-25">
                          <EvaluationCheckbox
                            checked={student.finalEvaluation.recommendationCheck}
                            onChange={(checked) =>
                              updateStudentData(
                                student.id,
                                'finalEvaluation.recommendationCheck',
                                checked,
                              )
                            }
                          />
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambios sin guardar</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar que se perderán si continúas. ¿Qué deseas hacer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingNavigation(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await handleSave();
                if (pendingNavigation) {
                  pendingNavigation();
                  setPendingNavigation(null);
                }
                setShowUnsavedDialog(false);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Guardar y continuar
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                if (pendingNavigation) {
                  pendingNavigation();
                  setPendingNavigation(null);
                }
                setShowUnsavedDialog(false);
              }}
            >
              Descartar cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
