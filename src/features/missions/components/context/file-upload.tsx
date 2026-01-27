"use client";

import { createContext, ReactNode, useState } from "react";

interface IFileUpload {
  files:
  | { file: File; hashname: string; fileID?: string; nom: string }[]
  | undefined;
  addFiles?: (
    file:
      | { file: File; hashname: string; fileID?: string; nom: string }[]
      | undefined
  ) => void;
  removeFile?: (name: string) => void;
  cleanFileContext?: () => void;
  updateFile?: (
    filename: string,
    file: { file: File; hashname: string; fileID?: string; nom: string }
  ) => void;
}

export const FileUploadContext = createContext<IFileUpload>({ files: [] });

export const FilesUploadProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<
    { file: File; hashname: string; fileID?: string; nom: string }[] | undefined
  >();
  const handleDrop = (filesDrop: File[]) => {
    if (files) {
    }
  };

  return (
    <FileUploadContext.Provider
      value={{
        files: files,
        addFiles: (
          filesDrop:
            | { file: File; hashname: string; fileID?: string; nom: string }[]
            | undefined
        ) => {
          if (filesDrop) {
            if (files) {
              setFiles([...files, ...filesDrop]);
              return;
            }
            setFiles([...filesDrop]);
            return;
          }
        },
        removeFile: (name) => {
          const filter = files?.filter((file) => {
            return name !== file.file.name;
          });

          setFiles(filter ?? []);
        },
        cleanFileContext: () => setFiles(undefined),
        updateFile: (
          filename: string,
          file: { file: File; hashname: string; fileID?: string; nom: string }
        ) => {
          const filter = files?.map((f) => {
            if (f.file.name === filename) {
              f.nom = file.nom;
              f.hashname = file.hashname;
              return f;
            }
            return f;
          });
          if (filter) {
            setFiles([...filter]);

          }
        },
      }}
    >
      {children}
    </FileUploadContext.Provider>
  );
};
