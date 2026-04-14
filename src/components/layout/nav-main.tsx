"use client";


import {
  Collapsible,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    isActive?: boolean;
  }[];
}) {
  return (
    <SidebarGroup className="mt-8">
      <SidebarMenu className="flex gap-4 text-xl font-semibold ">
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem className={cn("hover:text-white", item.isActive ? 'text-white' : 'text-white/15')}>
              <a href={item.url}>
                <span>{item.title}</span>
              </a>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
