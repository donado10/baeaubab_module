"use client";

import { DataTable as SharedDataTable } from "@/features/digitale/_shared/components/DataTable";
import { columns } from "./columns";
import { IEntrepriseFacture } from "../../interface";

/**
 * Feature-specific table: wires the bills columns into the
 * shared generic DataTable.
 */
export function DataTable({ data }: { data: IEntrepriseFacture[] }) {
  return <SharedDataTable data={data} columns={columns} />;
}
