"use client"

import { ReactNode } from "react"
import { useEntrepriseBonLivraisonStore } from "../../store/store"
import { toast } from "sonner"
import useGenerateFacturesByEntreprise from "../../api/factures/use-generate-facture-by-entreprise"
import { DialogBonLivraisonAction } from "./dialog-shell"

export function DialogGenerateFacturesByEntreprise({ children }: { children: ReactNode }) {
    const store = useEntrepriseBonLivraisonStore()
    const { mutate, isPending } = useGenerateFacturesByEntreprise()

    const submitHandler = () => {
        mutate({ json: { en_list: store.billCart, year: store.periode[0], month: store.periode[1] } }, {
            onSuccess: () => {
                toast.success("Génération lancée")
            }
        })
    }

    return (
        <DialogBonLivraisonAction title="Générer Factures" onConfirm={submitHandler} isPending={isPending}>
            {children}
        </DialogBonLivraisonAction>
    )
}

