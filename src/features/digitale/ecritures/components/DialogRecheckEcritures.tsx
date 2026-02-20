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
import useLoadEcrituresCheckBills from "../api/use-load-ecritures-check-bills"


export function DialogRecheckEcritures({ children }: { children: ReactNode }) {
    const [close, setClose] = useState<boolean | undefined>(undefined)

    const store = useEcritureEnteteLigneStore()

    const { mutate: mutateWithCheck } = useLoadEcrituresCheckBills()

    const submitHandler = () => {
        setClose(false)


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

        mutateWithCheck({ json: { year: store.periode[0], month: store.periode[1], bills: store.billCart } }, {
            onSuccess: (results) => {
                store.clear()
                store.setItems(results.results)
                store.setFilter({ status: EStatus.ALL })
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
                        <DialogTitle>Chargement des écritures comptables</DialogTitle>
                    </DialogHeader>

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
