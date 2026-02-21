import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IEcritureLigne } from "../../interface";

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
            <TableCaption>Détail écritures</TableCaption>
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
                        <TableCell className="font-medium ">{detail.JM_Date}</TableCell>
                        <TableCell className="font-medium">{detail.CG_Num}</TableCell>
                        <TableCell className="font-medium">{detail.CT_Num}</TableCell>
                        <TableCell>{detail.EC_Intitule}</TableCell>
                        <TableCell>{detail.EC_Sens === 0 ? detail.EC_Montant : 0}</TableCell>
                        <TableCell>{detail.EC_Sens === 1 ? detail.EC_Montant : 0}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
