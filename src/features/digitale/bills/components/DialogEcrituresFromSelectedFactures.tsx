"use client"

import { ReactNode } from "react"
import { useEntrepriseFactureStore } from "../store/store"
import { toast } from "sonner"
import useGenerateEcrituresFromSelectedFactures from "../api/use-generate-ecritures-from-selected-factures"
import { DialogShell } from "@/components/dialogs/dialog-shell"

export function DialogEcrituresFromSelectedFactures({ children }: { children: ReactNode }) {
    const store = useEntrepriseFactureStore()
    const { mutate, isPending } = useGenerateEcrituresFromSelectedFactures()

    const onConfirm = () => {
        mutate(
            {
                json: {
                    year: store.periode[0],
                    month: store.periode[1],
                    do_nos: store.billCart.map(String),
                },
            },
            {
                onSuccess: () => toast.success("Génération des écritures lancée"),
                onError: () => toast.error("Échec du lancement de la génération"),
            },
        )
    }

    return (
        <DialogShell
            title="Générer les écritures — factures sélectionnées"
            description={`Les écritures comptables seront générées pour ${store.billCart.length} facture(s) sélectionnée(s).`}
            onConfirm={onConfirm}
            isPending={isPending}
            confirmLabel={store.billCart.length === 0 ? "Confirmer" : `Confirmer (${store.billCart.length})`}
        >
            {children}
        </DialogShell>
    )
}