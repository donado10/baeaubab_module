"use client";

import { DataTable as SharedDataTable } from "@/components/data-display/data-table";
import { columns } from "./columns";
import { IEntrepriseBonLivraison } from "../../interface";

/**
 * Feature-specific table: wires the bonLivraison columns into the
 * shared generic DataTable. For a new feature, copy this file and
 * swap in your own columns + row type.
 */
export function DataTable({ data }: { data: IEntrepriseBonLivraison[] }) {
  return <SharedDataTable data={data} columns={columns} />;
}
