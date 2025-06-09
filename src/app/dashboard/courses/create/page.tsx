'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

type CourseFormData = {
  name: string;
  description: string;
  year: number;
};

export default function CreateCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    description: '',
    year: new Date().getFullYear(),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiService.createCourse({
        name: formData.name,
        description: formData.description || undefined,
        year: formData.year,
      });

      toast.success('Curso creado exitosamente');
      router.push('/dashboard/courses');
    } catch (error) {
      toast.error('Error al crear el curso');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Curso</h1>
          <p className="text-muted-foreground">Define un nuevo curso de pasantías</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Programa</CardTitle>
          <CardDescription>Completa los datos básicos del programa</CardDescription>
        </CardHeader>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Año *</Label>
              <Input
                id="year"
                type="number"
                min={2000}
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 cursor-pointer">
                <Save className="h-4 w-4 mr-2" />
                Crear Curso
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/courses">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
