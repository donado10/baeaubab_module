import { ColumnDef } from "@tanstack/react-table";

import { cn, formatDate, formatNumberToFrenchStandard } from "@/lib/utils";
import TrierIcon from "@/assets/trier.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useEntrepriseDetailStore } from "../../store/entreprise-store";
import { useEffect } from "react";
import { GoDotFill } from "react-icons/go";
import { IDocumentFacture } from "@/features/digitale/bills/interface";


const StatusDisplay = ({ value }: { value: string }) => {
  const MStatusDisplay = new Map<string, string>([
    ["1", "bg-green-600/20 border-2 border-green-600 "],
    ["2", "bg-[#FF8D28]/20  border-2 border-[#FF8D28]"],
  ]);
  const MStatusDisplayColor = new Map<string, string>([
    ["1", "#00a63e"],
    ["2", "#FF8D28"],
  ]);
  const MStatusDisplayTextColor = new Map<string, string>([
    ["1", "text-green-600"],
    ["2", "text-[#FF8D28]"],
  ]);
  const MStatusText = new Map<string, string>([
    ["1", "Taxable"],
    ["2", "Exonoré"],
  ]);

  return (
    <>
      {value && <div
        className={cn(
          "capitalize rounded-md w-3/4  font-semibold flex items-center gap-2 px-2 ",
          MStatusDisplay.get(value.toString())
        )}
      >
        <span><GoDotFill color={MStatusDisplayColor.get(value.toString())} /></span>
        <h1 className={cn(MStatusDisplayTextColor.get(value.toString()))}>
          {MStatusText.get(value.toString())}
        </h1>
      </div>}
    </>
  );
};


export const columns: ColumnDef<IDocumentFacture>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const store = useEntrepriseDetailStore()

      useEffect(() => {
        table.toggleAllRowsSelected(false)
        store.setRemoveAllBillCart()
      }, [JSON.stringify(store.documents)])

      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllRowsSelected(!!value);
            if (!!value) {
              store.setAddAllBillCart(table.getCoreRowModel().rows.map((row) => row.original.entete.DO_No))
            } else {
              store.setRemoveAllBillCart()
            }
          }}
          aria-label="Select all"
        />
      );
    },
    cell: ({ row }) => {
      const store = useEntrepriseDetailStore()

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            if (!!value) {
              store.setAddBillCart(row.original.entete.DO_No)
            } else {
              store.setRemoveBillCart(row.original.entete.DO_No)
            }
          }}
          aria-label="Select row"
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "entete.DO_No",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Numéro</span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.original.entete.DO_No}</div>
    ),
  },
  {
    accessorKey: "entete.CT_Intitule",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>
            Intitulé
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => {

      return (
        <div className="capitalize">{row.original.entete.CT_Intitule}</div>
      )

    },
  },
  {
    accessorKey: "lignes",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Bon de livraison</span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.original.lignes.length}</div>
    ),
  },
  {
    accessorKey: "entete.DO_Date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Date Facture</span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{formatDate(row.original.entete.DO_Date)}</div>
    ),
  },
  {
    accessorKey: "entete.DO_TotalHT",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Total HT</span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{formatNumberToFrenchStandard(row.original.entete.DO_TotalHT)}</div>
    ),
  },
  {
    accessorKey: "entete.DO_TotalTVA",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Total TVA</span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{formatNumberToFrenchStandard(row.original.entete.DO_TotalTVA)}</div>
    ),
  },
  {
    accessorKey: "entete.DO_TotalTTC",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Total TTC</span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{formatNumberToFrenchStandard(row.original.entete.DO_TotalTTC)}</div>
    ),
  },
];
