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
import { AlertDialogUpdateMission } from "./AlertDialogUpdateMission";

export function DropdownMenuTable({
  mission,
  status,
  children,
}: {
  status: string
  mission: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [openDialogUpdate, setOpenDialogUpdate] = useState(false)



  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="start">
          <DropdownMenuItem className="text-blue-600" onClick={() => { }} asChild>
            <Link
              href={{
                pathname: pathname + "/" + mission,
              }}
            >
              Voir
            </Link>
          </DropdownMenuItem>
          {status === 'créer' && <DropdownMenuItem className="text-blue-600" onClick={() => setOpenDialogUpdate(true)}>
            Modifier
          </DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogUpdateMission mission={mission} open={openDialogUpdate} onOpen={(value: boolean) => { setOpenDialogUpdate(value) }} />

    </>
  );
}
