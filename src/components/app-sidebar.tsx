'use client';

import * as React from 'react';
import { Building2, Frame, NotebookPen, User, UsersRound, BookOpen } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { CourseSwitcher } from '@/components/course-switcher';
import { TabSelector } from '@/components/tab-selector';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useCourse } from '@/context/CourseContext';
import { useUser } from '@/context/UserContext';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { activeCourse } = useCourse();
  const { user } = useUser();
  const { state } = useSidebar();
  const [activeTab, setActiveTab] = React.useState<'curso' | 'general'>('curso');

  console.log('AppSidebar user:', user);

  const userData = {
    username: user?.username ?? 'default-user-id',
    email: user?.email ?? 'default@mail.com',
  };

  const navMain = React.useMemo(() => {
    // Para el tab "General", botones directos con endpoints diferentes
    if (activeTab === 'general') {
      return [
        {
          title: 'Cursos',
          url: '/dashboard/courses',
          icon: BookOpen,
          isDirectButton: true,
        },
        {
          title: 'Organizaciones',
          url: '/dashboard/general/organizations',
          icon: Building2,
          isDirectButton: true,
        },
        {
          title: 'Mentores',
          url: '/dashboard/general/mentors',
          icon: User,
          isDirectButton: true,
        },
        {
          title: 'Pasantes',
          url: '/dashboard/general/interns',
          icon: UsersRound,
          isDirectButton: true,
        },
      ];
    }

    // Para el tab "Curso", mantenemos la lógica original expandible
    if (!activeCourse) {
      return [
        {
          title: 'Organizaciones',
          url: '/',
          icon: Building2,
          items: [
            {
              title: 'Explorar',
              url: '/dashboard/organizations/',
            },
            {
              title: 'Registrar',
              url: '/dashboard/organizations/create/',
            },
          ],
        },
        {
          title: 'Mentores',
          url: '/',
          icon: User,
          items: [
            {
              title: 'Explorar',
              url: '/dashboard/mentors/',
            },
            {
              title: 'Registrar',
              url: '/dashboard/mentors/create/',
            },
          ],
        },
        {
          title: 'Pasantes',
          url: '/',
          icon: UsersRound,
          items: [
            {
              title: 'Explorar',
              url: '/dashboard/interns/',
            },
            {
              title: 'Registrar',
              url: '/dashboard/interns/create/',
            },
          ],
        },
      ];
    }

    return [
      {
        title: 'Organizaciones',
        url: '/',
        icon: Building2,
        items: [
          {
            title: 'Explorar',
            url: `/dashboard/organizations/`,
          },
          {
            title: 'Registrar',
            url: `/dashboard/organizations/create/`,
          },
        ],
      },
      {
        title: 'Mentores',
        url: '/',
        icon: User,
        items: [
          {
            title: 'Explorar',
            url: `/dashboard/mentors/`,
          },
          {
            title: 'Registrar',
            url: `/dashboard/mentors/create/`,
          },
        ],
      },
      {
        title: 'Pasantes',
        url: '/',
        icon: UsersRound,
        items: [
          {
            title: 'Explorar',
            url: `/dashboard/interns/`,
          },
          {
            title: 'Registrar',
            url: `/dashboard/interns/create/`,
          },
        ],
      },
    ];
  }, [activeCourse, activeTab]);

  // Cambiar los endpoints de Dashboard y Notas según el tab activo
  const dashboardUrl = activeTab === 'general' ? '/dashboard' : '/dashboard';
  const notasUrl = activeTab === 'general' ? '/dashboard/general/tracking' : '/dashboard/tracking';

  return (
    <Sidebar collapsible="icon" className="z-50" {...props}>
      <SidebarHeader>
        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
        {/* Solo mostrar CourseSwitcher cuando el tab "Curso" está activo Y el sidebar no está colapsado */}
        {activeTab === 'curso' && state !== 'collapsed' && <CourseSwitcher />}
      </SidebarHeader>
      <SidebarContent>
        <Link href={dashboardUrl}>
          <SidebarMenuButton className="mx-2 cursor-pointer">
            <Frame className="h-5 w-5" />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </Link>
        <Link href={notasUrl}>
          <SidebarMenuButton className="mx-2 cursor-pointer">
            <NotebookPen className="h-5 w-5" />
            <span>Notas</span>
          </SidebarMenuButton>
        </Link>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
