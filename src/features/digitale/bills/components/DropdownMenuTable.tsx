"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEntrepriseFactureStore } from "../store/store";




export function DropdownMenuTable({
  ref_enterprise,
  children,
}: {
  ref_enterprise: string;
  children: ReactNode;
}) {
  const store = useEntrepriseFactureStore()
  const pathname = usePathname()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="start">
          <DropdownMenuItem className="text-blue-600" asChild onClick={() => { store.setClearDialogState(); store.setDialogState({ ...store.dialog, viewTable: [true, refpiece] }) }}>
            <Link href={`${pathname}/${ref_enterprise}`}>
              <span
              >
                Voir
              </span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
