"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReactNode, useEffect, useState } from "react"
//import { useLoadEcrituresFromDigital, useLoadEcrituresFromSage } from "../api/use-load-ecritures"
import { EStatus, useEntrepriseBonLivraisonStore } from "../store/store"
import JobWatcher from "./JobWatcher"
import { toast } from "sonner"
import useGetBonLivraison from "../api/use-get-bon-livraison"
import useGetBonLivraisonDigital from "../api/use-get-bon-livraison-digital"
import { Store } from "lucide-react"


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

export function DialogLoadBonLivraison({ children }: { children: ReactNode }) {

    const store = useEntrepriseBonLivraisonStore()
    const [year, setYear] = useState(store.periode[0])
    const [month, setMonth] = useState(store.periode[1])

    const [close, setClose] = useState<boolean | undefined>(undefined)




    const { mutate } = useGetBonLivraisonDigital()


    useEffect(() => {
        if (store.periode.length === 2) {
            setYear(store.periode[0])
            setMonth(store.periode[1])
        }
    }, [JSON.stringify(store.periode)])

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


        mutate({ json: { year, month } }, {
            onSuccess: (results: any) => {
                store.clear()
                store.setItems(results.results)
                store.setFilter({ ...store.filter, status: EStatus.ALL })
                store.setEvent({ ec_count: "", ec_total: "", jobId: results.jobId, status: "pending", id_toast_job: id_toast as string })
                store.setPeriode(year, month)
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
                        <DialogTitle>Chargement bon de livraisons </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between w-full ">
                            <SelectMonth month={month} onSetMonth={setMonth} />
                            <SelectYear year={year} onSetYear={setYear} />
                        </div>
                    </div>

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

