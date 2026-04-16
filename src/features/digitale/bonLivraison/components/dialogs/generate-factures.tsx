"use client"

import { ReactNode } from "react"
import { useEntrepriseBonLivraisonStore } from "../../store/store"
import { toast } from "sonner"
import useGenerateFactures from "../../api/factures/use-generate-factures"
import { DialogBonLivraisonAction } from "./dialog-shell"

export function DialogGenerateFactures({ children }: { children: ReactNode }) {
    const store = useEntrepriseBonLivraisonStore()
    const { mutate, isPending } = useGenerateFactures()

    const submitHandler = () => {
        mutate({ json: { year: store.periode[0], month: store.periode[1] } }, {
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

