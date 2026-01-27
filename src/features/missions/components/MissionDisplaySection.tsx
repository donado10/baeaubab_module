"use client";

import React, { ReactNode } from "react";
import { missionDocumentSchema, missionSchema } from "../schema";
import z from "zod";
import LeftArrowIcon from "@/assets/left_arrow.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import FileIcon from "@/assets/file.svg";
import DownloadIcon from "@/assets/download.svg";
import { Button } from "@/components/ui/button";
import { StatusDisplay } from "./Table/columns";
import { cn, formatDate } from "@/lib/utils";
import TagIcon from "@/assets/tag.svg"
import { SheetAffectationMission } from "./SheetAffectationMission";
import test from "node:test";
import useGetMissionRessource from "../api/use-get-mission-ressource";
import { MissionRessourceSchema } from "../interface";
import UserIcon from "@/assets/user-icon.svg"
import TruckIcon from "@/assets/truck-icon.svg"
import ArrowIcon from "@/assets/left_arrow.svg"
import StartIcon from "@/assets/start.svg"
import CancelIcon from "@/assets/cancel.svg"
import ReturnIcon from "@/assets/return.svg"
import DoneIcon from "@/assets/done.svg"
import { AlertDialogChangeStatusMission, AlertReturnMissionHandler } from "./DialogStartMission";
import { CardStatus } from "@/components/CardStatus";
import useGetStatSingleMission from "../api/use-get-stat-single-mission";

const CardFileMission = ({
  document,
}: {
  document: z.infer<typeof missionDocumentSchema>;
}) => {
  const url = process.env.NEXT_PUBLIC_APP_URL!
  return (
    <Button
      className="bg-[#D9D9D9] w-full h-12 flex items-center justify-between "
      onClick={async () => {
        await fetch(
          `${url}/api/missions/file/${document.file as string}`
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

const CardFieldMission = ({
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

const CardInfoMission = ({
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
              <CardFieldMission key={l.label} label={l.label} value={l.value} />
            );
          })}
        </div>
        <div className="flex flex-col gap-4 w-1/2">
          {right?.map((l) => {
            return (
              <CardFieldMission key={l.label} label={l.label} value={l.value} />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const MissionCardStatusContainer = ({ miss_no }: { miss_no: string }) => {
  const { data, isPending } = useGetStatSingleMission(miss_no)

  if (isPending) {
    return <></>
  }

  if (!data) {
    return <></>
  }


  return <div className="flex justify-between gap-4 mb-8 w-full">
    <CardStatus color="bg-gray-300" title="Coût carburant réel" value={data.result.miss_actualfuelcost ? data.result.miss_actualfuelcost + ' ' + 'FCFA' : '0'} />
    <CardStatus color="bg-gray-300" title="Consommation réelle" value={data.result.miss_actualconsumption ? data.result.miss_actualconsumption + ' ' + 'L' : '0'} />
    <CardStatus color="bg-gray-300" title="Coût total réel" value={data.result.miss_actualtotalcost ? data.result.miss_actualtotalcost + ' ' + 'FCFA' : '0'} />
    <CardStatus color="bg-gray-300" title="Variance budget" value={data.result.miss_budgetvariance ? data.result.miss_budgetvariance + ' ' + 'FCFA' : '0'} />
  </div>
}

const CardInfoRessourceMission = ({
  title,
  info,
  icon
}: {
  title: string;
  info?: { label: string; value: string }[];
  icon: ReactNode;
}) => {
  return (
    <Card className="bg-[#E2ECF6] p-4 h-full w-1/2">
      <CardTitle className="font-semibold text-primary flex items-center justify-between">
        <span className=" p-2 rounded-full bg-white">{icon}</span>
        <span>{title}</span>
      </CardTitle>
      <CardContent className="flex gap-6 p-0 w-full ">
        <div className="flex flex-col gap-4  w-full">
          {info?.map((l) => {
            return (
              <CardFieldMission key={l.label} label={l.label} value={l.value} />
            );
          })}
        </div>
      </CardContent>
    </Card>)
}

const CardRessourcesMissionContainer = ({ miss_status, car_no, em_no }: { miss_status: string, car_no: string, em_no: string }) => {

  const { data, isPending } = useGetMissionRessource(car_no, em_no);

  if (isPending) {
    return <></>
  }

  if (!data?.result) {
    return <></>
  }

  return <CardRessourcesMission miss_status={miss_status} ressources={data?.result as MissionRessourceSchema} />
}
const CardRessourcesMission = ({ miss_status, ressources }: { miss_status: string, ressources: MissionRessourceSchema }) => {
  return <Card className="w-full flex justify-between bg-secondary gap-4  p-4">
    <div className="flex items-center justify-between">

      <CardTitle>Ressources</CardTitle>
      {(miss_status === "créer") && <SheetAffectationMission defaultValue={{ car: ressources.car?.car_no ?? "", driver: ressources.driver?.em_no ?? "" }}>
        <Button variant={"default"} className="scale-x-[-1] bg-transparent hover:bg-gray-400/20">
          <Image src={ArrowIcon} alt="" width={8} height={8} />
        </Button>
      </SheetAffectationMission>}
    </div>
    <div className="flex gap-4">

      {ressources.driver?.em_no && <CardInfoRessourceMission icon={<><Image src={UserIcon} alt="" width={16} height={16} /></>} title={ressources.driver.em_firstname + ' ' + ressources.driver.em_lastname} info={[{ label: "Permis", value: ressources.driver.em_permis, }, { label: "Téléphone", value: ressources.driver.em_phonenumber }]} />}
      {ressources.car?.car_no && <CardInfoRessourceMission icon={<><Image src={TruckIcon} alt="" width={16} height={16} /></>} title={ressources.car.car_marque + '-' + ressources.car.car_modele} info={[{ label: "Matricule", value: ressources.car.car_matricule, }, { label: "Numéro carte grise", value: ressources.car.car_registrationcard }]} />}    </div>
  </Card>
}

const MissionDisplaySection = ({
  mission,
  ressources
}: {
  mission: z.infer<typeof missionSchema>;
  ressources: MissionRessourceSchema
}) => {
  const pathname = usePathname();

  let ressourceMissionAvailable = false


  if (ressources?.car?.car_status && ressources?.driver?.em_status) {
    ressourceMissionAvailable = ressources.car?.car_status === 'disponible' && ressources.driver?.em_status === 'disponible'
  }


  return (
    <section className="flex flex-col p-8 gap-8">
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-8">
          <Link href={pathname.split("/").slice(0, -1).join("/")}>
            <Image src={LeftArrowIcon} alt="left arrow" width={14} height={14} />
          </Link>
          <span className="text-3xl font-semibold text-primary">
            {mission.miss_intitule}
          </span>
        </div>
        <div><StatusDisplay value={mission.miss_addons?.status ?? ""} /></div>
      </div>
      <div className="flex justify-between gap-4 mb-8">
        <MissionCardStatusContainer miss_no={mission.miss_no} />
      </div>
      <div className="flex justify-between ">
        <div className="w-3/5 ">

          <div className="w-full mb-4">
            <div className="flex flex-col gap-4 mb-8">
              <span className="text-xs font-bold">Description</span>
              <span className="">{mission.miss_description}</span>
            </div>
            <div>
              <CardInfoMission title="" left={[
                {
                  label: "Départ prévu",
                  value: (mission.miss_expectedhourdeparture),
                },
                {
                  label: "Durée estimée",
                  value: (mission.miss_expectedduration),
                },
                {
                  label: "Budget carburant estimée",
                  value: (mission.miss_expectedfuelbudget),
                },
              ]} right={[
                {
                  label: "Arrivée prévu",
                  value: (mission.miss_expectedhourarrival),
                },
                {
                  label: "Distance estimée",
                  value: (mission.miss_expecteddistance),
                },
                {
                  label: "Budget total estimé",
                  value: (mission.miss_expectedtotalbudget),
                },
              ]} />
            </div>
          </div>
          {(mission.miss_addons?.car || mission.miss_addons?.driver) &&
            <CardRessourcesMissionContainer miss_status={mission.miss_addons.status} car_no={mission.miss_addons.car as string} em_no={mission.miss_addons.driver as string} />}
        </div>
        <div className="w-1/3 flex flex-col gap-4 h-auto ">
          {(!mission.miss_addons?.car || !mission.miss_addons?.driver) &&

            <SheetAffectationMission >

              <Button className="ml-auto border-2 border-primary hover:bg-primary hover:text-white flex items-center justify-between w-[15rem]"
                variant={"outline"}>
                <span><Image src={TagIcon} alt="" width={16} height={16} /></span>
                <span>Affecter</span>
              </Button>
            </SheetAffectationMission>
          }
          {(mission.miss_addons?.car && mission.miss_addons?.driver) &&

            <div className="flex items-center gap-4">
              {mission.miss_addons.status === 'créer' && <AlertDialogChangeStatusMission label="Voulez vous démarrer la mission ?" miss_status="en_cours" miss_no={mission.miss_no}>
                <Button disabled={!ressourceMissionAvailable} className="ml-auto border-2  border-green-600 hover:bg-gray-400/20   flex items-center justify-between w-1/2"
                  variant={"outline"}>
                  <span><Image src={StartIcon} alt="" width={20} height={20} /></span>
                  <span className="text-green-600">Démarrer la mission</span>
                </Button>
              </AlertDialogChangeStatusMission>}
              {(mission.miss_addons.status === 'en_cours') &&
                <AlertDialogChangeStatusMission label="Voulez vous terminée la mission ?" miss_status="terminees" miss_no={mission.miss_no}>


                  <Button className="ml-auto border-2  border-green-600 hover:bg-gray-400/20   flex items-center justify-between w-1/2"
                    variant={"outline"}>
                    <span><Image src={DoneIcon} alt="" width={20} height={20} /></span>
                    <span className="text-green-600">Terminée la mission</span>
                  </Button>
                </AlertDialogChangeStatusMission>
              }

              {(mission.miss_addons.status === 'créer' || mission.miss_addons.status === 'en_cours') &&
                <AlertDialogChangeStatusMission label="Voulez vous annuler la mission ?" miss_status="echouees" miss_no={mission.miss_no}>


                  <Button className="ml-auto border-2  border-red-600 hover:bg-gray-400/20   flex items-center justify-between w-1/2"
                    variant={"outline"}>
                    <span><Image src={CancelIcon} alt="" width={20} height={20} /></span>
                    <span className="text-red-600">Annuler la mission</span>
                  </Button>
                </AlertDialogChangeStatusMission>
              }
              {(mission.miss_addons.status === 'echouees') &&
                <AlertReturnMissionHandler mission={mission} label="Voulez vous retourner la mission ?" >


                  <Button className="ml-auto border-2  border-gray-950 hover:bg-gray-400/20   flex items-center justify-between w-1/2"
                    variant={"outline"}>
                    <span><Image src={ReturnIcon} alt="" width={20} height={20} /></span>
                    <span className="text-gray-950">Retourner la mission</span>
                  </Button>
                </AlertReturnMissionHandler>
              }


            </div>
          }
          {/* {(mission.miss_addons?.car && mission.miss_addons?.driver) &&
²
            < >

              <Button className="ml-auto border-2  border-red-600 hover:bg-gray-400/20   flex items-center justify-between w-[15rem]"
                variant={"outline"}>
                <span><Image src={CancelIcon} alt="" width={20} height={20} /></span>
                <span className="text-red-600">Arrêter la mission</span>
              </Button>
            </>
          } */}
          <Card className="bg-secondary p-4 flex-1 ">
            <CardTitle className="font-semibold">DOCUMENTS</CardTitle>
            <CardContent className="grid  items-start grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4 px-0">
              {mission.miss_addons?.documents.map((doc) => {
                return <CardFileMission key={doc.hashname} document={doc} />;
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MissionDisplaySection;
