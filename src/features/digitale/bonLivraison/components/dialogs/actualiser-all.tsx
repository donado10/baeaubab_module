"use client"

import { ComponentType, ReactNode } from "react"
import { toast } from "sonner"
import useUpdateBonLivraison from "../../api/use-update-bon-livraison"
import { DialogBonLivraisonAction } from "./dialog-shell"

type Props = {
    children: ReactNode
    enListValid: string[]
    enListInvalid: string[]
    year: string
    month: string
    onSuccess?: () => void
    EventContent?: ComponentType
}

export function DialogActualiserAllBonLivraison({
    children,
    enListValid,
    enListInvalid,
    year,
    month,
    onSuccess,
}: Props) {
    const { mutate, isPending } = useUpdateBonLivraison()

    const submitHandler = () => {
        mutate(
            { json: { en_list_valid: enListValid, en_list_invalid: enListInvalid, year, month } },
            {
                onSuccess: () => {
                    toast.success("Actualisation lancée")
                    onSuccess?.()
                },
            }
        )
    }

    return (
        <DialogBonLivraisonAction title="Actualiser Bon de livraison" onConfirm={submitHandler} isPending={isPending}>
            {children}
        </DialogBonLivraisonAction>
    )
}

