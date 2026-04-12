"use client"

import { ComponentType, ReactNode } from "react"
import { toast } from "sonner"
import useUpdateBonLivraison from "../../api/use-update-bon-livraison"
import { DialogBonLivraisonAction } from "./dialog-shell"

interface IEvent {
    jobId: string
    status: string
    ec_count: string
    ec_total: string
    id_toast_job: string
}

type Props = {
    children: ReactNode
    enListValid: string[]
    enListInvalid: string[]
    year: string
    month: string
    onSuccess: (event: IEvent) => void
    EventContent?: ComponentType
}

export function DialogActualiserAllBonLivraison({
    children,
    enListValid,
    enListInvalid,
    year,
    month,
    onSuccess,
    EventContent,
}: Props) {
    const { mutate, isPending } = useUpdateBonLivraison()

    const submitHandler = () => {
        const id_toast = toast(() => (
            <div className="text-white">
                <h1>En cours</h1>
                {EventContent && <EventContent />}
            </div>
        ), { duration: Infinity, style: { background: 'green' } })

        mutate(
            { json: { en_list_valid: enListValid, en_list_invalid: enListInvalid, year, month } },
            {
                onSuccess: (results: any) => {
                    onSuccess({
                        ec_count: "",
                        ec_total: "",
                        jobId: results.jobId,
                        status: "pending",
                        id_toast_job: id_toast as string,
                    })
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

