import { ColumnDef } from "@tanstack/react-table";

import { IDriveTableInfo } from "./interface";
import { cn, MStatus } from "@/lib/utils";
import DotsIcon from "@/assets/dots.svg";
import TrierIcon from "@/assets/trier.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DropdownMenuTable } from "../DropdownMenuTable";

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

export const columns: ColumnDef<IDriveTableInfo>[] = [
  {
    accessorKey: "em_fullname",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Nom Complet
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },

    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("em_fullname")}</div>
    ),
  },
  {
    accessorKey: "em_matricule",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Matricule
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("em_matricule")}</div>
    ),
  },
  {
    accessorKey: "em_car",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Véhicule assigné
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("em_car") ?? 'N/A'}</div>
    ),
  },
  {
    accessorKey: "em_lastmission",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Dernière Mission
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("em_lastmission") ?? 'N/A'}</div>
    ),
  },
  {
    accessorKey: "em_status",
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
        <StatusDisplay value={row.getValue("em_status")} />
      </>
    ),
  },
  {
    header: "Action",
    cell: ({ row }) => (
      <DropdownMenuTable driver={row.original.em_no}>
        <Button variant={"ghost"} type="button">
          <Image src={DotsIcon} alt="" width={16} height={16} />{" "}
        </Button>
      </DropdownMenuTable>
    ),
  },
];
