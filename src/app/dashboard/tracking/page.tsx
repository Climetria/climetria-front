/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Search } from 'lucide-react';
import { useCourse } from '@/context/CourseContext';

// Types for the evaluation data
type AttendanceValue = 'A' | 'T' | 'F' | 'FJ' | '';
type ScoreValue = 1 | 2 | 3 | 4 | 5 | 0;

interface StudentData {
  id: number;
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
}

// Sample data
const initialData: StudentData[] = [
  {
    id: 1,
    nombres: 'Agueda Inés',
    apellidos: 'Bogado Castro',
    attendance: { s1: 'A', s2: '', s3: '', s4: '', s5: '', s6: '' },
    inscriptionEvaluation: {
      compromisoInicial: 0,
      comunicacionAsertiva: 0,
      puntualidad: 0,
      participacionClase: 0,
      proactividad: 0,
    },
    classEvaluation: {
      habilidadesComunicacion: 0,
      puntualidadEntrega: 0,
    },
    internshipEvaluation: {
      reduccionOrtografia: 0,
      desempenoPartner: 0,
      recomendacionMentoria: '',
    },
  },
  {
    id: 2,
    nombres: 'Carolina',
    apellidos: 'Reategui Morales',
    attendance: { s1: 'A', s2: '', s3: '', s4: '', s5: '', s6: '' },
    inscriptionEvaluation: {
      compromisoInicial: 0,
      comunicacionAsertiva: 0,
      puntualidad: 0,
      participacionClase: 0,
      proactividad: 0,
    },
    classEvaluation: {
      habilidadesComunicacion: 0,
      puntualidadEntrega: 0,
    },
    internshipEvaluation: {
      reduccionOrtografia: 0,
      desempenoPartner: 0,
      recomendacionMentoria: '',
    },
  },
  {
    id: 3,
    nombres: 'Fátima Elizabeth',
    apellidos: 'Cano Cordoba',
    attendance: { s1: 'A', s2: '', s3: '', s4: '', s5: '', s6: '' },
    inscriptionEvaluation: {
      compromisoInicial: 5,
      comunicacionAsertiva: 5,
      puntualidad: 0,
      participacionClase: 0,
      proactividad: 0,
    },
    classEvaluation: {
      habilidadesComunicacion: 0,
      puntualidadEntrega: 0,
    },
    internshipEvaluation: {
      reduccionOrtografia: 0,
      desempenoPartner: 0,
      recomendacionMentoria: '',
    },
  },
  {
    id: 4,
    nombres: 'Miguel Ángel',
    apellidos: 'Macalupú Ancco',
    attendance: { s1: 'A', s2: '', s3: '', s4: '', s5: '', s6: '' },
    inscriptionEvaluation: {
      compromisoInicial: 3,
      comunicacionAsertiva: 4,
      puntualidad: 0,
      participacionClase: 0,
      proactividad: 0,
    },
    classEvaluation: {
      habilidadesComunicacion: 0,
      puntualidadEntrega: 0,
    },
    internshipEvaluation: {
      reduccionOrtografia: 0,
      desempenoPartner: 0,
      recomendacionMentoria: '',
    },
  },
];

export default function InternshipEvaluation() {
  const [data, setData] = useState<StudentData[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const { activeCourse } = useCourse();

  const updateStudentData = (studentId: number, field: string, value: string | number) => {
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
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving data:', data);
    setHasChanges(false);
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

  const filteredData = data.filter(
    (student) =>
      student.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.apellidos.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full p-6 overflow-x-hidden">
      {/* Header section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Seguimiento de Pasantías</h1>
          <p className="text-muted-foreground">
            Administra las evaluaciones y asistencia de todos los pasantes registrados en el curso:{' '}
            <strong>{activeCourse?.name || 'Cargando...'}</strong>
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
              disabled={!hasChanges}
              className={`flex items-center gap-2 ${hasChanges ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>

      {/* Table section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Lista de Evaluaciones</CardTitle>
          <CardDescription>
            Mostrando {filteredData.length} de {data.length} pasantes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px] p-6">
              <Table>
                <TableHeader>
                  {/* First row - Main group headers */}
                  <TableRow>
                    <TableHead className="w-12" rowSpan={2}>
                      N°
                    </TableHead>
                    <TableHead className="min-w-[120px]" rowSpan={2}>
                      Nombres
                    </TableHead>
                    <TableHead className="min-w-[120px]" rowSpan={2}>
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
                    <TableHead className="text-center bg-stone-100" colSpan={3}>
                      <div className="py-2 px-4 font-semibold text-stone-700">
                        EVALUACIÓN DE PASANTÍA
                      </div>
                    </TableHead>
                  </TableRow>
                  {/* Second row - Individual column headers */}
                  <TableRow>
                    <TableHead className="w-16 text-center bg-slate-50">S1</TableHead>
                    <TableHead className="w-16 text-center bg-slate-50">S2</TableHead>
                    <TableHead className="w-16 text-center bg-slate-50">S3</TableHead>
                    <TableHead className="w-16 text-center bg-slate-50">S4</TableHead>
                    <TableHead className="w-16 text-center bg-slate-50">S5</TableHead>
                    <TableHead className="w-16 text-center bg-slate-50 border-r border-slate-300">
                      S6
                    </TableHead>
                    <TableHead className="w-20 text-center bg-gray-50 text-xs">
                      Compromiso Inicial
                    </TableHead>
                    <TableHead className="w-20 text-center bg-gray-50 text-xs">
                      Comunicación Asertiva
                    </TableHead>
                    <TableHead className="w-20 text-center bg-gray-50 text-xs">
                      Puntualidad
                    </TableHead>
                    <TableHead className="w-20 text-center bg-gray-50 text-xs">
                      Participación
                    </TableHead>
                    <TableHead className="w-20 text-center bg-gray-50 text-xs border-r border-gray-300">
                      Proactividad
                    </TableHead>
                    <TableHead className="w-20 text-center bg-zinc-50 text-xs">
                      Hab. Comunicación
                    </TableHead>
                    <TableHead className="w-20 text-center bg-zinc-50 text-xs border-r border-zinc-300">
                      Puntualidad Entrega
                    </TableHead>
                    <TableHead className="w-20 text-center bg-stone-50 text-xs">
                      Reducción Ortografía
                    </TableHead>
                    <TableHead className="w-20 text-center bg-stone-50 text-xs">
                      Desempeño Partner
                    </TableHead>
                    <TableHead className="min-w-[200px] bg-stone-50 text-xs">
                      Recomendación Mentoría
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="text-center">{index + 1}</TableCell>

                      {/* General Information */}
                      <TableCell>
                        <div className="text-sm h-8 p-1 flex items-center">{student.nombres}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm h-8 p-1 flex items-center">{student.apellidos}</div>
                      </TableCell>

                      {/* Attendance */}
                      <TableCell className="bg-slate-25">
                        <AttendanceSelect
                          value={student.attendance.s1}
                          onChange={(value) =>
                            updateStudentData(student.id, 'attendance.s1', value)
                          }
                        />
                      </TableCell>
                      <TableCell className="bg-slate-25">
                        <AttendanceSelect
                          value={student.attendance.s2}
                          onChange={(value) =>
                            updateStudentData(student.id, 'attendance.s2', value)
                          }
                        />
                      </TableCell>
                      <TableCell className="bg-slate-25">
                        <AttendanceSelect
                          value={student.attendance.s3}
                          onChange={(value) =>
                            updateStudentData(student.id, 'attendance.s3', value)
                          }
                        />
                      </TableCell>
                      <TableCell className="bg-slate-25">
                        <AttendanceSelect
                          value={student.attendance.s4}
                          onChange={(value) =>
                            updateStudentData(student.id, 'attendance.s4', value)
                          }
                        />
                      </TableCell>
                      <TableCell className="bg-slate-25">
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
                      <TableCell className="bg-stone-25">
                        <Textarea
                          value={student.internshipEvaluation.recomendacionMentoria}
                          onChange={(e) =>
                            updateStudentData(
                              student.id,
                              'internshipEvaluation.recomendacionMentoria',
                              e.target.value,
                            )
                          }
                          className="min-h-[32px] text-sm resize-none"
                          placeholder="Comentario..."
                          maxLength={500}
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
