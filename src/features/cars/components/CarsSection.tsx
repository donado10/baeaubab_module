"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import CircleAddIcon from "@/assets/circle.svg";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import TableCarContainer from "@/features/cars/components/Table/TableContainer";
import { DropdownHeaderMenuSection } from "@/components/DropdownHeaderMenuSection";
import useGetStatCar from "../api/use-get-stats";


const CarCardStatus = ({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) => {
  return (
    <Card className="relative bg-secondary p-2 flex gap-0 flex-col border-none   w-1/3">
      <span
        className={cn("rounded-full w-6 h-6 absolute  top-2 right-2  ", color)}
      ></span>
      <CardTitle className="mb-4">{title}</CardTitle>
      <CardContent className=" p-0">
        <span className="font-bold text-primary text-xl">{value}</span>
      </CardContent>
    </Card>
  );
};

const CarCardStatusContainer = () => {
  const { data, isPending } = useGetStatCar()

  if (isPending) {
    return <></>
  }

  if (!data) {
    return <></>
  }


  return <div className="flex justify-between gap-4 mb-8">
    <CarCardStatus title="Indisponible" value={data.result.indisponible} color="bg-red-600" />
    <CarCardStatus title="Disponible" value={data.result.disponible} color="bg-green-600" />
    <CarCardStatus title="En Mission" value={data.result.en_mission} color="bg-[#FF8D28]" />
  </div>
}


const CarsSection = () => {
  const pathname = usePathname();

  return (
    <section className="flex flex-col relative">
      <div className="flex items-center justify-between mb-8">
        <span className="  text-2xl font-semibold text-primary ">
          Véhicules
        </span>

        <div>
          <Link href={pathname + "/create"} className=""><Image src={CircleAddIcon} alt="" width={64} height={64} /></Link>
        </div>
      </div>
      <CarCardStatusContainer />
      <div>
        <TableCarContainer />
      </div>
    </section>
  );
};

export default CarsSection;
