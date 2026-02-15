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
import { ModuleSwitcher, ModuleSwitcherContainer } from "./module-switcher";


const data = {

  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  NavDashboard: [

    {
      title: "Reporting",
      url: "/m1/dashboard/analyse/reporting",
      isActive: true,
    },
    {
      title: "Factures Digitales",
      url: "/m1/gestion/integrations/factures-digitales",
      isActive: false,
    },]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props} className=" p-2">
      <SidebarHeader >
        <ModuleSwitcherContainer />


      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.NavDashboard} />
        {/* <NavMain section="Paramètres" items={data.NavSettings} /> */}
      </SidebarContent>
      <SidebarFooter><NavUser user={data.user} /></SidebarFooter>
    </Sidebar>
  );
}
