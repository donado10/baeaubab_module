import { ColumnDef } from "@tanstack/react-table";

import { ICarTableInfo } from "./interface";
import { cn, MStatus, MStatusCar } from "@/lib/utils";
import DotsIcon from "@/assets/dots.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DropdownMenuTable } from "../DropdownMenuTable";
import TrierIcon from "@/assets/trier.svg";


const StatusDisplay = ({ value }: { value: string }) => {
  const MStatusDisplay = new Map<string, string>([
    ["disponible", "bg-green-600"],
    ["en_mission", "bg-[#FF8D28]"],
    ["indisponible", "bg-red-600"],
  ]);

  return (
    <>
      <div
        className={cn(
          "capitalize rounded-4xl w-fit text-white font-semibold   py-2 px-3",
          MStatusDisplay.get(value)
        )}
      >
        {MStatusCar.get(value)}
      </div>
    </>
  );
};

export const columns: ColumnDef<ICarTableInfo>[] = [
  {
    accessorKey: "car_matricule",
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
      <div className="capitalize">{row.getValue("car_matricule")}</div>
    ),
  },
  {
    accessorKey: "car_modele",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Modele
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("car_modele")}</div>
    ),
  },
  {
    accessorKey: "car_fullname",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Chauffeur assigné
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("car_fullname") ?? 'N/A'}</div>
    ),
  },
  {
    accessorKey: "car_mileage",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 flex items-center justify-between w-full"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>

            Kilométrage
          </span>
          <span><Image src={TrierIcon} alt="" width={16} height={16} /></span>
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("car_mileage")} KM</div>
    ),
  },
  {
    accessorKey: "car_status",
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
        <StatusDisplay value={row.getValue("car_status")} />
      </>
    ),
  },
  {
    header: "Action",
    cell: ({ row }) => (
      <DropdownMenuTable car={row.original.car_no}>
        <Button variant={"ghost"} type="button">
          <Image src={DotsIcon} alt="" width={16} height={16} />{" "}
        </Button>
      </DropdownMenuTable>
    ),
  },
];
