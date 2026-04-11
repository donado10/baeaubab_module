import { AppSidebar } from "@/components/app-sidebar";
import BreadcrumbContainer from "@/components/breadcrumbContainer";
import NotificationSection from "@/components/notification/notification";
import Providers from "@/components/queryProviders";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCurrent } from "@/features/auth/action";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { IoNotifications } from "react-icons/io5";


export default async function Layout({ children }: { children: ReactNode }) {

  const user = await getCurrent()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <Providers>

      <SidebarProvider className="">
        <AppSidebar />
        <div className="flex flex-col w-full p-4  ">

          <div className="h-[10vh] w-full ">
            <NotificationSection />
          </div>
          <SidebarInset className="h-[90vh] rounded-xl">
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-500-900 ">
              <div className="flex items-center gap-2 px-4 ">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <BreadcrumbContainer />
              </div>

            </header>
            <main className="  overflow-scroll ">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </Providers>
  );
}
