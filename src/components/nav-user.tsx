'use client';

import { ChevronsUpDown, LogOut } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { clearAllAuthData } from '@/utils/setAuthCookie';
import { useCourse } from '@/context/CourseContext';

export function NavUser({
  user,
}: {
  user: {
    username: string;
    email: string;
    role: 'admin' | 'mentor' | null;
  };
}) {
  const roleLabel =
    user.role === 'admin' ? 'Administrador' : user.role === 'mentor' ? 'Mentor' : 'Usuario';
  const initials = (user.email || roleLabel).slice(0, 2).toUpperCase();

  const { isMobile } = useSidebar();
  const router = useRouter();
  const { clearCourseState } = useCourse();

  const handleSignOut = async () => {
    try {
      // Limpiar el estado de cursos usando la función del contexto
      clearCourseState();

      // Limpiar todos los datos de autenticación
      clearAllAuthData();

      // Cerrar la sesión en Supabase
      await supabase.auth.signOut();

      // Redirigir al login
      router.push('/');

      console.log('Successfully signed out');
    } catch (error) {
      console.error('Error during sign out:', error);

      // Incluso si hay error, limpiar datos locales y redirigir
      clearAllAuthData();
      clearCourseState();
      router.push('/');
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {/*<AvatarImage src={user.avatar} alt={user.name} />*/}
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{roleLabel}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {/*<AvatarImage src={user.avatar} alt={user.name} />*/}
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{roleLabel}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
