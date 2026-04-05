"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
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
      url: "/m1/reporting",
      isActive: false,
    },
    {
      title: "Bon de Livraison",
      endpoint: "bon-livraison",
      url: "/m1/bon-livraison",
      isActive: false,
    },
    {
      title: "Facture",
      endpoint: "facture",
      url: "/m1/facture",
      isActive: false,
    },
    {
      title: "Ecritures Digitales",
      endpoint: 'ecritures-digitales',
      url: "/m1/ecritures-digitales",
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
      if (pathname.split('/')[2] === nav.endpoint) {
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
