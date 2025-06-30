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

type CourseFormData = {
  name: string;
  description: string;
  year: number;
};

interface CourseFormProps {
  mode: 'create' | 'edit';
  courseId?: string;
  initialData?: Partial<Course>;
  onSuccess?: () => void;
}

export function CourseForm({ mode, courseId, initialData, onSuccess }: CourseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(mode === 'edit');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    description: '',
    year: new Date().getFullYear(),
  });

  // Load course data for edit mode
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
            year: course.year,
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
        // Use provided initial data
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          year: initialData.year || new Date().getFullYear(),
        });
        setIsLoadingData(false);
      } else if (mode === 'edit') {
        setIsLoadingData(false);
        setError('ID de curso no proporcionado.');
      }
    };

    loadCourseData();
  }, [mode, courseId, initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('El nombre del curso es obligatorio.');
      return;
    }

    if (!formData.year || formData.year < 2000) {
      setError('Por favor, ingresa un año válido.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const courseData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        year: formData.year,
      };

      if (mode === 'create') {
        await apiService.createCourse(courseData);
        toast.success('Curso creado exitosamente');
      } else if (mode === 'edit' && courseId) {
        await apiService.updateCourse(courseId, courseData);
        toast.success('Curso actualizado exitosamente');
      }

      // Call success callback or redirect
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

              <div className="space-y-2">
                <Label htmlFor="year">Año *</Label>
                <Input
                  id="year"
                  type="number"
                  min={2000}
                  max={2100}
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  required
                  disabled={isLoading}
                />
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
