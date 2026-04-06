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
import { ReactNode, useState } from "react"
//import { useLoadEcrituresFromDigital, useLoadEcrituresFromSage } from "../api/use-load-ecritures"
import { useEntrepriseBonLivraisonStore } from "../store/store"
import JobWatcher from "./JobWatcher"
import { toast } from "sonner"
import useGenerateFacturesByEntreprise from "../api/use-generate-facture-by-entreprise"


export function DialogGenerateFacturesByEntreprise({ children }: { children: ReactNode }) {

    const store = useEntrepriseBonLivraisonStore()

    const [close, setClose] = useState<boolean | undefined>(undefined)

    const { mutate } = useGenerateFacturesByEntreprise()


    const submitHandler = () => {
        setClose(false)


        const id_toast = toast(() => {
            const store = useEntrepriseBonLivraisonStore()


            return (
                <div className="text-white">
                    <h1 >En cours</h1>
                    {store.event && <JobWatcher jobId={store.event.jobId} />}
                </div >
            )
        },
            {
                duration: Infinity,
                style: {
                    background: 'green'
                }
            });




        mutate({ json: { en_list: store.billCart, year: store.periode[0], month: store.periode[1] } }, {
            onSuccess: (results: any) => {
                store.setEvent({ ec_count: "", ec_total: "", jobId: results.jobId, status: "pending", id_toast_job: id_toast as string })
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
                        <DialogTitle>Générer Factures  </DialogTitle>
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

