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
import { Separator } from "@/components/ui/separator"
import useGetErrorBill from "../api/use-get-error-bill"
import { IEcritureError } from "../interface"
import { RiErrorWarningLine } from "react-icons/ri";
import { EcrituresTableCorrectionDetails } from "./Table/TableCorrectionDetail"


const EcrituresTableCorrectionDetailContainer = ({ refpiece }: { refpiece: string }) => {
    const store = useEcritureEnteteLigneStore()


    const details = store.items.filter((item) => item.entete.EC_RefPiece === refpiece).map((val) => val.ligne)


    return <>{details.length > 0 && <EcrituresTableCorrectionDetails details={details[0]} />}</>
}

export const ErrorEcrituresContainer = ({ refpiece }: { refpiece: string }) => {

    const store = useEcritureEnteteLigneStore()

    const error = store.items.filter((item) => item.entete.EC_RefPiece === refpiece).map((item) => item.error)[0]




    return <><ErrorEcritures list={error?.at(0) ?? undefined} /></>
}
const ErrorText = ({ value }: { value: string }) => {
    return <li className="flex items-center gap-2"><RiErrorWarningLine width={16} height={16} color="red" />
        <h1 className="text-red-600 text-xs font-bold">{value}</h1></li>
}
const ErrorEcritures = ({ list }: { list: IEcritureError | undefined }) => {

    if (!list) {

        return <></>
    }
    return <ul className="flex flex-col gap-4">
        {!list.Compliance && <ErrorText value="Le montant TTC de la facture ne correspond pas au TTC de l'écriture." />}
        {!list.Balanced && <ErrorText value="La facture n'est pas équilibrée." />}
        {!list.CG_Num && <ErrorText value="Le compte général est invalide pour l'une des écritures." />}
        {!list.EC_Montant && <ErrorText value="Le montant est invalide." />}
        {!list.CT_Num && <ErrorText value="Le compte tiers est invalide." />}
        {!list.EC_Date && <ErrorText value="La date d'écriture est invalide." />}
        {!list.EC_Intitule && <ErrorText value="L'intitulé est invalide." />}
        {!list.EC_Jour && <ErrorText value="Le jour de l'écriture est invalide." />}
        {!list.EC_Piece && <ErrorText value="La piece est invalide." />}
        {!list.EC_Sens && <ErrorText value="Le sens de l'écriture est invalide. Vérifiez le compte général." />}
        {!list.JM_Date && <ErrorText value="La date du journal est invalide." />}
    </ul>

}



export function DialogCorrectionTableDetail({ open, setOpen, refpiece }: { refpiece: string, open: boolean, setOpen: (value: boolean) => void }) {
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

                <EcrituresTableCorrectionDetailContainer refpiece={refpiece} />
                <Separator />
                {<ErrorEcrituresContainer refpiece={refpiece} />}
            </DialogContent>
        </Dialog>
    )
}
