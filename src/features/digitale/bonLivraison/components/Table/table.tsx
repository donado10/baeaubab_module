"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatNumberToFrenchStandard } from "@/lib/utils";
import { usePathname } from "next/navigation";

import { columns } from "./columns";
import { IEcritureEntete } from "../../interface";
import { Card } from "@/components/ui/card";
import { DialogTableDetail } from "../DialogTableDetail";
import { useEcritureEnteteLigneStore } from "../../store/store";

export function DataTable({ data }: { data: IEcritureEntete[] }) {

  const store = useEcritureEnteteLigneStore()

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center">
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colonnes <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
      <div className="overflow-hidden rounded-md  ">
        <Card className=" border-none ">
          <Table className=" w-full  ">
            <TableHeader className="bg-gray-200 ">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className=" "
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="  "
                  >
                    {row.getVisibleCells().map((cell, i, arr) => (
                      <TableCell
                        key={cell.id}
                        className={""}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Aucun résultats.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

        </Card>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm flex flex-col gap-2">
          <span className="text-xs font-normal text-black">
            Total factures: <span className="font-bold"> {formatNumberToFrenchStandard(table.getFilteredRowModel().rows.length)}</span>
          </span>
          <span className="text-xs font-normal text-black">
            Montant total TTC: <span className="font-bold">{formatNumberToFrenchStandard(store.items.filter((bill) => store.billCart.includes(bill.entete.EC_RefPiece)).reduce((prev, next) => { return Number(next.entete.EC_Montant) + prev }, 0))}</span>
          </span>
          <span className="text-xs font-normal text-black">
            Montant total TVA: <span className="font-bold">{formatNumberToFrenchStandard(store.items.filter((bill) => store.billCart.includes(bill.entete.EC_RefPiece)).reduce((prev, next) => {
              const format = next.ligne.filter((l) => l.EC_Sens === 1 && l.CG_Num[0] === '4').map((l) => l.EC_Montant).reduce((p, n) => { return Number(n) + p }, 0)

              return Number(format) + prev
            }, 0))}</span>
          </span>
          <span className="text-xs font-normal text-black">
            Montant total HT: <span className="font-bold">{formatNumberToFrenchStandard(store.items.filter((bill) => store.billCart.includes(bill.entete.EC_RefPiece)).reduce((prev, next) => {
              const format = next.ligne.filter((l) => l.CG_Num[0] === '7').map((l) => l.EC_Montant).reduce((p, n) => { return Number(n) + p }, 0)

              return Number(format) + prev
            }, 0))}</span>
          </span>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
