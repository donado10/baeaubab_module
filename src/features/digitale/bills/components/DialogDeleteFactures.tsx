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
import { useEntrepriseFactureStore } from "../store/store"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import useDeleteFactureByDocument from "../../_shared/api/use-delete-selected-factures"
import { useEntrepriseDetailStore } from "../store/entreprise-store"


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
    const store = useEntrepriseFactureStore()

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
    const store = useEntrepriseFactureStore()
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

export function DialogDeleteFactures({ children }: { children: ReactNode }) {

    const store = useEntrepriseDetailStore()

    const [close, setClose] = useState<boolean | undefined>(undefined)

    const queryClient = useQueryClient()


    const { mutate } = useDeleteFactureByDocument()


    const submitHandler = () => {



        mutate({ json: { year: store.periode[0], month: store.periode[1], en_no: store.entreprise.EN_No_Sage, fact_list: store.billCart } }, {
            onSuccess: (results: any) => {

                toast.success("Factures annulées avec succès !", {
                    style: {
                        background: 'green',
                        color: 'white'
                    }
                })

                /* mutateGetFacture({ json: { year: store.periode[0], month: store.periode[1] } }, {
                    onSuccess: (results: any) => {
                        store.setItems(results.result)
                        store.setEvent(null)
                        queryClient.invalidateQueries({ queryKey: ["document_stats_facture", store.periode[0], store.periode[1]], exact: true })
                        setClose(false)
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

