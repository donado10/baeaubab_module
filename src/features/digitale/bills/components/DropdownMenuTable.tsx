"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode, use, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEntrepriseFactureStore } from "../store/store";
import useDeleteFeature from "@/features/features/api/use-delete-feature";
import { toast } from "sonner";
import JobWatcher from "./JobWatcher";
import useDeleteSomeFactures from "../api/use-delete-facture";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import useGetFacture from "../api/use-get-facture";




export function DropdownMenuTable({
  ref_enterprise,
  children,
}: {
  ref_enterprise: string;
  children: ReactNode;
}) {
  const store = useEntrepriseFactureStore()
  const pathname = usePathname()
  const { mutate } = useDeleteSomeFactures()
  const queryClient = useQueryClient()
  const { mutate: mutateGetFacture } = useGetFacture()


  const submitHandler = () => {


    mutate({ json: { en_list: [ref_enterprise], year: store.periode[0], month: store.periode[1] } }, {
      onSuccess: (results: any) => {
        // toast success with green background and white text

        toast.success("Facture supprimée avec succès !", {
          style: {
            background: 'green',
            color: 'white'
          }
        })
        mutateGetFacture({ json: { year: store.periode[0], month: store.periode[1] } }, {
          onSuccess: (results: any) => {
            store.setItems(results.result)
            store.setEvent(null)
          }
        })
      }
    })

  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="start">
          <DropdownMenuItem className="text-blue-600" asChild onClick={() => { store.setClearDialogState(); store.setDialogState({ ...store.dialog, viewTable: [true, ref_enterprise] }) }}>
            <Link href={`${pathname}/${ref_enterprise}`}>
              <span
              >
                Voir
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600" onClick={submitHandler}>
            <span
            >
              Annuler
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
