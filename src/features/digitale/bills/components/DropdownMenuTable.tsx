"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode, } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEntrepriseFactureStore } from "../store/store";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import useDeleteFactureByDocument from "../../_shared/api/use-delete-selected-factures";




export function DropdownMenuTable({
  ref_bill,
  ref_enterprise,
  children,
}: {
  ref_bill: string;
  ref_enterprise: string;
  children: ReactNode;
}) {
  const store = useEntrepriseFactureStore()
  const pathname = usePathname()
  const { mutate } = useDeleteFactureByDocument()
  const queryClient = useQueryClient()


  const submitHandler = () => {


    mutate({ json: { fact_list: [ref_bill], en_no: ref_enterprise, year: store.periode[0], month: store.periode[1] } }, {
      onSuccess: (results: any) => {
        // toast success with green background and white text

        toast.success("Facture supprimée avec succès !", {
          style: {
            background: 'green',
            color: 'white'
          }
        })
        queryClient.invalidateQueries({ queryKey: ["get-facture-stats-by-company", store.periode[0], store.periode[1]] })
        queryClient.invalidateQueries({ queryKey: ["get-facture-stats", store.periode[0], store.periode[1]] })
      }
    })

  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="start">
          <DropdownMenuItem className="text-blue-600" asChild onClick={() => { store.setClearDialogState(); store.setDialogState({ ...store.dialog, viewTable: [true, ref_enterprise] }) }}>
            <Link href={`${pathname}/entreprise/${ref_enterprise}?year=${store.periode[0]}&month=${store.periode[1]}`}>
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
