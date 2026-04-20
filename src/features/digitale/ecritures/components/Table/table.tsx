"use client";

import { DataTable as SharedDataTable } from "@/components/data-display/data-table";
import { columns } from "./columns";
import { z } from "zod";
import { ecritureSchema } from "../../schema";

type IEcritureRow = z.infer<typeof ecritureSchema>;

export function DataTable({ data }: { data: IEcritureRow[] }) {
    return <SharedDataTable data={data} columns={columns} />;
}
