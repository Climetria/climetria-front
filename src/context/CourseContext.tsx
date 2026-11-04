'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TOKEN_CHANGED_EVENT } from '@/utils/setAuthCookie';

interface Course {
  id: string;
  name: string;
  description: string;
}

interface CourseAPIResponse {
  id: string;
  name?: string;
  description?: string;
}

interface CourseContextType {
  activeCourse: Course | null;
  setActiveCourse: (course: Course) => void;
  courses: Course[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  isInitialized: boolean;
  clearCourseState: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};

interface CourseProviderProps {
  children: ReactNode;
}

// Función auxiliar para leer el token desde cookies
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

// Función auxiliar para persistir en localStorage
function persistActiveCourse(course: Course | null) {
  if (typeof window !== 'undefined') {
    if (course) {
      localStorage.setItem('activeCourse', JSON.stringify(course));
    } else {
      localStorage.removeItem('activeCourse');
    }
  }
}

// Función auxiliar para recuperar del localStorage
function getPersistedActiveCourse(): Course | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('activeCourse');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  return null;
}

// Query key factory
const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (token: string) => [...courseKeys.lists(), token] as const,
};

// Fetch function
async function fetchCourses(token: string): Promise<Course[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/courses`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch courses: ${response.status}`);
  }

  const data = await response.json();

  return data.map((course: CourseAPIResponse) => ({
    id: course.id,
    name: course.name || `Course ${course.id}`,
    description: course.description || 'Sin descripción',
  }));
}

export function CourseProvider({ children }: CourseProviderProps) {
  const [activeCourse, setActiveCourseState] = useState<Course | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Query para obtener cursos
  const {
    data: courses = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: courseKeys.list(token || ''),
    queryFn: () => fetchCourses(token!),
    enabled: !!token, // Solo ejecutar si hay token
    staleTime: 5 * 60 * 1000, // 5 minutos - datos considerados frescos
    gcTime: 10 * 60 * 1000, // 10 minutos - tiempo en cache
    retry: (failureCount, error) => {
      // No retry en errores 401/403 (auth issues)
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Función para establecer curso activo
  const setActiveCourse = useCallback((course: Course) => {
    setActiveCourseState(course);
    persistActiveCourse(course);
  }, []);

  // Función para limpiar estado
  const clearCourseState = useCallback(() => {
    setActiveCourseState(null);
    setIsInitialized(false);
    setToken(null);
    persistActiveCourse(null);
    queryClient.removeQueries({ queryKey: courseKeys.all });
  }, [queryClient]);

  // Efecto para detectar cambios en el token
  useEffect(() => {
    const checkToken = () => {
      const currentToken = getCookieValue('accessToken');
      if (currentToken !== token) {
        setToken(currentToken);
      }
    };

    // Check inicial
    checkToken();

    // Verificar cambios periódicamente (pero menos frecuente)
    const interval = setInterval(checkToken, 5000); // Cada 5 segundos
    window.addEventListener(TOKEN_CHANGED_EVENT, checkToken);

    return () => {
      clearInterval(interval);
      window.removeEventListener(TOKEN_CHANGED_EVENT, checkToken);
    };
  }, [token]);

  // Efecto para inicialización y manejo de curso activo
  useEffect(() => {
    // Cargar curso persistido inmediatamente
    if (!isInitialized) {
      const persistedCourse = getPersistedActiveCourse();
      if (persistedCourse) {
        setActiveCourseState(persistedCourse);
      }
      setIsInitialized(true);
    }

    // Cuando los cursos se cargan, validar/actualizar curso activo
    if (courses.length > 0) {
      const persistedCourse = getPersistedActiveCourse();
      let courseToSelect: Course | null = null;

      // Verificar que el curso persistido aún existe
      if (persistedCourse) {
        courseToSelect = courses.find((c) => c.id === persistedCourse.id) || null;
      }

      // Si no hay curso válido, seleccionar el primero
      if (!courseToSelect && courses.length > 0) {
        courseToSelect = courses[0];
      }

      // Solo actualizar si es diferente al actual
      if (courseToSelect && courseToSelect.id !== activeCourse?.id) {
        setActiveCourseState(courseToSelect);
        persistActiveCourse(courseToSelect);
      }
    }
  }, [courses, activeCourse?.id, isInitialized]);

  // Función wrapper para refetch
  const refreshCourses = useCallback(() => {
    refetch();
  }, [refetch]);

  const value: CourseContextType = {
    activeCourse,
    setActiveCourse,
    courses,
    isLoading,
    isFetching,
    error: error as Error | null,
    refetch: refreshCourses,
    isInitialized,
    clearCourseState,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}
