'use client';
import {
  ChevronsUpDown,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trees,
  Sprout,
  Mountain,
  Leaf,
  MountainSnow,
  TreePine,
  Command,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useCourse } from '@/context/CourseContext';

const defaultIcons = [Trees, Sprout, Mountain, Leaf, MountainSnow, TreePine];

export function CourseSwitcher() {
  const { isMobile } = useSidebar();
  const {
    activeCourse,
    setActiveCourse,
    courses,
    isLoading,
    isFetching,
    error,
    refetch,
    isInitialized,
  } = useCourse();

  // Función para obtener icono del curso
  const getIconForCourse = (courseId: string) => {
    const index = courses.findIndex((course) => course.id === courseId);
    return defaultIcons[index % defaultIcons.length] || Leaf;
  };

  // Loading skeleton para carga inicial
  if (!isInitialized || (isLoading && courses.length === 0)) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Skeleton className="aspect-square size-8 rounded-lg" />
            <div className="grid flex-1 text-left text-sm leading-tight gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Loader2 className="ml-auto size-4 animate-spin" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Estado de error
  if (error && courses.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-destructive/10 text-destructive flex aspect-square size-8 items-center justify-center rounded-lg">
              <AlertCircle className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-destructive">Error al cargar</span>
              <span className="truncate text-xs text-muted-foreground">
                No se pudieron cargar los cursos
              </span>
            </div>
            <Button variant="ghost" size="sm" asChild className="ml-auto p-1 h-6 w-6">
              <div onClick={() => refetch()}>
                <RefreshCw className="size-3" />
              </div>
            </Button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Estado sin cursos (después de cargar exitosamente)
  if (courses.length === 0 && !isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-muted text-muted-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Sin cursos</span>
                  <span className="truncate text-xs text-muted-foreground">
                    No hay cursos disponibles
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Opciones
              </DropdownMenuLabel>

              <DropdownMenuItem className="gap-2 p-2 cursor-pointer" asChild>
                <Link href="/dashboard/courses/create" className="flex items-center gap-2 w-full">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">Crear primer curso</div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="gap-2 p-2 cursor-pointer" asChild>
                <Link href="/dashboard/courses" className="flex items-center gap-2 w-full">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Search className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">Ver cursos</div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Curso a mostrar (activo o el primero disponible)
  const displayCourse = activeCourse || courses[0];
  const ActiveIcon = getIconForCourse(displayCourse.id);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ActiveIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayCourse.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {displayCourse.description}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-1">
                {isFetching && <Loader2 className="size-3 animate-spin" />}
                <ChevronsUpDown className="size-4" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs flex items-center justify-between">
              Cursos
              {isFetching && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
            </DropdownMenuLabel>

            {courses.map((course, index) => {
              const CourseIcon = defaultIcons[index % defaultIcons.length] || Command;
              const isActive = activeCourse?.id === course.id;

              return (
                <DropdownMenuItem
                  key={course.id}
                  onClick={() => setActiveCourse(course)}
                  className={`gap-2 p-2 cursor-pointer ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <CourseIcon className="size-3.5 shrink-0" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">{course.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {course.description}
                    </span>
                  </div>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 p-2 cursor-pointer" asChild>
              <Link href="/dashboard/courses/create" className="flex items-center gap-2 w-full">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">Agregar curso</div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-2 p-2 cursor-pointer" asChild>
              <Link href="/dashboard/courses" className="flex items-center gap-2 w-full">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Search className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">Ver cursos</div>
              </Link>
            </DropdownMenuItem>

            {error && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 p-2 text-destructive" onClick={() => refetch()}>
                  <RefreshCw className="size-4" />
                  <div className="font-medium">Reintentar carga</div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
