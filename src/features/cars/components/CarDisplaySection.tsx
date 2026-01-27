"use client";

import React, { ReactNode } from "react";
import { carDocumentSchema, carSchema } from "../schema";
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
import useGetCarDocument from "../api/use-get-car-file";

const CardFileCar = ({
  document,
}: {
  document: z.infer<typeof carDocumentSchema>;
}) => {
  const url = process.env.NEXT_PUBLIC_APP_URL!

  return (
    <Button
      className="bg-[#D9D9D9] w-full h-12 flex items-center justify-between "
      onClick={async () => {
        await fetch(
          `${url}/api/cars/file/${document.file as string}`
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

const CardFieldCar = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-center justify-between gap-2 border-b-2 pb-1 border-black w-full">
      <span className="font-semibold text-xs">{label}</span>
      <span className="text-sm text-black/50">{value}</span>
    </div>
  );
};

const CardInfoCar = ({
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
              <CardFieldCar key={l.label} label={l.label} value={l.value} />
            );
          })}
        </div>
        <div className="flex flex-col gap-4 w-1/2">
          {right?.map((l) => {
            return (
              <CardFieldCar key={l.label} label={l.label} value={l.value} />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const CarDisplaySection = ({ Car }: { Car: z.infer<typeof carSchema> }) => {
  const pathname = usePathname();
  return (
    <section className="flex flex-col p-8 gap-8">
      <div className="flex items-center gap-8">
        <Link href={pathname.split("/").slice(0, -1).join("/")}>
          <Image src={LeftArrowIcon} alt="left arrow" width={14} height={14} />
        </Link>
        <span className="text-3xl font-semibold text-primary">
          {Car.car_addons.marque + " " + Car.car_addons.modele}
        </span>
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-4">
        <div className="w-full h-full col-start-1 col-end-1 row-start-1 row-end-1">
          <CardInfoCar
            title="INFORMATION TECHNIQUE"
            left={[
              {
                label: "Année de Fabrication",
                value: Car.car_addons.year,
              },
              {
                label: "Capacité réservoir",
                value: Car.car_tankcapacity + " " + "L",
              },
              { label: "Numéro de chassis", value: Car.car_chassisnumber },
              {
                label: "Puissance fiscale",
                value: Car.car_fiscalpower + " " + "CV",
              },
            ]}
            right={[
              { label: "Type de carburant", value: Car.car_fueltype },
              {
                label: "Kilométrage actuel",
                value: Car.car_mileage + " " + "KM",
              },
              { label: "Numéro de moteur", value: Car.car_enginenumber },
              { label: "Charge utile", value: Car.car_payload + " " + "KG" },
            ]}
          />
        </div>
        <div className="w-full h-full col-start-1 col-end-1 row-start-1 row-end-1">
          <CardInfoCar
            title="INFORMATION TECHNIQUE"
            left={[
              {
                label: "Année de Fabrication",
                value: Car.car_addons.year,
              },
              {
                label: "Capacité réservoir",
                value: Car.car_tankcapacity + " " + "L",
              },
              { label: "Numéro de chassis", value: Car.car_chassisnumber },
              {
                label: "Puissance fiscale",
                value: Car.car_fiscalpower + " " + "CV",
              },
            ]}
            right={[
              { label: "Type de carburant", value: Car.car_fueltype },
              {
                label: "Kilométrage actuel",
                value: Car.car_mileage + " " + "KM",
              },
              { label: "Numéro de moteur", value: Car.car_enginenumber },
              { label: "Charge utile", value: Car.car_payload + " " + "KG" },
            ]}
          />
        </div>
        <div className="w-full h-full col-start-2 col-end-2 row-start-1 row-end-1">
          <CardInfoCar
            title="INFORMATIONS ADMINISTRATIVES"
            left={[
              {
                label: "Date d'acquisition",
                value: formatDate(Car.car_acquisitiondate),
              },
              {
                label: "Numéro carte grise",
                value: Car.car_addons.registrationcard,
              },
              {
                label: "Valeur d'acquisition",
                value: Car.car_acquisitionvalue,
              },
            ]}
            right={[
              { label: "Type d'acquisition", value: Car.car_acquisitiontype },
              {
                label: "Date circulation",
                value: formatDate(Car.car_circulationdate),
              },
              { label: "Propriétaire", value: Car.car_owner },
            ]}
          />
        </div>
        <div className="w-full h-full col-start-1 col-end-1 row-start-2 row-end-2">
          <CardInfoCar
            title="STATUS ET ACTIVITES RECENTES"
            left={[
              {
                label: "Disponibilité",
                value: Car.car_addons.status,
              },
              {
                label: "Dernière Mission",
                value: "",
              },
              {
                label: "Prochain entretien",
                value: Car.car_acquisitionvalue,
              },
            ]}
            right={[
              { label: "Dernier assignée", value: "" },
              {
                label: "Localisation actuelle",
                value: "",
              },
            ]}
          />
        </div>
        <div className="w-full h-full col-start-2 col-end-2 row-start-2 row-end-2">
          <CardInfoCar
            title="ALERTES ET ECHEANCES"
            left={[
              {
                label: "Maintenance",
                value: "",
              },
              {
                label: "Assurance RC",
                value: Car.car_addons.assurance,
              },
              {
                label: "Suivi entretien et trajets",
                value: Car.car_acquisitionvalue,
              },
            ]}
            right={[
              { label: "Controle technique", value: "" },
              {
                label: "Panne signalée",
                value: "",
              },
            ]}
          />
        </div>
      </div>
      <div className="w-full">
        <Card className="bg-secondary p-4">
          <CardTitle className="font-semibold">DOCUMENTS</CardTitle>
          <CardContent className="grid  items-start grid-cols-[repeat(auto-fit,minmax(16rem,24rem))] gap-4 px-0">
            {Car.car_addons.documents.map((doc) => {
              return <CardFileCar key={doc.hashname} document={doc} />;
            })}
          </CardContent>
        </Card>
      </div>
      
    </section>
  );
};

export default CarDisplaySection;
