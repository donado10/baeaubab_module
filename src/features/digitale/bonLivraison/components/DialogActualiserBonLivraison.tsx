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
import { EStatus, useEntrepriseBonLivraisonStore } from "../store/store"
import JobWatcher from "./JobWatcher"
import { toast } from "sonner"
import useGetBonLivraisonDigital from "../api/use-get-bon-livraison-digital"
import useGenerateFactures from "../api/use-generate-factures"
import useGenerateFacturesByEntreprise from "../api/use-generate-facture-by-entreprise"
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

const SelectMonth = ({ month, onSetMonth }: { month: string, onSetMonth: (value: string) => void }) => {
    const store = useEntrepriseBonLivraisonStore()

    return <Select value={month} onValueChange={(value) => { onSetMonth(value) }}>
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Mois" />
        </SelectTrigger>
        <SelectContent >
            <SelectGroup>
                {months.map((m) =>
                    <SelectItem key={m.value} value={m.value.toString()}>{m.month}</SelectItem>
                )}
            </SelectGroup>
        </SelectContent>
    </Select>
}

const SelectYear = ({ year, onSetYear }: { year: string; onSetYear: (value: string) => void }) => {

    const currentYear = new Date().getFullYear();
    const store = useEntrepriseBonLivraisonStore()
    let years: number[] = []

    for (let year = 2020; year < currentYear; year++) {
        years = [...years, year + 1]

    }


    return <Select value={year} onValueChange={(value) => { onSetYear(value) }}>
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Année" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                {years.map((y) =>
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                )}
            </SelectGroup>
        </SelectContent>
    </Select>
}

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

