"use client"

import { ReactNode } from "react"
import { useEntrepriseFactureStore } from "../store/store"
import { toast } from "sonner"
import useGenerateEcrituresFromSelectedFactures from "../api/use-generate-ecritures-from-selected-factures"
import { DialogShell } from "@/components/dialogs/dialog-shell"
import useGetEnterpriseFactures from "../api/use-get-entreprise-factures"
import useGetSelectedEntrepriseFactures from "../api/use-get-selected-entreprise-factures"


// I want to absract the store


export function DialogEcrituresFromSelectedFacturesContainerEntreprise({ children, year, month, en_list, open, onOpenChange }: { children?: ReactNode, year: string, month: string, en_list?: string[], open?: boolean; onOpenChange?: (open: boolean) => void; }) {

    const { data, isPending } = useGetSelectedEntrepriseFactures(en_list || [], year, month)

    if (isPending) {
        return (
            <DialogShell
                title="Générer les écritures — factures sélectionnées"
                description={`Chargement des factures sélectionnées...`}
                isPending={true}
                confirmLabel={`Chargement...`} onConfirm={() => { }}            >
                {children}
            </DialogShell>
        )
    }

    if (!data || data.length === 0) {
        return (
            <DialogShell
                title="Générer les écritures — factures sélectionnées"
                description={`Aucune facture sélectionnée trouvée pour la période ${month}/${year}.`}
                isPending={false}
                confirmLabel={`Confirmer`} onConfirm={() => { }}            >
                {children}
            </DialogShell>
        )
    }



    return (
        <>
            {children && <DialogEcrituresFromSelectedFactures year={year} month={month} do_nos={data.results.map(facture => facture.entete.DO_No) || []}>
                {children}
            </DialogEcrituresFromSelectedFactures>}
            {!children && <DialogEcrituresFromSelectedFactures open={open} onOpenChange={onOpenChange} year={year} month={month} do_nos={data.results.map(facture => facture.entete.DO_No) || []} />}
        </>
    )
}





export function DialogEcrituresFromSelectedFactures({ children, year, month, do_nos, open, onOpenChange }: { children?: ReactNode, year: string, month: string, do_nos?: string[], open?: boolean, onOpenChange?: (open: boolean) => void }) {
    const { mutate, isPending } = useGenerateEcrituresFromSelectedFactures()

    const onConfirm = () => {
        mutate(
            {
                json: {
                    year: year,
                    month: month,
                    do_nos: do_nos,
                },
            },
            {
                onSuccess: () => toast.success("Génération des écritures lancée"),
                onError: () => toast.error("Échec du lancement de la génération"),
            },
        )
    }

    return (
        <>
            {children && <DialogShell
                title="Générer les écritures — factures sélectionnées"
                description={`Les écritures comptables seront générées pour ${do_nos?.length || 0} facture(s) sélectionnée(s).`}
                onConfirm={onConfirm}
                isPending={isPending}
                confirmLabel={do_nos?.length === 0 ? "Confirmer" : `Confirmer (${do_nos?.length})`}
            >
                {children}
            </DialogShell>}
            {!children && <DialogShell
                open={open}
                title="Générer les écritures — factures sélectionnées"
                description={`Les écritures comptables seront générées pour ${do_nos?.length || 0} facture(s) sélectionnée(s).`}
                onConfirm={onConfirm}
                isPending={isPending}
                onOpenChange={onOpenChange}
                confirmLabel={do_nos?.length === 0 ? "Confirmer" : `Confirmer (${do_nos?.length})`}
            />}
        </>
    )
}

