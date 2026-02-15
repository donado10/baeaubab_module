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
import { usePathname } from "next/navigation";


const data = {

  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  NavDashboard: [

    {
      title: "Analyse",
      endpoint: "reporting",
      url: "/m1/dashboard/reporting",
      isActive: false,
    },
    {
      title: "Ecritures Digitales",
      endpoint: 'ecritures-digitales',
      url: "/m1/dashboard/ecritures-digitales",
      isActive: false,
    },]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const [navigation, setNavigation] = React.useState<{
    title: string;
    endpoint: string;
    url: string;
    isActive: boolean;
  }[]>(data.NavDashboard)

  React.useEffect(() => {

    const newNavigation = navigation.map((nav) => {
      if (pathname.split('/')[3] === nav.endpoint) {
        nav.isActive = true;
        return nav
      }
      nav.isActive = false
      return nav
    })
    setNavigation(newNavigation)
  }, [pathname])

  return (
    <Sidebar variant="inset" {...props} className=" p-2">
      <SidebarHeader >
        <ModuleSwitcherContainer />


      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation} />
        {/* <NavMain section="Paramètres" items={data.NavSettings} /> */}
      </SidebarContent>
      <SidebarFooter><NavUser user={data.user} /></SidebarFooter>
    </Sidebar>
  );
}
