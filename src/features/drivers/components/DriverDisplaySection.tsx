"use client";

import React, { ReactNode } from "react";
import { driverDocumentSchema, driverSchema } from "../schema";
import z from "zod";
import LeftArrowIcon from "@/assets/left_arrow.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import FileIcon from "@/assets/file.svg";
import DownloadIcon from "@/assets/download.svg";
import { Button } from "@/components/ui/button";

const CardFileDriver = ({
  document,
}: {
  document: z.infer<typeof driverDocumentSchema>;
}) => {
  const url = process.env.NEXT_PUBLIC_APP_URL!
  return (
    <Button
      className="bg-[#D9D9D9] w-full h-12 flex items-center justify-between "
      onClick={async () => {
        await fetch(
          `${url}/api/drivers/file/${document.file as string}`
        );
      }}
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full p-2 bg-white">
          <Image src={FileIcon} alt="" width={12} height={12} />
        </span>
        <span className="text-black">{document.nom}</span>
      </div>
      <div>
        <span className="rounded-full p-2 ">
          <Image src={DownloadIcon} alt="" width={24} height={24} />
        </span>
      </div>
    </Button>
  );
};

const CardFieldDriver = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="flex items-center justify-between gap-2 border-b-2 pb-1 border-black w-full">
      <span className="font-semibold text-xs">{label}</span>
      <span className="text-sm text-black/50">{value}</span>
    </div>
  );
};

const CardInfoDriver = ({
  title,
  left,
  right,
}: {
  title: string;
  left?: { label: string; value: string }[];
  right?: { label: string; value: string }[];
}) => {
  return (
    <Card className="bg-secondary p-4 h-full">
      <CardTitle className="font-semibold">{title}</CardTitle>
      <CardContent className="flex gap-6 p-0 w-full ">
        <div className="flex flex-col gap-4  w-1/2">
          {left?.map((l) => {
            return (
              <CardFieldDriver key={l.label} label={l.label} value={l.value} />
            );
          })}
        </div>
        <div className="flex flex-col gap-4 w-1/2">
          {right?.map((l) => {
            return (
              <CardFieldDriver key={l.label} label={l.label} value={l.value} />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const DriverDisplaySection = ({
  driver,
}: {
  driver: z.infer<typeof driverSchema>;
}) => {
  const pathname = usePathname();
  return (
    <section className="flex flex-col p-8 gap-8">
      <div className="flex items-center gap-8">
        <Link href={pathname.split("/").slice(0, -1).join("/")}>
          <Image src={LeftArrowIcon} alt="left arrow" width={14} height={14} />
        </Link>
        <span className="text-3xl font-semibold text-primary">
          {driver.em_firstname + " " + driver.em_lastname}
        </span>
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-4">
        <div className="w-full h-full col-start-1 col-end-1 row-start-1 row-end-1">
          <CardInfoDriver
            title="INFORMATION PERSONNELLE"
            left={[
              {
                label: "Date de naissance",
                value: formatDate(driver.em_birthday),
              },
              { label: "Nationalité", value: driver.em_nationality },
              { label: "Téléphone", value: driver.em_phonenumber },
              { label: "Contact d'urgence", value: driver.em_emergencynumber },
            ]}
            right={[
              { label: "Lieu de Naissance", value: driver.em_birthplace },
              { label: "Adresse", value: driver.em_address },
              { label: "Email", value: driver.em_email },
            ]}
          />
        </div>
        <div className="w-full h-full  col-start-2 col-end-2 row-start-1 row-end-1">
          <CardInfoDriver
            title="INFORMATION RH"
            left={[
              {
                label: "Date d'embauche",
                value: driver.em_addons.date_embauche ?? "",
              },
              { label: "Numéro CNSS", value: driver.em_addons.cnss ?? "" },
              { label: "Catégorie socio Prof", value: driver.em_type },
            ]}
            right={[
              {
                label: "Numéro de matricule",
                value: driver.em_addons.matricule ?? "",
              },
              { label: "Numéro IPM", value: driver.em_addons.ipm ?? "" },
              {
                label: "Salaire de base",
                value: driver.em_addons.base_salary ?? "",
              },
            ]}
          />
        </div>
        <div className="w-full h-full  col-start-1 col-end-1 row-start-2 row-end-2">
          <CardInfoDriver
            title="INFORMATIONS OPERATIONNELLES"
            left={[
              {
                label: "Disponibilité",
                value: driver.em_addons.status ?? "",
              },
              { label: "Dernière mission", value: "" },
            ]}
            right={[
              {
                label: "Dernier Véhicule assignée",
                value: driver.em_addons.car ?? "",
              },
            ]}
          />
        </div>
        <div className="w-full h-full  col-start-2 col-end-2 row-start-2 row-end-2">
          <CardInfoDriver
            title="ALERTES ET INFORMATIONS CLES"
            left={[
              {
                label: "Contrat",
                value: driver.em_addons.contract_type ?? "",
              },
              { label: "Visite Medicale", value: "" },
            ]}
            right={[
              {
                label: "Permis",
                value: driver.em_addons.permis ?? "",
              },
            ]}
          />
        </div>
      </div>
      <div className="w-full">
        <Card className="bg-secondary p-4">
          <CardTitle className="font-semibold">DOCUMENTS</CardTitle>
          <CardContent className="grid  items-start grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4 px-0">
            {driver.em_addons.documents.map((doc) => {
              return <CardFileDriver key={doc.hashname} document={doc} />;
            })}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DriverDisplaySection;
