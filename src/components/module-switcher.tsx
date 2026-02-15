"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    AudioWaveform,
    GalleryVerticalEnd,
} from "lucide-react"

import {
    Command,
} from "lucide-react";
import useGetModules from "@/features/modules/api/use-get-modules"


export const ModuleSwitcherContainer = () => {
    const { data: modulesData, isPending: modulesIsPending } = useGetModules()

    if (modulesIsPending) {
        return null
    }


    if (!modulesData || modulesData.length <= 0) {
        return null
    }

    console.log(modulesData)
    const modules = [
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
    ]
    return <><ModuleSwitcher modules={modulesData.map((m) => ({ name: m.Mod_No, logo: GalleryVerticalEnd, plan: m.Mod_Description }))} /></>
    /*     
    return <><ModuleSwitcher modules={modules} /></>
    */
}

export function ModuleSwitcher({
    modules,
}: {
    modules: {
        name: string
        logo: React.ElementType
        plan: string
    }[]
}) {
    const { isMobile } = useSidebar()
    const [activeModule, setActiveModule] = React.useState(modules[0])

    console.log(modules[0])
    if (!activeModule) {

        return null
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent/20 "
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <activeModule.logo className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{activeModule.name}</span>
                                <span className="truncate text-xs">{activeModule.plan}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "bottom"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Modules
                        </DropdownMenuLabel>
                        {modules.map((module, index) => (
                            <DropdownMenuItem
                                key={module.name}
                                onClick={() => setActiveModule(module)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border">
                                    <module.logo className="size-3.5 shrink-0" />
                                </div>
                                {module.name}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
