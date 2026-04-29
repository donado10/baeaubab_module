"use client"

import { ReactNode } from "react"
import { useEntrepriseFactureStore } from "../../store/store"
import { toast } from "sonner"
import useCancelFacture from "../../api/use-cancel-facture"
import { DialogShell } from "@/components/dialogs/dialog-shell"

export function DialogCancelFacture({ children, do_no }: { children: ReactNode; do_no: string }) {
    const store = useEntrepriseFactureStore()
    const { mutate, isPending } = useCancelFacture()

    const onConfirm = () => {
        if (!do_no) return

        mutate(
            { json: { year: store.periode[0], month: store.periode[1], do_no } },
            {
                onSuccess: () => toast.success("Annulation de la facture lancée"),
                onError: () => toast.error("Échec de l'annulation de la facture"),
            },
        )
    }

    return (
        <DialogShell
            title={`Annuler la facture ${do_no}`}
            description={`La facture ${do_no} sera annulée. Cette action est irréversible.`}
            onConfirm={onConfirm}
            isPending={isPending || !do_no}
            confirmLabel="Annuler la facture"
        >
            {children}
        </DialogShell>
    )
}
