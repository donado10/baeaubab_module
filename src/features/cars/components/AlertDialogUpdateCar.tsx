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
import { UpdateCarContainer } from "./UpdateCarSection";

export function AlertDialogUpdateCar({ open, onOpen, car }: { car: string; open: boolean, onOpen: (value: boolean) => void }) {



    return (
        <AlertDialog open={open} >
            <AlertDialogContent className="h-2/3 w-[10060px]  ">
                <AlertDialogHeader>
                    <AlertDialogTitle>Modifier Voiture</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="overflow-y-scroll">

                    <UpdateCarContainer onClose={() => onOpen(false)} car_no={car} />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpen(false)}>Fermer</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
