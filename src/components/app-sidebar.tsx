'use client';

import * as React from 'react';
import { Building2, Frame, NotebookPen, User, UsersRound } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { CourseSwitcher } from '@/components/course-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useCourse } from '@/context/CourseContext';
import { useUser } from '@/context/UserContext';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { activeCourse } = useCourse();
  const { user } = useUser();
  console.log('AppSidebar user:', user);
  const userData = {
    username: user?.username ?? 'default-user-id',
    email: user?.email ?? 'default@mail.com',
  };

  const navMain = React.useMemo(() => {
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
  }, [activeCourse]);

  return (
    <Sidebar collapsible="icon" className="z-50" {...props}>
      <SidebarHeader>
        <CourseSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <Link href="/dashboard">
          <SidebarMenuButton className="mx-2 cursor-pointer">
            <Frame className="h-5 w-5" />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </Link>
        <Link href="/dashboard/tracking">
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
