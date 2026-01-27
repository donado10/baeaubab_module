import { ColumnDef } from "@tanstack/react-table";

import { IMissionTableInfo } from "./interface";
import { cn, MStatus, MStatusMission } from "@/lib/utils";
import DotsIcon from "@/assets/dots.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DropdownMenuTable } from "../DropdownMenuTable";

export const StatusDisplay = ({ value }: { value: string }) => {
  const MStatusDisplay = new Map<string, string>([
    ["terminees", "bg-green-600"],
    ["echouees", "bg-red-600"],
    ["en_cours", "bg-[#FF8D28]"],
    ["créer", "bg-[#FFCC00]"],
  ]);


  return (
    <>
      <div
        className={cn(
          "capitalize rounded-4xl w-fit text-white font-semibold py-2 px-3",
          MStatusDisplay.get(value)
        )}
      >
        {MStatusMission.get(value)}
      </div>
    </>
  );
};

export const columns: ColumnDef<IMissionTableInfo>[] = [
  {
    accessorKey: "miss_intitule",
    header: "Intitule",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("miss_intitule")}</div>
    ),
  },
  {
    accessorKey: "miss_client",
    header: "Client",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("miss_client")}</div>
    ),
  },
  {
    accessorKey: "miss_horaire",
    header: "Horaire",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("miss_horaire")} </div>
    ),
  },
  {
    accessorKey: "miss_trajetzone",
    header: "Trajet/Zone",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("miss_trajetzone")}</div>
    ),
  },
  {
    accessorKey: "miss_budget",
    header: "Budget",
    cell: ({ row }) => {
      return (
        <div>
          {row.getValue("miss_budget")}
        </div>
      )
    },
  },
  {
    accessorKey: "miss_status",
    header: "Status",
    cell: ({ row }) => {

      return (
        <>
          <StatusDisplay value={row.getValue("miss_status")} />
        </>
      )
    },
  },
  {
    header: "Action",
    cell: ({ row }) => (
      <DropdownMenuTable status={row.original.miss_status} mission={row.original.miss_no}>
        <Button variant={"ghost"} type="button">
          <Image src={DotsIcon} alt="" width={16} height={16} />{" "}
        </Button>
      </DropdownMenuTable>
    ),
  },
];
