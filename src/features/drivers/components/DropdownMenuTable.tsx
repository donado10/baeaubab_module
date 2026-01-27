"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode, useContext, useState } from "react";
import { FileUploadContext } from "./context/file-upload";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AlertDialogDeleteDriver } from "./DialogDeleteDriver";
import { AlertDialogUpdateDriver } from "./DialogUpdateDriver";




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


          <DropdownMenuItem className="text-blue-600" onClick={() => setOpenDialogUpdate(true)}>
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600" onClick={() => setOpenDialogDelete(true)}>
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogDeleteDriver driver={driver} open={openDialogDelete} onOpen={(value: boolean) => { setOpenDialogDelete(value) }} />
      <AlertDialogUpdateDriver driver={driver} open={openDialogUpdate} onOpen={(value: boolean) => { setOpenDialogUpdate(value) }} />

    </>
  );
}
