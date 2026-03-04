import { AppSidebar } from "@/components/app-sidebar";
import BreadcrumbContainer from "@/components/breadcrumbContainer";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCurrent } from "@/features/auth/action";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {

  const user = await getCurrent()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <SidebarProvider className="">
      <AppSidebar />
      <SidebarInset className="h-[95vh]">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-500-900">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <BreadcrumbContainer />
          </div>
        </header>
        <main className="  overflow-scroll">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
