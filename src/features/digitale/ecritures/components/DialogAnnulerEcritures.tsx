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
import { EEcritureStatut, useEcritureEnteteLigneStore } from "../store/store"
import JobWatcher from "./JobWatcher"
import { toast } from "sonner"
import useSetValidateBills from "../api/use-set-valid-bills"
import { MdStarBorderPurple500 } from "react-icons/md"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useCancelBills from "../api/use-cancel-bills"
import { useLoadEcrituresFromDigital, useLoadEcrituresFromSage } from "../api/use-load-ecritures"



const SelectJournal = ({ onSetJournal }: { onSetJournal: (value: string) => void }) => {


    return <Select onValueChange={(value) => onSetJournal(value)}>
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Journal" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                <SelectItem key={'VTED'} value={'VTED'}>VTED</SelectItem>
                <SelectItem key={'VTEDC2'} value={'VTEDC2'}>VTEDC2</SelectItem>
                <SelectItem key={'VTEDC3'} value={'VTEDC3'}>VTEDC3</SelectItem>
            </SelectGroup>
        </SelectContent>
    </Select>
}

const SelectDatabase = ({ onSetDatabase }: { onSetDatabase: (value: string) => void }) => {


    return <Select onValueChange={(value) => onSetDatabase(value)}>
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Base de donnée" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                <SelectItem key={'GBAEAUBAB23'} value={'GBAEAUBAB23'}>GBAEAUBAB23</SelectItem>
                <SelectItem key={'F_GBAEAUBAB23'} value={'F_GBAEAUBAB23'}>F_GBAEAUBAB23</SelectItem>
            </SelectGroup>
        </SelectContent>
    </Select>
}

export function DialogAnnulerEcritures({ children }: { children: ReactNode }) {
    const [close, setClose] = useState<boolean | undefined>(undefined)
    const [journal, setJournal] = useState('VTEDC3')
    const [database, setDatabase] = useState('F_GBAEAUBAB23')

    const store = useEcritureEnteteLigneStore()

    const { mutate } = useCancelBills()
    const { mutate: mutateLoadEcrituresFromDigital } = useLoadEcrituresFromDigital()
    const { mutate: mutateLoadEcrituresFromSage } = useLoadEcrituresFromSage()

    const submitHandler = () => {

        mutate({
            json: {
                bills: store.billCart,
                database: database,
                year: store.periode[0],
                month: store.periode[1],
                journal: journal
            },

        }, {
            onSuccess: () => {
                if (store.sourceEc === 'sage') {
                    mutateLoadEcrituresFromSage({ json: { month: store.periode[1], year: store.periode[0] } }, { onSuccess: () => setClose(false) })

                }
                if (store.sourceEc === 'digital') {
                    mutateLoadEcrituresFromDigital({ json: { month: store.periode[1], year: store.periode[0] } }, { onSuccess: () => setClose(false) })

                }



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
                        <DialogTitle>Annulation des écritures</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-between w-full ">
                        <SelectJournal onSetJournal={setJournal} />
                        <SelectDatabase onSetDatabase={setDatabase} />
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
