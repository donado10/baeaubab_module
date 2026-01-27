"use client";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import Image from "next/image";
import { createContext, ReactNode, useContext, useState } from "react";
import { Button } from "../../../components/ui/button";
import FileImportLogo from "@/assets/import_files.svg";
import { FileUploadContext } from "@/features/cars/components/context/file-upload";

const FilesUploadExemple = () => {
  const [files, setFiles] = useState<File[] | undefined>();
  const handleDrop = (files: File[]) => {
    setFiles(files);
  };
  return (
    <Dropzone
      maxFiles={3}
      onDrop={handleDrop}
      onError={console.error}
      src={files}
    >
      <DropzoneEmptyState />
      <DropzoneContent />
    </Dropzone>
  );
};

export const FilesUploadContainer = () => {
  const fileUploadCtx = useContext(FileUploadContext);
  return (
    <>
      <FileUpload
        files={fileUploadCtx.files?.map((file) => file.file)}
        addFiles={fileUploadCtx.addFiles!}
      />
    </>
  );
};

const FileUpload = ({
  files,
  addFiles,
}: {
  files: File[] | undefined;
  addFiles: (
    file: { file: File; hashname: string; nom: string }[] | undefined
  ) => void;
}) => {
  const handleDrop = (files: File[]) => {
    addFiles(files.map((file) => ({ file: file, nom: "", hashname: "" })));
  };
  return (
    <Button
      type="button"
      variant={"outline"}
      asChild
      className="flex items-center justify-between flex-row p-2 w-fit gap-4"
    >
      <Dropzone
        maxFiles={1000}
        onDrop={handleDrop}
        onError={console.error}
        src={files}
        className="p-2 px-4"
      >
        <div>
          <Image src={FileImportLogo} alt="" />
        </div>
        <span className="text-primary font-semibold">
          Téléverser un document
        </span>
      </Dropzone>
    </Button>
  );
};
