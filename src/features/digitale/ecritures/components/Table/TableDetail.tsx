import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IEcritureLigne } from "../../interface";
import { convertDate } from "@/lib/utils";

export interface IDetails {
    piece: string;
    cg_num: string;
    tiers: string;
    jm_date: string;
    intitule: string;
    debit: number;
    credit: number;
}

export function EcrituresTableDetails({ details }: { details: IEcritureLigne[] }) {
    console.log(details)
    return (
        <Table >
            <TableHeader>
                <TableRow className="border-b border-[#101010]">
                    <TableHead className="w-[100px]">Date journal</TableHead>
                    <TableHead>Compte Général</TableHead>
                    <TableHead>Tiers</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Débit</TableHead>
                    <TableHead>Crédit</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {details.map((detail, index) => (
                    <TableRow key={index} className="text-xs border-b border-[#101010]">
                        <TableCell className="font-medium ">{convertDate(detail.JM_Date)}</TableCell>
                        <TableCell className="font-medium">{detail.CG_Num}</TableCell>
                        <TableCell className="font-medium">{detail.CT_Num}</TableCell>
                        <TableCell>{detail.EC_Intitule}</TableCell>
                        <TableCell>{detail.EC_Sens === 0 ? detail.EC_Montant : 0}</TableCell>
                        <TableCell>{detail.EC_Sens === 1 ? detail.EC_Montant : 0}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={4}>Total</TableCell>
                    <TableCell className="text-left">{details.filter((detail) => detail.EC_Sens === 0).reduce((total, next) => { return total + Number(next.EC_Montant) }, 0)}</TableCell>
                    <TableCell className="text-left">{details.filter((detail) => detail.EC_Sens === 1).reduce((total, next) => { return total + Number(next.EC_Montant) }, 0)}</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    );
}
