"use client";

import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import React from "react";
import AddIcon from "@/assets/add.svg";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import TableMissionContainer from "./Table/TableContainer";
import { DropdownHeaderMenuSection } from "@/components/DropdownHeaderMenuSection";
import { CardStatus } from "@/components/CardStatus";
import useGetStatMission from "../api/use-get-stats";

import Image from "next/image";
import CircleAddIcon from "@/assets/circle.svg";
import Link from "next/link";


const MissionCardStatusContainer = () => {
  const { data, isPending } = useGetStatMission()

  if (isPending) {
    return <></>
  }

  if (!data) {
    return <></>
  }


  return <div className="flex justify-between gap-4 mb-8">
    <CardStatus title="Echouées" value={data.result.echouees} color="bg-red-600" />
    <CardStatus
      title="En Cours"
      value={data.result.en_cours}
      color="bg-[#FF8D28]"
    />
    <CardStatus title="Terminées" value={data.result.terminees} color="bg-green-600" />
    <CardStatus title="Créer" value={data.result.créer} color="bg-[#FFCC00]" />
  </div>
}


const MissionSection = () => {
  const pathname = usePathname();

  return (
    <section className="flex flex-col">

      <div className="flex items-center justify-between mb-8">

        <span className="  text-2xl font-semibold text-primary ">
          Missions
        </span>

        <div>
          <Link href={pathname + "/create"} className=""><Image src={CircleAddIcon} alt="" width={64} height={64} /></Link>
        </div>
      </div>


      <MissionCardStatusContainer />
      <div className="">
        <TableMissionContainer />
      </div>
    </section>
  );
};

export default MissionSection;
