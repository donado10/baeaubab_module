"use client";

import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { ecritureSchema } from "../../schema";
import { cn, formatNumberToFrenchStandard } from "@/lib/utils";
import TrierIcon from "@/assets/trier.svg";
import DotsIcon from "@/assets/dots.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useEcritureEnteteLigneStore } from "../../store/store";
import { useEffect } from "react";
import { GoDotFill } from "react-icons/go";
import { DropdownMenuTable } from "../DropdownMenuTable";

type IEcritureRow = z.infer<typeof ecritureSchema>;

const EC_ValideDisplay = ({ value }: { value: number }) => {
    const MStatusClass = new Map<number, string>([
        [1, "bg-green-600/20 border-2 border-green-600"],
        [0, "bg-[#FF8D28]/20 border-2 border-[#FF8D28]"],
    ]);
    const MStatusColor = new Map<number, string>([
        [1, "#00a63e"],
        [0, "#FF8D28"],
    ]);
    const MStatusTextClass = new Map<number, string>([
        [1, "text-green-600"],
        [0, "text-[#FF8D28]"],
    ]);
    const MStatusText = new Map<number, string>([
        [1, "Déversé"],
        [0, "Non Déversé"],
    ]);

    return (
        <div
            className={cn(
                "capitalize rounded-md w-fit font-semibold flex items-center gap-2 px-2",
                MStatusClass.get(value)
            )}
        >
            <span><GoDotFill color={MStatusColor.get(value)} /></span>
            <h1 className={cn(MStatusTextClass.get(value))}>
                {MStatusText.get(value) ?? value}
            </h1>
        </div>
    );
};

export const columns: ColumnDef<IEcritureRow>[] = [
    {
        id: "select",
        header: ({ table }) => {
            const store = useEcritureEnteteLigneStore();

            useEffect(() => {
                table.toggleAllRowsSelected(false);
                store.setRemoveAllBillCart();
            }, [JSON.stringify(store.filter?.status), JSON.stringify(store.items)]);

            return (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => {
                        table.toggleAllRowsSelected(!!value);
                        if (!!value) {
                            store.setAddAllBillCart(
                                table.getCoreRowModel().rows.map(
                                    (row) => row.original.entete.EC_RefPiece
                                )
                            );
                        } else {
                            store.setRemoveAllBillCart();
                        }
                    }}
                    aria-label="Sélectionner tout"
                />
            );
        },
        cell: ({ row }) => {
            const store = useEcritureEnteteLigneStore();

            return (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => {
                        row.toggleSelected(!!value);
                        if (!!value) {
                            store.setAddBillCart(row.original.entete.EC_RefPiece);
                        } else {
                            store.setRemoveBillCart(row.original.entete.EC_RefPiece);
                        }
                    }}
                    aria-label="Sélectionner la ligne"
                />
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: "JO_Num",
        accessorFn: (row) => row.entete.JO_Num,
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="p-0 flex items-center justify-between w-full hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <span>Journal</span>
                <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
            </Button>
        ),
        cell: ({ row }) => <div>{row.original.entete.JO_Num}</div>,
    },
    {
        id: "JM_Date",
        accessorFn: (row) => row.entete.JM_Date,
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="p-0 flex items-center justify-between w-full hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <span>Date</span>
                <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
            </Button>
        ),
        cell: ({ row }) => <div>{row.original.entete.JM_Date}</div>,
    },
    {
        id: "EC_RefPiece",
        accessorFn: (row) => row.entete.EC_RefPiece,
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="p-0 flex items-center justify-between w-full hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <span>Référence</span>
                <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
            </Button>
        ),
        cell: ({ row }) => <div>{row.original.entete.EC_RefPiece}</div>,
    },
    {
        id: "CT_Num",
        accessorFn: (row) => row.entete.CT_Num,
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="p-0 flex items-center justify-between w-full hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <span>Compte Tiers</span>
                <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
            </Button>
        ),
        cell: ({ row }) => <div>{row.original.entete.CT_Num}</div>,
    },
    {
        id: "EC_Montant",
        accessorFn: (row) => row.entete.EC_Montant,
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="p-0 flex items-center justify-between w-full hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <span>Montant</span>
                <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
            </Button>
        ),
        cell: ({ row }) => (
            <div>{formatNumberToFrenchStandard(Number(row.original.entete.EC_Montant))}</div>
        ),
    },
    {
        id: "EC_Valide",
        accessorFn: (row) => row.entete.EC_Valide,
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="p-0 flex items-center justify-between w-full hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <span>Statut</span>
                <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
            </Button>
        ),
        cell: ({ row }) => (
            <EC_ValideDisplay value={Number(row.original.entete.EC_Valide)} />
        ),
    },
    {
        header: "Action",
        cell: ({ row }) => (
            <DropdownMenuTable ref_piece={row.original.entete.EC_RefPiece}>
                <Button variant="ghost" type="button">
                    <Image src={DotsIcon} alt="" width={16} height={16} />
                </Button>
            </DropdownMenuTable>
        ),
    },
];
