"use client"

import * as React from "react"
import {
  AudioWaveform,
  BriefcaseBusinessIcon,
  Command,
  Frame,
  GalleryVerticalEnd,
  User,
  UsersRound,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { CourseSwitcher } from "@/components/course-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  courses: [
    {
      name: "Cohort '22",
      logo: GalleryVerticalEnd,
      plan: "Cambio Climático",
    },
    {
      name: "Cohort '23",
      logo: AudioWaveform,
      plan: "Energías Renovables",
    },
    {
      name: "Cohort '24",
      logo: Command,
      plan: "Desarrollo Sostenible",
    },
  ],
  navMain: [
    {
      title: "Empresas",
      url: "/",
      icon: BriefcaseBusinessIcon,
      items: [
        {
          title: "Explorar",
          url: "/dashboard/companies",
        },
        {
          title: "Registrar",
          url: "/dashboard/companies/create",
        },
      ],
    },
    {
      title: "Mentores",
      url: "/",
      icon: User,
      isActive: true,
      items: [
        {
          title: "Explorar",
          url: "/dashboard/mentors",
        },
        {
          title: "Registrar",
          url: "/dashboard/mentors/create",
        },
      ],
    },
    {
      title: "Pasantes",
      url: "#",
      icon: UsersRound,
      isActive: true,
      items: [
        {
          title: "Explorar",
          url: "/dashboard/interns",
        },
        {
          title: "Registrar",
          url: "/dashboard/interns/create",
        },
      ],
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CourseSwitcher courses={data.courses} />
      </SidebarHeader>
      <SidebarContent>
        <Link href="/dashboard">
          <SidebarMenuButton className="mx-2 cursor-pointer">
            <Frame className="h-5 w-5" />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </Link>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
