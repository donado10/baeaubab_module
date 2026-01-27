"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./table";

import { Card } from "@/components/ui/card";
import { SelectAvailability } from "../tableFilter";
import useGetCarInfoTable from "../../api/use-get-car-info-table";
import Search from "@/features/missions/components/Search";
import { TCarTableInfoSchema } from "../../interface";
import { useCarStore } from "../../store/store";

const TableCarContainer = () => {
  const { data, isPending } = useGetCarInfoTable();
  const carStore = useCarStore()
  const [filterCar, setFilterCar] = useState<TCarTableInfoSchema[]>(carStore.carTableInfo)

  useEffect(() => {

    if (!isPending && data?.result && data.result.length > 0) {
      carStore.setCarTableInfo(data.result)
      setFilterCar(data.result)
    } else {
      carStore.setCarTableInfo([])

    }

  }, [isPending, JSON.stringify(data)])

  useEffect(() => {

    const carsByName = carStore.filter.matricule ?
      carStore.carTableInfo.filter((car) => { return car.car_matricule.toLowerCase().includes(carStore.filter.matricule!.toLowerCase()) })
      : carStore.carTableInfo


    const carsByAvailability = carStore.filter.availability ?
      carsByName.filter((car) => { return car.car_status.toLowerCase() === (carStore.filter.availability!.toLowerCase()) })
      : carsByName



    setFilterCar(carsByAvailability)
  }, [JSON.stringify(carStore.filter)])


  return (
    <div className="flex flex-col gap-8">
      <div className=" flex items-center justify-between">
        <div>
          <Search onAction={(e: React.ChangeEvent<HTMLInputElement>) => carStore.setFilter({ ...carStore.filter, matricule: e.currentTarget.value.trim() })} placeholder={"Recherche un matricule"} />
        </div>
        <div className="flex items-center gap-2">
          <SelectAvailability onAction={(value) => { carStore.setFilter({ ...carStore.filter, availability: value }) }} />
        </div>
      </div>
      <Card className="h-[20rem] overflow-y-scroll p-2">

        <DataTable
          data={
            filterCar
          }
        />
      </Card>
    </div>
  );
};

export default TableCarContainer;
