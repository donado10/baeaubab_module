"use client"

import { ReactNode } from "react"
import { useEntrepriseFactureStore } from "../store/store"
import { toast } from "sonner"
import useGenerateEcrituresFromFacture from "../api/use-generate-ecritures-from-facture"
import { DialogShell } from "@/components/dialogs/dialog-shell"

export function DialogEcrituresFromFacture({ children, do_no }: { children: ReactNode, do_no: string }) {
    const store = useEntrepriseFactureStore()
    const { mutate, isPending } = useGenerateEcrituresFromFacture()


    const onConfirm = () => {
        if (!do_no) return

        mutate(
            { json: { year: store.periode[0], month: store.periode[1], do_no } },
            {
                onSuccess: () => toast.success("Génération des écritures lancée"),
                onError: () => toast.error("Échec du lancement de la génération"),
            },
        )
    }

    return (
        <DialogShell
            title={`Générer les écritures — facture ${do_no}`}
            description={`Les écritures comptables seront générées pour la facture ${do_no}.`}
            onConfirm={onConfirm}
            isPending={isPending || !do_no}
        >
            {children}
        </DialogShell>
    )
}