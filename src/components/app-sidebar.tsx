"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Logo from "@/assets/images/logo.png";
import { ModuleSwitcher } from "./module-switcher";
import {
  AudioWaveform,
  GalleryVerticalEnd,
} from "lucide-react"

const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  NavGestion: [

    {
      title: "Intégrations",
      url: "#",
      icon: Bot,
      isActive: true,
      items: [
        {
          title: "Factures Digitales",
          url: "/gestion/integrations/factures-digitales",
        },
      ],
    },
  ],
  NavSettings: [
    {
      title: "Paramètres",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  NavDashboard: [
    {
      title: "Analyse",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Reporting",
          url: "/dashboard/analyse/reporting",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <ModuleSwitcher teams={data.teams} />


      </SidebarHeader>
      <SidebarContent>
        <NavMain section="Tableau de bord" items={data.NavDashboard} />
        <NavMain section="Gestion" items={data.NavGestion} />
        {/* <NavMain section="Paramètres" items={data.NavSettings} /> */}
      </SidebarContent>
      <SidebarFooter><NavUser user={data.user} /></SidebarFooter>
    </Sidebar>
  );
}
