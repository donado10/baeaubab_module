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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReactNode, useState } from "react"
import useLoadEcritures from "../api/use-load-ecritures"
import { EStatus, useEcritureEnteteLigneStore } from "../store/store"
import JobWatcher from "./JobWatcher"
import useLoadEcrituresWithCheck from "../api/use-load-ecritures-with-check"
import { toast } from "sonner"


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

const SelectMonth = ({ onSetMonth }: { onSetMonth: (value: string) => void }) => {
    return <Select onValueChange={(value) => onSetMonth(value)}>
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

const SelectYear = ({ onSetYear }: { onSetYear: (value: string) => void }) => {

    const currentYear = new Date().getFullYear();
    let years: number[] = []

    for (let year = 2020; year < currentYear; year++) {
        years = [...years, year + 1]

    }


    return <Select onValueChange={(value) => onSetYear(value)}>
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

export function DialogLoadEcritures({ children }: { children: ReactNode }) {

    const [year, setYear] = useState('2020')
    const [month, setMonth] = useState('1')
    const [withChecking, setWithChecking] = useState(false)

    const [close, setClose] = useState<boolean | undefined>(undefined)

    const store = useEcritureEnteteLigneStore()

    const { mutate } = useLoadEcritures()
    const { mutate: mutateWithCheck } = useLoadEcrituresWithCheck()

    const submitHandler = () => {
        setClose(false)
        store.setPeriode(year, month)

        console.log(withChecking)
        if (withChecking) {

            const id_toast = toast(() => {
                const store = useEcritureEnteteLigneStore()

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

            mutateWithCheck({ json: { year, month, check: withChecking } }, {
                onSuccess: (results) => {
                    store.clear()
                    store.setItems(results.results)
                    store.setFilter({ status: EStatus.ALL })
                    store.setEvent({ ec_count: "", ec_total: "", jobId: results.jobId, status: "pending", id_toast_job: id_toast as string })
                }
            })


        } else {
            mutate({ json: { year, month } }, {
                onSuccess: (results) => {
                    store.clear()
                    store.setItems(results.results)
                    store.setFilter({ status: EStatus.ALL })
                }
            })


        }
    }

    return (
        <Dialog open={close} onOpenChange={(val) => setClose(undefined)}>
            <form >
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="mb-4">
                        <DialogTitle>Chargement des écritures comptables</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Checkbox id="terms-checkbox" name="terms-checkbox" className="hover:cursor-pointer" checked={withChecking} onCheckedChange={(value: boolean) => setWithChecking(value)} />
                            <Label htmlFor="terms-checkbox">Vérification</Label>
                        </div>

                        <div className="flex items-center justify-between w-full ">
                            <SelectMonth onSetMonth={setMonth} />
                            <SelectYear onSetYear={setYear} />
                        </div>
                    </div>

                    <DialogFooter className="gap-4">
                        <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button onClick={submitHandler}>Confirmer</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
