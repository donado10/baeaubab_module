import { ColumnDef } from "@tanstack/react-table";

import { IEcritureEntete, IEcritureEnteteLigne } from "../../interface";
import { cn, convertDate, MStatus } from "@/lib/utils";
import DotsIcon from "@/assets/dots.svg";
import TrierIcon from "@/assets/trier.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DropdownMenuTable } from "../DropdownMenuTable";
import { Checkbox } from "@/components/ui/checkbox";
import { useEcritureEnteteLigneStore } from "../../store/store";
import { useEffect } from "react";
import { GoDotFill } from "react-icons/go";
import { DialogTableDetail } from "../DialogTableDetail";
import { HoverCardError } from "../HoverCard";


const StatusDisplay = ({ value, refpiece }: { value: string, refpiece: string }) => {
  const MStatusDisplay = new Map<string, string>([
    ["0", "bg-gray-600/20 border-2 border-gray-600 "],
    ["1", "bg-red-600/20 border-2 border-red-600 "],
    ["2", "bg-green-600/20 border-2 border-green-600 "],
    ["3", "bg-[#FF8D28]"],
  ]);
  const MStatusDisplayColor = new Map<string, string>([
    ["0", "#4a5565 "],
    ["1", "#e7000b"],
    ["2", "#00a63e"],
    ["3", "bg-[#FF8D28]"],
  ]);
  const MStatusDisplayTextColor = new Map<string, string>([
    ["0", "text-gray-600"],
    ["1", "text-red-600"],
    ["2", "text-green-600"],
    ["3", "bg-[#FF8D28]"],
  ]);
  const MStatusText = new Map<string, string>([
    ["0", "Attente"],
    ["1", "Invalide"],
    ["2", "Valide"],
    ["3", "Intégré"],
  ]);

  return (
    <HoverCardError status={value.toString()} refpiece={refpiece}>
      <div
        className={cn(
          "capitalize rounded-md w-3/4  font-semibold flex items-center gap-2 px-2 ",
          MStatusDisplay.get(value.toString())
        )}
      >
        <span><GoDotFill color={MStatusDisplayColor.get(value.toString())} /></span>
        <h1 className={cn(MStatusDisplayTextColor.get(value.toString()))}>

          {MStatusText.get(value.toString())}
        </h1>
      </div>
    </HoverCardError>
  );
};

export const columns: ColumnDef<IEcritureEntete>[] = [
  {
    id: "select",
    header: ({ table }) => {
      // console.log(table.getRowModel().rows);
      const store = useEcritureEnteteLigneStore()

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
              store.setAddAllBillCart(table.getCoreRowModel().rows.map((row) => row.original.EC_RefPiece))
            } else {
              store.setRemoveAllBillCart()
            }
          }}
          aria-label="Select all"
        />
      );
    },
    cell: ({ row }) => {

      const store = useEcritureEnteteLigneStore()

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            if (!!value) {
              store.setAddBillCart(row.original.EC_RefPiece)
            } else {
              store.setRemoveBillCart(row.original.EC_RefPiece)

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
    accessorKey: "JO_Num",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Journal
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },

    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("JO_Num")}</div>
    ),
  },
  {
    accessorKey: "JM_Date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Date Journal
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{convertDate(row.getValue("JM_Date"))}</div>
    ),
  },
  {
    accessorKey: "EC_RefPiece",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Facture
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("EC_RefPiece")}</div>
    ),
  },
  {
    accessorKey: "CT_Num",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Compte Tiers
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("CT_Num")}</div>
    ),
  },
  {
    accessorKey: "EC_Montant",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Montant
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <>
        <div className="capitalize">{row.getValue("EC_Montant")}</div>
      </>
    ),
  },
  {
    accessorKey: "Montant_reel",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Montant Réel
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <>
        <div className="capitalize">{row.getValue("Montant_reel")}</div>
      </>
    ),
  },
  {
    accessorKey: "Status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Status
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <>
        <div className="capitalize"><StatusDisplay value={row.getValue("Status")} refpiece={row.original.EC_RefPiece} /></div>
      </>
    ),
  },
  {
    header: "Action",
    cell: ({ row }) => (
      <DropdownMenuTable refpiece={row.original.EC_RefPiece}>


        <Button variant={"ghost"} type="button">
          <Image src={DotsIcon} alt="" width={16} height={16} />{" "}
        </Button>
      </DropdownMenuTable>
    ),
  },
];
