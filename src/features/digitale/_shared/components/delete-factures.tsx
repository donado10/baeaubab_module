"use client"

import { ReactNode } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useEntrepriseDetailStore } from "../../bonLivraison/store/entreprise-store"
import { DialogBonLivraisonAction } from "../../bonLivraison/components/dialogs/dialog-shell"
import useDeleteSelectedFactures from "@/features/digitale/_shared/api/use-delete-selected-factures"
import useDeleteFacturesSingleEntreprise from "@/features/digitale/_shared/api/use-delete-all-factures-single-entreprise"
import useDeleteFactures from "@/features/digitale/_shared/api/use-delete-all-factures"
import { useEntrepriseFactureStore } from "@/features/digitale/bills/store/store"

export function DialogDeleteSelectedFactures({ children }: { children: ReactNode }) {
    const store = useEntrepriseDetailStore()
    const queryClient = useQueryClient()
    const { mutate, isPending } = useDeleteSelectedFactures()

    const submitHandler = () => {
        mutate({ json: { fact_list: store.billCart, year: store.periode[0], month: store.periode[1] } }, {
            onSuccess: () => {
                toast.success("Factures supprimées avec succès !", {
                    style: { background: 'green', color: 'white' }
                })
                queryClient.invalidateQueries({ queryKey: ["entreprise_bls"] })
                queryClient.invalidateQueries({ queryKey: ["entreprise_factures"] })
            }
        })
    }

    return (
        <DialogBonLivraisonAction title="Supprimer Factures" onConfirm={submitHandler} isPending={isPending}>
            {children}
        </DialogBonLivraisonAction>
    )
}

export function DialogDeleteFacturesSingleEntreprise({ children }: { children: ReactNode }) {

    const store = useEntrepriseDetailStore()


    const queryClient = useQueryClient()

    const { mutate } = useDeleteFacturesSingleEntreprise()

    const submitHandler = () => {

        mutate({ json: { year: store.periode[0], month: store.periode[1], en_no: store.entreprise.EN_No_Sage } }, {
            onSuccess: (results: any) => {

                toast.success("Factures supprimées avec succès !", {
                    style: {
                        background: 'green',
                        color: 'white'
                    }
                })

                queryClient.invalidateQueries({ queryKey: ["entreprise_bls"] })
                queryClient.invalidateQueries({ queryKey: ["entreprise_factures"] })
            }
        })
    }

    return (
        <DialogBonLivraisonAction title="Supprimer Factures" onConfirm={submitHandler} isPending={false}>
            {children}
        </DialogBonLivraisonAction>
    )
}

export function DialogDeleteAllFactures({ children, open, onOpenChange }: { children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {

    const store = useEntrepriseFactureStore()

    const queryClient = useQueryClient()

    const { mutate } = useDeleteFactures()



    const submitHandler = () => {
        mutate({ json: { year: store.periode[0], month: store.periode[1] } }, {
            onSuccess: (results: any) => {
                toast.success("Factures supprimées avec succès !", {
                    style: {
                        background: 'green',
                        color: 'white'
                    }
                })
                queryClient.invalidateQueries({ queryKey: ["get-facture-stats-by-company"] })
                queryClient.invalidateQueries({ queryKey: ["get-facture-stats"] })

            }
        })
    }

    return (
        <DialogBonLivraisonAction title="Supprimer Factures" onConfirm={submitHandler} isPending={false} open={open} onOpenChange={onOpenChange}>
            {children}
        </DialogBonLivraisonAction>
    )
}
