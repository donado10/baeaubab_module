"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";




export function DropdownMenuTable({
  driver,
  children,
}: {
  driver: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [openDialogDelete, setOpenDialogDelete] = useState(false)
  const [openDialogUpdate, setOpenDialogUpdate] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="start">
          <DropdownMenuItem className="text-blue-600" asChild>
            <Link
              href={{
                pathname: pathname + "/" + driver,
              }}
            >
              Voir
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
