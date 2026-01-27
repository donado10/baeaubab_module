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
import CreateMissionSection from "./CreateMissionSection";
import { UpdateMissionContainer } from "./UpdateMissionSection";

export function AlertDialogUpdateMission({ open, onOpen, mission }: { mission: string; open: boolean, onOpen: (value: boolean) => void }) {



    return (
        <AlertDialog open={open} >
            <AlertDialogContent className="h-2/3  ">
                <AlertDialogHeader>
                    <AlertDialogTitle>Modifier mission</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="overflow-y-scroll">

                    <UpdateMissionContainer onClose={() => onOpen(false)} miss_no={mission} />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpen(false)}>Fermer</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
