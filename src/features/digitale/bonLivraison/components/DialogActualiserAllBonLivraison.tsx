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
import useUpdateBonLivraison from "../api/use-update-bon-livraison"


const months = [
    { month: "janvier", value: 1 },
    { month: "février", value: 2 },
    { month: "mars", value: 3 },
    { month: "avril", value: 4 },
    { month: "mai", value: 5 },
    { month: "juin", value: 6 },
    { month: "juillet", value: 7 },
    { month: "août", value: 8 },
    { month: "septembre", value: 9 },
    { month: "octobre", value: 10 },
    { month: "novembre", value: 11 },
    { month: "décembre", value: 12 }
];


export function DialogActualiserBonLivraison({ children }: { children: ReactNode }) {

    const store = useEntrepriseBonLivraisonStore()

    const [close, setClose] = useState<boolean | undefined>(undefined)

    const { mutate } = useUpdateBonLivraison()


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


        const en_list_valid = store.items.filter((item) => store.billCart.includes(item.EN_No) && item.EN_Valide === 1).map((item) => item.EN_No)
        const en_list_invalid = store.items.filter((item) => store.billCart.includes(item.EN_No) && item.EN_Valide === 0).map((item) => item.EN_No)



        mutate({ json: { en_list_valid, en_list_invalid, year: store.periode[0], month: store.periode[1] } }, {
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
                        <DialogTitle>Actualiser Bon de livraison  </DialogTitle>
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

