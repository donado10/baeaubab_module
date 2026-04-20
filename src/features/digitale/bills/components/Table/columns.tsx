import { ColumnDef } from "@tanstack/react-table";

import { IEntrepriseFacture } from "../../interface";
import { cn, convertDate, dateToMilliseconds, formatNumberToFrenchStandard, MStatus } from "@/lib/utils";
import DotsIcon from "@/assets/dots.svg";
import TrierIcon from "@/assets/trier.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DropdownMenuTable } from "../DropdownMenuTable";
import { Checkbox } from "@/components/ui/checkbox";
import { useEntrepriseFactureStore } from "../../store/store";
import { useEffect } from "react";
import { GoDotFill } from "react-icons/go";


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


export const columns: ColumnDef<IEntrepriseFacture>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const store = useEntrepriseFactureStore()

      useEffect(() => {
        table.toggleAllRowsSelected(false)
        store.setRemoveAllBillCart()
      }, [JSON.stringify(store.filter?.status), JSON.stringify(store.items)])

      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllRowsSelected(!!value);
            if (!!value) {
              store.setAddAllBillCart(table.getCoreRowModel().rows.map((row) => row.original.DO_Entreprise_Sage))
            } else {
              store.setRemoveAllBillCart()
            }
          }}
          aria-label="Select all"
        />
      );
    },
    cell: ({ row }) => {

      const store = useEntrepriseFactureStore()

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            if (!!value) {
              store.setAddBillCart(row.original.DO_Entreprise_Sage)
            } else {
              store.setRemoveBillCart(row.original.DO_Entreprise_Sage)

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
    accessorKey: "DO_Entreprise_Sage",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>
            ID Entreprise
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => {

      return (
        <div className="capitalize">{row.getValue("DO_Entreprise_Sage")}</div>
      )

    },
  },
  {
    accessorKey: "EN_Intitule",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>
            Intitule
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("EN_Intitule")}</div>
    ),
  },
  {
    accessorKey: "DO_TotalTVA",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>
            TotalTVA
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("DO_TotalTVA")}</div>
    ),
  },
  {
    accessorKey: "DO_TotalHT",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>
            TotalHT
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <>
        <div className="capitalize">{formatNumberToFrenchStandard(Number(row.getValue("DO_TotalHT")))}</div>
      </>
    ),
  },
  {
    accessorKey: "DO_TotalTTC",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>
            TotalTTC
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <>
        <div className="capitalize">{formatNumberToFrenchStandard(Number(row.getValue("DO_TotalTTC")))}</div>
      </>
    ),
  },
  {
    accessorKey: "EN_Valide",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>
            Valide
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <>
        <div className="capitalize">{Number(row.getValue("EN_Valide"))}</div>
      </>
    ),
  },
  {
    header: "Action",
    cell: ({ row }) => (
      <DropdownMenuTable ref_bill={row.original.DO_Entreprise_Sage.toString()} ref_enterprise={row.original.DO_Entreprise_Sage.toString()} >


        <Button variant={"ghost"} type="button">
          <Image src={DotsIcon} alt="" width={16} height={16} />{" "}
        </Button>
      </DropdownMenuTable>
    ),
  },
];
