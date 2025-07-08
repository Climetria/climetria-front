'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Edit, Loader2, AlertCircle } from 'lucide-react';
import { apiService, type Course } from '@/lib/api';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingCardContent } from './loading-card-content';
import { DatePicker } from '@/components/ui/date-picker';

export type CourseFormData = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
};

interface CourseFormProps {
  mode: 'create' | 'edit';
  courseId?: string;
  initialData?: Partial<Course>;
  onSuccess?: () => void;
}

const dateToLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const stringToLocalDate = (dateString: string): Date | undefined => {
  if (!dateString) return undefined;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export function CourseForm({ mode, courseId, initialData, onSuccess }: CourseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(mode === 'edit');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const loadCourseData = async () => {
      if (mode === 'edit' && courseId) {
        try {
          setIsLoadingData(true);
          setError(null);
          const course = await apiService.getCourse(courseId);
          setFormData({
            name: course.name,
            description: course.description || '',
            startDate: course.startDate || '',
            endDate: course.endDate || '',
          });
        } catch (err) {
          console.error('Error loading course data:', err);
          if (err instanceof Error && err.message.includes('404')) {
            setError('El curso no fue encontrado. Puede que haya sido eliminado.');
          } else {
            setError('Error al cargar los datos del curso. Por favor, intenta nuevamente.');
          }
        } finally {
          setIsLoadingData(false);
        }
      } else if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          startDate: initialData.startDate || '',
          endDate: initialData.endDate || '',
        });
        setIsLoadingData(false);
      } else if (mode === 'edit') {
        setIsLoadingData(false);
        setError('ID de curso no proporcionado.');
      }
    };
    loadCourseData();
  }, [mode, courseId, initialData]);

  const validateDates = (startDate: string, endDate: string): string | null => {
    if (!startDate || !endDate) {
      return 'Las fechas de inicio y fin son obligatorias.';
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return 'La fecha de inicio debe ser anterior a la fecha de fin.';
    }

    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 10;
    if (start.getFullYear() < minYear) {
      return `La fecha de inicio no puede ser anterior al año ${minYear}.`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('El nombre del curso es obligatorio.');
      return;
    }

    const dateError = validateDates(formData.startDate, formData.endDate);
    if (dateError) {
      setError(dateError);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const courseData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      if (mode === 'create') {
        await apiService.createCourse(courseData);
        toast.success('Curso creado exitosamente');
      } else if (mode === 'edit' && courseId) {
        await apiService.updateCourse(courseId, courseData);
        toast.success('Curso actualizado exitosamente');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/courses');
      }
    } catch (err: unknown) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} course:`, err);
      let errorMessage = `Error al ${mode === 'create' ? 'crear' : 'actualizar'} el curso. Por favor, intenta nuevamente.`;

      if (err instanceof Error && err.message.includes('400')) {
        errorMessage = 'Los datos enviados no son válidos. Por favor, revisa todos los campos.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const titles = {
    create: {
      main: 'Crear Curso',
      description: 'Define un nuevo curso de pasantías',
      card: 'Información del Programa',
      cardDescription: 'Completa los datos básicos del programa',
    },
    edit: {
      main: 'Editar Curso',
      description: 'Actualiza la información del curso',
      card: 'Actualizar Información',
      cardDescription: 'Modifica los datos del curso',
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{titles[mode].main}</h1>
          <p className="text-muted-foreground">{titles[mode].description}</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{titles[mode].card}</CardTitle>
          <CardDescription>{titles[mode].cardDescription}</CardDescription>
        </CardHeader>
        {isLoadingData ? (
          <LoadingCardContent type="course" />
        ) : (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Curso *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Encuentro Climacción"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe los objetivos y alcance del curso"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de Inicio *</Label>
                  <DatePicker
                    date={stringToLocalDate(formData.startDate)}
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        startDate: date ? dateToLocalString(date) : '',
                      })
                    }
                    placeholder="Seleccionar fecha de inicio"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha de Fin *</Label>
                  <DatePicker
                    date={stringToLocalDate(formData.endDate)}
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        endDate: date ? dateToLocalString(date) : '',
                      })
                    }
                    placeholder="Seleccionar fecha de fin"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {mode === 'create' ? 'Creando...' : 'Actualizando...'}
                    </>
                  ) : (
                    <>
                      {mode === 'create' ? (
                        <Save className="h-4 w-4 mr-2" />
                      ) : (
                        <Edit className="h-4 w-4 mr-2" />
                      )}
                      {mode === 'create' ? 'Crear Curso' : 'Actualizar Curso'}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild disabled={isLoading}>
                  <Link href="/dashboard/courses">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
