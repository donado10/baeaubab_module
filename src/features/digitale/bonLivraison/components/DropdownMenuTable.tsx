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
  refpiece,
  children,
}: {
  refpiece: string;
  children: ReactNode;
}) {
  const store = useEntrepriseBonLivraisonStore()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="start">
          <DropdownMenuItem className="text-blue-600" asChild onClick={() => { store.setClearDialogState(); store.setDialogState({ ...store.dialog, viewTable: [true, refpiece] }) }}>
            <span
            >
              Voir
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-blue-600" asChild onClick={() => { store.setClearDialogState(); store.setDialogState({ ...store.dialog, viewTableCorrection: [true, refpiece] }) }}>
            <span
            >
              Corriger
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-blue-600" asChild onClick={() => { store.setClearDialogState(); store.setDialogState({ ...store.dialog, checkEcriture: [true, refpiece] }) }}>
            <span
            >
              Revérifier
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
