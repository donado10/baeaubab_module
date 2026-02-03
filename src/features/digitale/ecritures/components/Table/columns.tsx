import { ColumnDef } from "@tanstack/react-table";

import { IEcritureEntete, IEcritureEnteteLigne } from "../../interface";
import { cn, MStatus } from "@/lib/utils";
import DotsIcon from "@/assets/dots.svg";
import TrierIcon from "@/assets/trier.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DropdownMenuTable } from "../DropdownMenuTable";
import { Checkbox } from "@/components/ui/checkbox";

const StatusDisplay = ({ value }: { value: string }) => {
  const MStatusDisplay = new Map<string, string>([
    ["disponible", "bg-green-600"],
    ["non_conforme", "bg-red-600"],
    ["indisponible", "bg-[#FF8D28]"],
  ]);

  return (
    <>
      <div
        className={cn(
          "capitalize rounded-4xl w-fit text-white font-semibold py-2 px-3",
          MStatusDisplay.get(value)
        )}
      >
        {MStatus.get(value)}
      </div>
    </>
  );
};

export const columns: ColumnDef<IEcritureEntete>[] = [
  {
    id: "select",
    header: ({ table }) => {
      // console.log(table.getRowModel().rows);
      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllRowsSelected(!!value);
          }}
          aria-label="Select all"
        />
      );
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          row.toggleSelected(!!value);
        }}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "JO_Num",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full"
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
          className="p-0 flex items-center justify-between w-full"
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
      <div className="capitalize">{row.getValue("JM_Date")}</div>
    ),
  },
  {
    accessorKey: "EC_RefPiece",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full"
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
          className="p-0 flex items-center justify-between w-full"
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
          className="p-0 flex items-center justify-between w-full"
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
    accessorKey: "Status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full"
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
        <div className="capitalize">{row.getValue("Status")}</div>
      </>
    ),
  },
  {
    header: "Action",
    cell: ({ row }) => (
      <DropdownMenuTable driver={''}>
        <Button variant={"ghost"} type="button">
          <Image src={DotsIcon} alt="" width={16} height={16} />{" "}
        </Button>
      </DropdownMenuTable>
    ),
  },
];
