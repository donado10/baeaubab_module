import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ReactNode, useState } from "react"
import LinkCarDriverContainer from "./LinkCarDriver"


export const DialogAddDriverCar = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState<boolean | undefined>(undefined)
    return <Dialog open={open} onOpenChange={() => setOpen(undefined)}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Ajouter une voiture</DialogTitle>
                <DialogDescription>
                    Section pour rattacher une voiture au chauffeur
                </DialogDescription>
            </DialogHeader>
            <LinkCarDriverContainer onDialogClose={() => setOpen(false)} />
        </DialogContent>
    </Dialog>
}