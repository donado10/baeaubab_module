import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ReactNode } from "react"
import useDeleteDriver from "../api/use-delete-driver";

export function AlertDialogDeleteDriver({ open, onOpen, driver }: { driver: string; open: boolean, onOpen: (value: boolean) => void }) {

    const mutate = useDeleteDriver()

    const DeleteDriverHandler = () => {
        mutate({ param: { driverId: driver } }, { onSuccess: () => onOpen(false) })

    }

    return (
        <AlertDialog open={open} >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Voulez vous supprimer ce chauffeur?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpen(false)}>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={DeleteDriverHandler}>Confirmer</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
