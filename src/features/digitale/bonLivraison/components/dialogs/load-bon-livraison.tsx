"use client"

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReactNode, useEffect, useState } from "react"
import { EStatus, useEntrepriseBonLivraisonStore } from "../../store/store"
import JobWatcher from "../JobWatcher"
import { toast } from "sonner"
import useGetBonLivraisonDigital from "../../api/use-get-bon-livraison-digital"
import { DialogBonLivraisonAction } from "./dialog-shell"


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
    return <Select value={month} onValueChange={onSetMonth}>
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Mois" />
        </SelectTrigger>
        <SelectContent>
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
    let years: number[] = []
    for (let y = 2020; y < currentYear; y++) {
        years = [...years, y + 1]
    }

    return <Select value={year} onValueChange={onSetYear}>
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
    const { mutate, isPending } = useGetBonLivraisonDigital()

    useEffect(() => {
        if (store.periode.length === 2) {
            setYear(store.periode[0])
            setMonth(store.periode[1])
        }
    }, [JSON.stringify(store.periode)])

    const submitHandler = () => {
        const id_toast = toast(() => {
            const s = useEntrepriseBonLivraisonStore()
            return (
                <div className="text-white">
                    <h1>En cours</h1>
                    {s.event && <JobWatcher jobId={s.event.jobId} />}
                </div>
            )
        }, { duration: Infinity, style: { background: 'green' } })

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

    const content = (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
                <SelectMonth month={month} onSetMonth={setMonth} />
                <SelectYear year={year} onSetYear={setYear} />
            </div>
        </div>
    )

    return (
        <DialogBonLivraisonAction
            title="Chargement bon de livraisons"
            onConfirm={submitHandler}
            isPending={isPending}
            content={content}
        >
            {children}
        </DialogBonLivraisonAction>
    )
}

