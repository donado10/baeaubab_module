"use client"

import { ReactNode } from "react"
import { useEntrepriseBonLivraisonStore } from "../../store/store"
import JobWatcher from "../JobWatcher"
import { toast } from "sonner"
import useGenerateFacturesByEntreprise from "../../api/use-generate-facture-by-entreprise"
import { DialogBonLivraisonAction } from "./dialog-shell"

export function DialogGenerateFacturesByEntreprise({ children }: { children: ReactNode }) {
    const store = useEntrepriseBonLivraisonStore()
    const { mutate, isPending } = useGenerateFacturesByEntreprise()

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

        mutate({ json: { en_list: store.billCart, year: store.periode[0], month: store.periode[1] } }, {
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

