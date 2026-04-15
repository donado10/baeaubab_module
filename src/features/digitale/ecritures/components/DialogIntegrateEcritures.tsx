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
import { toast } from "sonner"
import useSetValidateBills from "../api/use-set-valid-bills"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useIntegrateBills from "../api/use-integrate-bills"
import { useRouter } from "next/navigation"


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

export function DialogIntegrateEcritures({ children }: { children: ReactNode }) {
    const [close, setClose] = useState<boolean | undefined>(undefined)
    const [journal, setJournal] = useState('VTEDC3')
    const [database, setDatabase] = useState('F_GBAEAUBAB23')
    const router = useRouter();

    const store = useEcritureEnteteLigneStore()

    const { mutate } = useIntegrateBills()

    const submitHandler = () => {
        setClose(false)

        mutate({ json: { database: database, journal: journal, month: store.periode[1], year: store.periode[0] } }, {
            onSuccess: () => {
                toast.success("Job d'intégration lancé")
                store.clear()
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
                        <DialogTitle>Intégration des écritures</DialogTitle>
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
