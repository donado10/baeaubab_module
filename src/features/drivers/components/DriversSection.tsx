"use client";

import React from "react";
import { usePathname } from "next/navigation";
import TableDriverContainer from "./TableContainer";
import useGetStatDriver from "../api/use-get-stats";
import { CardStatus } from "@/components/CardStatus";

import Image from "next/image";
import CircleAddIcon from "@/assets/circle.svg";
import Link from "next/link";




const DriverCardStatusContainer = () => {
  const { data, isPending } = useGetStatDriver()

  if (isPending) {
    return <></>
  }

  if (!data) {
    return <></>
  }


  return <div className="flex justify-between gap-4 mb-8">
    <CardStatus title="Non Conforme" value={data.result.non_conforme} color="bg-red-600" />
    <CardStatus
      title="Indisponible"
      value={data.result.indisponible}
      color="bg-[#FF8D28]"
    />
    <CardStatus title="Disponible" value={data.result.disponible} color="bg-green-600" />
  </div>
}

const DriversSection = () => {
  const pathname = usePathname();

  return (
    <section className="flex flex-col">
      <div className="flex items-center justify-between mb-8">

        <span className="  text-2xl font-semibold text-primary ">
          Chauffeurs
        </span>

        <div>
          <Link href={pathname + "/create"} className=""><Image src={CircleAddIcon} alt="" width={64} height={64} /></Link>
        </div>
      </div>
      <DriverCardStatusContainer />
      <div>
        <TableDriverContainer />
      </div>
    </section>
  );
};

export default DriversSection;
