"use client"

import { ReactNode } from "react"
import { useEntrepriseFactureStore } from "../../store/store"
import { toast } from "sonner"
import useCancelFactures from "../../api/use-cancel-factures"
import { DialogShell } from "@/components/dialogs/dialog-shell"

export function DialogCancelFactures({ children, open, onOpenChange }: { children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
    const store = useEntrepriseFactureStore()
    const { mutate, isPending } = useCancelFactures()

    const onConfirm = () => {
        mutate(
            { json: { year: store.periode[0], month: store.periode[1] } },
            {
                onSuccess: () => toast.success("Annulation des factures lancée"),
                onError: () => toast.error("Échec de l'annulation des factures"),
            },
        )
    }

    return (
        <DialogShell
            title="Annuler toutes les factures"
            description="Toutes les factures de la période sélectionnée seront annulées. Cette action est irréversible."
            onConfirm={onConfirm}
            isPending={isPending}
            confirmLabel="Annuler toutes les factures"
            open={open}
            onOpenChange={onOpenChange}
        >
            {children}
        </DialogShell>
    )
}
