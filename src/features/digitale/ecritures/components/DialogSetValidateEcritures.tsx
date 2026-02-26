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
import { ReactNode, useState } from "react"
import { EStatus, useEcritureEnteteLigneStore } from "../store/store"
import JobWatcher from "./JobWatcher"
import { toast } from "sonner"
import useSetValidateBills from "../api/use-set-valid-bills"
import { MdStarBorderPurple500 } from "react-icons/md"


export function DialogSetValidateEcritures({ children }: { children: ReactNode }) {
    const [close, setClose] = useState<boolean | undefined>(undefined)

    const store = useEcritureEnteteLigneStore()

    const { mutate: mutateValidateBills } = useSetValidateBills()

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

        const compliantBillsOnly = store.billCart.filter((bill) => {
            const { Compliance, CreatedDate, EC_RefPiece, date_facture, job_id, Marq, ...error } = store.items.filter((item) => item.entete.EC_RefPiece === bill)[0].error[0]
            console.log(error)
            return Object.values(error).every((val) => { console.log(val); return val == "1" })
        })

        console.log(compliantBillsOnly)

        mutateValidateBills({ json: { year: store.periode[0], month: store.periode[1], bills: compliantBillsOnly } }, {
            onSuccess: (results) => {
                store.clear()
                store.setItems(results.results)
                store.setFilter({ ...store.filter, status: EStatus.ALL })
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
                        <DialogTitle>Validation des écritures conformes</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Seul les écritures qui ayant des problèmes de conformité seront traités.</DialogDescription>
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
