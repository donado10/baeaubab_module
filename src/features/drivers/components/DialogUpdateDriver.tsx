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
import CreateDriverSection from "./CreateDriverSection";
import UpdateDriverSection, { UpdateDriverContainer } from "./UpdateDriverSection";

export function AlertDialogUpdateDriver({ open, onOpen, driver }: { driver: string; open: boolean, onOpen: (value: boolean) => void }) {



    return (
        <AlertDialog open={open} >
            <AlertDialogContent className="h-2/3 w-[10060px]  ">
                <AlertDialogHeader>
                    <AlertDialogTitle>Modifier chauffeur</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="overflow-y-scroll">

                    <UpdateDriverContainer onClose={() => onOpen(false)} driver_no={driver} />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpen(false)}>Fermer</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
