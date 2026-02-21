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
import { useLoadEcrituresFromDigital, useLoadEcrituresFromSage } from "../api/use-load-ecritures"
import { useEcritureEnteteLigneStore } from "../store/store"
import JobWatcher from "./JobWatcher"

export function DialogLoadEcrituresWithCheck({ open, onOpen }: { open: boolean, onOpen: (value: boolean) => void }) {

    const [withChecking, setWithChecking] = useState(false)


    const store = useEcritureEnteteLigneStore()

    const { mutate: mutateFromSage } = useLoadEcrituresFromSage()
    const { mutate: mutateFromDigital } = useLoadEcrituresFromDigital()

    const submitHandler = () => {

        if (store.sourceEc === 'sage') {


            mutateFromSage({ json: { year: store.periode[0], month: store.periode[1] } }, {
                onSuccess: (results) => {
                    store.setItems(results.results)
                }
            })
        }
        if (store.sourceEc === 'digital') {


            mutateFromDigital({ json: { year: store.periode[0], month: store.periode[1] } }, {
                onSuccess: (results) => {
                    store.setItems(results.results)
                }
            })
        }
        onOpen(false)

    }

    return (
        <Dialog open={open} onOpenChange={() => onOpen(false)}>
            <form >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="mb-4">
                        <DialogTitle>Chargement des écritures comptables</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        La vérification est terminée. Voulez vous charger les factures ?
                    </DialogDescription>

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
