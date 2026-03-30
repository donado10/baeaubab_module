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
import { useEntrepriseBonLivraisonStore } from "../store/store";




export function DropdownMenuTable({
  ref_enterprise,
  children,
  type
}: {
  ref_enterprise: string;
  children: ReactNode;
  type: number
}) {
  const store = useEntrepriseBonLivraisonStore()
  const pathname = usePathname()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="start">
          {type !== 1 && <DropdownMenuItem className="text-blue-600" asChild onClick={() => { store.setClearDialogState(); store.setDialogState({ ...store.dialog, viewTable: [true, ref_enterprise] }) }}>
            <Link href={`${pathname}/${ref_enterprise}`}>
              <span
              >
                Voir
              </span>
            </Link>
          </DropdownMenuItem>}
          {type === 1 && <DropdownMenuItem className="text-blue-600" asChild onClick={() => { store.setClearDialogState(); store.setDialogState({ ...store.dialog, viewTable: [true, ref_enterprise] }) }}>
            <Link href={`${pathname}/residence/${ref_enterprise}`}>
              <span
              >
                Voir
              </span>
            </Link>
          </DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
