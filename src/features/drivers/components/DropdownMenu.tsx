import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode, useContext } from "react";
import { FileUploadContext } from "./context/file-upload";

export function DropdownMenuAction({
  children,
  filename,
}: {
  children: ReactNode;
  filename: string;
}) {
  const fileUploadCtx = useContext(FileUploadContext);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => {
            fileUploadCtx?.removeFile!(filename);
          }}
        >
          Retirer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
