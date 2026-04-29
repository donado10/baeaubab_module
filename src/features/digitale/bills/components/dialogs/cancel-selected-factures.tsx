"use client"

import { ReactNode } from "react"
import { useEntrepriseFactureStore } from "../../store/store"
import { toast } from "sonner"
import useCancelSelectedFactures from "../../api/use-cancel-selected-factures"
import useGetSelectedEntrepriseFactures from "../../api/use-get-selected-entreprise-factures"
import { DialogShell } from "@/components/dialogs/dialog-shell"

export function DialogCancelSelectedFacturesContainerEntreprise({ children, year, month, en_list, open, onOpenChange }: { children?: ReactNode; year: string; month: string; en_list?: string[]; open?: boolean; onOpenChange?: (open: boolean) => void }) {
    const { data, isPending } = useGetSelectedEntrepriseFactures(en_list || [], year, month, "all")

    if (isPending) {
        return (
            <DialogShell
                title="Annuler les factures sélectionnées"
                description="Chargement des factures sélectionnées..."
                isPending={true}
                confirmLabel="Chargement..."
                onConfirm={() => { }}
            >
                {children}
            </DialogShell>
        )
    }

    if (!data || data.results.length === 0) {
        return (
            <DialogShell
                title="Annuler les factures sélectionnées"
                description={`Aucune facture sélectionnée trouvée pour la période ${month}/${year}.`}
                isPending={false}
                confirmLabel="Confirmer"
                onConfirm={() => { }}
            >
                {children}
            </DialogShell>
        )
    }

    const do_no_list = data.results.map((facture) => facture.entete.DO_No)

    return (
        <>
            {children && (
                <DialogCancelSelectedFactures year={year} month={month} do_no_list={do_no_list}>
                    {children}
                </DialogCancelSelectedFactures>
            )}
            {!children && (
                <DialogCancelSelectedFactures open={open} onOpenChange={onOpenChange} year={year} month={month} do_no_list={do_no_list} />
            )}
        </>
    )
}

export function DialogCancelSelectedFactures({ children, year, month, do_no_list, open, onOpenChange }: { children?: ReactNode; year: string; month: string; do_no_list?: string[]; open?: boolean; onOpenChange?: (open: boolean) => void }) {
    const store = useEntrepriseFactureStore()
    const { mutate, isPending } = useCancelSelectedFactures()

    const list = do_no_list ?? []

    const onConfirm = () => {
        if (!list.length) return

        mutate(
            { json: { year: year ?? store.periode[0], month: month ?? store.periode[1], do_no_list: list } },
            {
                onSuccess: () => toast.success("Annulation des factures sélectionnées lancée"),
                onError: () => toast.error("Échec de l'annulation des factures sélectionnées"),
            },
        )
    }

    return (
        <>
            {children && (
                <DialogShell
                    title="Annuler les factures sélectionnées"
                    description={`${list.length} facture(s) sélectionnée(s) seront annulées. Cette action est irréversible.`}
                    onConfirm={onConfirm}
                    isPending={isPending || list.length === 0}
                    confirmLabel={list.length === 0 ? "Confirmer" : `Annuler (${list.length})`}
                >
                    {children}
                </DialogShell>
            )}
            {!children && (
                <DialogShell
                    open={open}
                    onOpenChange={onOpenChange}
                    title="Annuler les factures sélectionnées"
                    description={`${list.length} facture(s) sélectionnée(s) seront annulées. Cette action est irréversible.`}
                    onConfirm={onConfirm}
                    isPending={isPending || list.length === 0}
                    confirmLabel={list.length === 0 ? "Confirmer" : `Annuler (${list.length})`}
                />
            )}
        </>
    )
}
