"use client"

import { ReactNode } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useEntrepriseDetailStore } from "../../store/entreprise-store"
import useDeleteFactureByDocument from "../../api/use-delete-factures"
import { DialogBonLivraisonAction } from "./dialog-shell"

export function DialogCancelFactures({ children }: { children: ReactNode }) {
    const store = useEntrepriseDetailStore()
    const queryClient = useQueryClient()
    const { mutate, isPending } = useDeleteFactureByDocument()

    const submitHandler = () => {
        mutate({ json: { fact_list: store.billCart, en_no: store.entreprise.EN_No_Sage, year: store.periode[0], month: store.periode[1] } }, {
            onSuccess: () => {
                toast.success("Factures annulées avec succès !", {
                    style: { background: 'green', color: 'white' }
                })
                queryClient.invalidateQueries({ queryKey: ["entreprise_bls", store.entreprise.EN_No_Sage, String(store.periode[0]), String(store.periode[1])] })
                queryClient.invalidateQueries({ queryKey: ["entreprise_factures", store.entreprise.EN_No_Sage, String(store.periode[0]), String(store.periode[1])] })
            }
        })
    }

    return (
        <DialogBonLivraisonAction title="Annuler Factures" onConfirm={submitHandler} isPending={isPending}>
            {children}
        </DialogBonLivraisonAction>
    )
}

