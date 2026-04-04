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
import { IDocumentFacture } from "@/features/digitale/bills/interface";
import { convertDate, formatDate } from "@/lib/utils";



export function TableFactureDetail({ details }: { details: IDocumentFacture[] }) {
    return (
        <Table >
            <TableHeader>
                <TableRow className="border-2 border-[#101010]">
                    <TableHead className="w-[100px]">Facture</TableHead>
                    <TableHead>Bon de Livraison</TableHead>
                    <TableHead>Date Facture</TableHead>
                    <TableHead>TotalHT</TableHead>
                    <TableHead>TotalTVA</TableHead>
                    <TableHead>TotalTTC</TableHead>
                    <TableHead>Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {details.map((detail, index) => (
                    <TableRow key={index} className="text-xs border-2 border-[#101010]">
                        <TableCell className="font-medium  ">{detail.entete.DO_No}</TableCell>
                        <TableCell className="font-medium">{detail.lignes.length}</TableCell>
                        <TableCell className="font-medium">{formatDate(detail.entete.DO_Date)}</TableCell>
                        <TableCell>{detail.entete.DO_TotalHT}</TableCell>
                        <TableCell>{detail.entete.DO_TotalTVA}</TableCell>
                        <TableCell>{detail.entete.DO_TotalTTC}</TableCell>
                        <TableCell>{ }</TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    {/* <TableCell colSpan={4}>Total</TableCell>
                    <TableCell className="text-left">{details.filter((detail) => detail.EC_Sens === 0).reduce((total, next) => { return total + Number(next.EC_Montant) }, 0)}</TableCell>
                    <TableCell className="text-left">{details.filter((detail) => detail.EC_Sens === 1).reduce((total, next) => { return total + Number(next.EC_Montant) }, 0)}</TableCell>
                 */}</TableRow>
            </TableFooter>
        </Table>
    );
}
