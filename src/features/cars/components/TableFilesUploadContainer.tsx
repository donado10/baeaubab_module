import React, { useContext, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileUploadContext } from "./context/file-upload";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { carSchema } from "../schema";
import z from "zod";
import { hashString } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DotsIcon from "@/assets/dots.svg";
import Image from "next/image";
import { DropdownMenuAction } from "./DropdownMenu";

const TableFilesUploadContainer = ({
  form,
}: {
  form: UseFormReturn<z.infer<typeof carSchema>>;
}) => {
  const fileUploadCtx = useContext(FileUploadContext);

  useEffect(() => {
    if (fileUploadCtx.files) {
      form.setValue("car_addons.documents", [...fileUploadCtx.files]);
    }
  }, [JSON.stringify(fileUploadCtx.files)]);

  return (
    <Table className="w-full rounded-md  overflow-hidden">
      <TableCaption>Liste de documents à charger.</TableCaption>
      <TableHeader className="bg-[#E2ECF6]">
        <TableRow>
          <TableHead className=" ">Nom fichier</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fileUploadCtx.files &&
          fileUploadCtx.files.map((file, i) => (
            <TableRow key={file.file.name + i}>
              <TableCell className="font-medium">{file.file.name}</TableCell>
              <TableCell>
                {
                  <>
                    <Input
                      defaultValue={file.nom}
                      onChange={(e) => {
                        fileUploadCtx.updateFile!(file.file.name, {
                          file: file.file,
                          hashname: hashString(e.currentTarget.value),
                          nom: e.currentTarget.value,
                        });
                      }}
                      type="text"
                      className="bg-transparent h-4 shadow-none border-none"
                    />
                  </>
                }
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenuAction filename={file.file.name}>
                  <Button variant={"ghost"} type="button">
                    <Image src={DotsIcon} alt="" width={16} height={16} />{" "}
                  </Button>
                </DropdownMenuAction>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default TableFilesUploadContainer;
