"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEntrepriseBonLivraisonStore } from "../store/store";
import { toast } from "sonner";
import useGenerateFacturesByEntreprise from "../api/factures/use-generate-facture-by-entreprise";
import useUpdateBonLivraison from "../api/use-update-bon-livraison";
import useGenerateFactureForEntreprise from "../api/factures/use-generate-facture-for-entreprise";

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
  const { mutate } = useUpdateBonLivraison()
  const { mutate: mutateGenerateBillForEntreprise } = useGenerateFactureForEntreprise()


  const entreprise = store.items.find((item) => item.EN_No.toString() === ref_enterprise)

  const submitHandler = () => {
    if (entreprise) {
      mutate({ json: { en_list_invalid: entreprise.EN_Valide === 0 ? [ref_enterprise] : [], en_list_valid: entreprise.EN_Valide === 1 ? [ref_enterprise] : [], year: store.periode[0], month: store.periode[1] } }, {
        onSuccess: () => {
          toast.success("Actualisation lancée")
        }
      })
    }
  }

  const generateBillHandler = () => {
    if (entreprise) {
      mutateGenerateBillForEntreprise({ json: { year: store.periode[0], month: store.periode[1], en_no: entreprise.EN_No } }, {
        onSuccess: () => {
          toast.success("Génération de facture lancée")
        }
      })
    }
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
          <DropdownMenuItem className="text-blue-600" onClick={submitHandler}>
            <span
            >
              Actualiser
            </span>
          </DropdownMenuItem>
          {entreprise?.EN_Valide === 0 && <DropdownMenuItem className="text-blue-600" onClick={generateBillHandler}>
            <span
            >
              Générer Facture
            </span>
          </DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
