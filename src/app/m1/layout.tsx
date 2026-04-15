import { AppSidebar } from "@/components/layout/app-sidebar";
import BreadcrumbContainer from "@/components/layout/breadcrumbContainer";
import NotificationSection from "@/components/notification/notification";
import ActiveJobWatcher from "@/components/notification/active-job-watcher";
import SearchSection from "@/features/digitale/search/components/SearchSection";
import Providers from "@/components/providers/queryProviders";

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
    <Providers>
      <ActiveJobWatcher />
      <SidebarProvider className="">
        <AppSidebar />
        <div className="flex flex-col w-full p-4 h-screen overflow-hidden">

          <div className="h-[10vh] w-full flex items-center justify-between gap-4 px-2">
            <SearchSection />
            <NotificationSection />
          </div>
          <SidebarInset className="h-[80vh]  rounded-xl overflow-hidden">
            <header className="flex h-[5%] shrink-0 items-center justify-between gap-2 border-b border-gray-500-900 ">
              <div className="flex items-center gap-2 px-4 ">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <BreadcrumbContainer />
              </div>

            </header>
            <div className="h-[95%] overflow-scroll">

              <main className="overflow-scroll">{children}</main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </Providers>
  );
}
