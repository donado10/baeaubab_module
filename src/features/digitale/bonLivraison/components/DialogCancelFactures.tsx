"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReactNode, useState } from "react"
//import { useLoadEcrituresFromDigital, useLoadEcrituresFromSage } from "../api/use-load-ecritures"
import { EStatus } from "../store/store"
import JobWatcher from "./JobWatcher"
import { toast } from "sonner"
import useGetBonLivraisonDigital from "../api/use-get-bon-livraison-digital"
import useGenerateFactures from "../api/use-generate-factures"
import useDeleteFactures from "../api/use-delete-factures"
import { useQueryClient } from "@tanstack/react-query"
import { useEntrepriseDetailStore } from "../store/entreprise-store"
import useDeleteFactureByDocument from "../api/use-delete-factures"



export function DialogCancelFactures({ children }: { children: ReactNode }) {

    const store = useEntrepriseDetailStore()

    const [close, setClose] = useState<boolean | undefined>(undefined)

    const queryClient = useQueryClient()


    const { mutate } = useDeleteFactureByDocument()


    const submitHandler = () => {



        mutate({ json: { fact_list: store.billCart, en_no: store.entreprise.EN_No_Sage, year: store.periode[0], month: store.periode[1] } }, {
            onSuccess: (results: any) => {

                toast.success("Factures annulées avec succès !", {
                    style: {
                        background: 'green',
                        color: 'white'
                    }
                })

                queryClient.invalidateQueries({ queryKey: ["entreprise_bls", store.entreprise.EN_No_Sage, String(store.periode[0]), String(store.periode[1])] })
                queryClient.invalidateQueries({ queryKey: ["entreprise_factures", store.entreprise.EN_No_Sage, String(store.periode[0]), String(store.periode[1])] })
                setClose(false)

                /* mutateGetFacture({ json: { year: store.periode[0], month: store.periode[1] } }, {
                    onSuccess: (results: any) => {
                        store.setItems(results.result)
                        store.setEvent(null)
                    }
                }) */


            }
        })


    }

    return (
        <Dialog open={close} onOpenChange={(val) => setClose(undefined)}>
            <form >
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="mb-4">
                        <DialogTitle>Annuler Factures  </DialogTitle>
                    </DialogHeader>
                    <DialogFooter className="gap-4">
                        <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button onClick={submitHandler} >Confirmer</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

