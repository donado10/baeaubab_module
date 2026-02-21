import { Button } from "@/components/ui/button"
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
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReactNode, useEffect, useState } from "react"
import { EcrituresTableDetails } from "./Table/TableDetail"
import { useEcritureEnteteLigneStore } from "../store/store"

const EcrituresTableDetailContainer = ({ refpiece }: { refpiece: string }) => {
    const store = useEcritureEnteteLigneStore()

    const details = store.items.filter((item) => item.entete.EC_RefPiece === refpiece).map((val) => val.ligne)


    return <>{details.length > 0 && <EcrituresTableDetails details={details[0]} />}</>
}

export function DialogTableDetail({ open, setOpen, refpiece }: { refpiece: string, open: boolean, setOpen: (value: boolean) => void }) {
    const [openDialog, setOpenDialog] = useState(open)

    useEffect(() => {
        console.log(open)
        setOpenDialog(open)
    }, [open])

    return (
        <Dialog open={openDialog} onOpenChange={() => { setOpen(false); setOpenDialog(false) }} >
            <DialogContent className=" max-w-4xl!  ">
                <DialogHeader>
                    <DialogTitle>{refpiece}</DialogTitle>
                </DialogHeader>

                <EcrituresTableDetailContainer refpiece={refpiece} />
            </DialogContent>
        </Dialog>
    )
}
