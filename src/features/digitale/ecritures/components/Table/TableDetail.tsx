import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export interface IDetails {
    piece: string;
    cg_num: string;
    tiers: string;
    jm_date: string;
    intitule: string;
    debit: number;
    credit: number;
}

export function SheetEcrituresTable({ details }: { details: IDetails[] }) {
    return (
        <Table>
            <TableCaption>Détail écritures</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[200px]">Date journal</TableHead>
                    <TableHead className="w-[100px]">Piece</TableHead>
                    <TableHead>Compte Général</TableHead>
                    <TableHead>Tiers</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Débit</TableHead>
                    <TableHead>Crédit</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {details.map((detail, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{detail.jm_date}</TableCell>
                        <TableCell className="font-medium">{detail.piece}</TableCell>
                        <TableCell className="font-medium">{detail.cg_num}</TableCell>
                        <TableCell className="font-medium">{detail.tiers}</TableCell>
                        <TableCell>{detail.intitule}</TableCell>
                        <TableCell>{detail.debit}</TableCell>
                        <TableCell>{detail.credit}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
