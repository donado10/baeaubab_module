"use client"

import { ReactNode } from "react"
import { useEntrepriseBonLivraisonStore } from "../../store/store"
import JobWatcher from "../JobWatcher"
import { toast } from "sonner"
import useGenerateFactures from "../../api/use-generate-factures"
import { DialogBonLivraisonAction } from "./dialog-shell"

export function DialogGenerateFactures({ children }: { children: ReactNode }) {
    const store = useEntrepriseBonLivraisonStore()
    const { mutate, isPending } = useGenerateFactures()

    const submitHandler = () => {
        const id_toast = toast(() => {
            const s = useEntrepriseBonLivraisonStore()
            return (
                <div className="text-white">
                    <h1>En cours</h1>
                    {s.event && <JobWatcher jobId={s.event.jobId} />}
                </div>
            )
        }, { duration: Infinity, style: { background: 'green' } })

        mutate({ json: { year: store.periode[0], month: store.periode[1] } }, {
            onSuccess: (results: any) => {
                store.setEvent({ ec_count: "", ec_total: "", jobId: results.jobId, status: "pending", id_toast_job: id_toast as string })
            }
        })
    }

    return (
        <DialogBonLivraisonAction title="Générer Factures" onConfirm={submitHandler} isPending={isPending}>
            {children}
        </DialogBonLivraisonAction>
    )
}

