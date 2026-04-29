"use client"

import { ReactNode } from "react"
import { useEntrepriseFactureStore } from "../store/store"
import { toast } from "sonner"
import useGenerateEcrituresFromAllFactures from "../api/use-generate-ecritures-from-all-factures"
import { DialogShell } from "@/components/dialogs/dialog-shell"

export function DialogEcrituresFromAllFactures({ children, open, onOpenChange }: { children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
    const store = useEntrepriseFactureStore()
    const { mutate, isPending } = useGenerateEcrituresFromAllFactures()

    const onConfirm = () => {
        mutate(
            { json: { year: store.periode[0], month: store.periode[1] } },
            {
                onSuccess: () => toast.success("Génération des écritures lancée"),
                onError: () => toast.error("Échec du lancement de la génération"),
            },
        )
    }

    return (
        <DialogShell
            title="Générer les écritures — toutes les factures"
            description="Les écritures comptables seront générées pour toutes les factures de la période sélectionnée."
            onConfirm={onConfirm}
            isPending={isPending}
            open={open}
            onOpenChange={onOpenChange}
        >
            {children}
        </DialogShell>
    )
}