"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./Table/table";

import { SelectAvailability, SelectContractType } from "./tableFilter";
import useGetDriverInfoTable from "../api/use-get-driver-info-table";
import { Input } from "@/components/ui/input";
import { useDriverStore } from "../store/store";
import { TDriverTableInfoSchema } from "../interface";
import Search from "@/features/missions/components/Search";
import { Card } from "@/components/ui/card";


const TableDriverContainer = () => {

  const { data, isPending } = useGetDriverInfoTable();
  const driverStore = useDriverStore()
  const [filterDriver, setFilterDriver] = useState<TDriverTableInfoSchema[]>(driverStore.driverTableInfo)

  useEffect(() => {

    if (!isPending && data?.result && data.result.length > 0) {
      driverStore.setDriverTableInfo(data.result)
      setFilterDriver(data.result)
    } else {
      driverStore.setDriverTableInfo([])

    }

  }, [isPending, JSON.stringify(data)])

  useEffect(() => {

    const driversByName = driverStore.filter.driver_name ?
      driverStore.driverTableInfo.filter((driver) => { return driver.em_fullname.toLowerCase().includes(driverStore.filter.driver_name!.toLowerCase()) })
      : driverStore.driverTableInfo


    const driversByAvailability = driverStore.filter.availability ?
      driversByName.filter((driver) => { return driver.em_status.toLowerCase() === (driverStore.filter.availability!.toLowerCase()) })
      : driversByName

    const driversByContract = driverStore.filter.contract_type ?
      driversByAvailability.filter((driver) => { return driver.em_contract.toLowerCase() === (driverStore.filter.contract_type!.toLowerCase()) })
      : driversByAvailability

    setFilterDriver(driversByContract)
  }, [JSON.stringify(driverStore.filter)])


  return (
    <div className="flex flex-col gap-8">
      <div className=" flex items-center justify-between">
        <div>
          <Search placeholder="Rechercher chauffeur" onAction={(e: React.ChangeEvent<HTMLInputElement>) => driverStore.setFilter({ ...driverStore.filter, driver_name: e.currentTarget.value.trim() })} />
        </div>
        <div className="flex items-center gap-2">
          <SelectAvailability onAction={(value) => { driverStore.setFilter({ ...driverStore.filter, availability: value }) }} />
          <SelectContractType onAction={(value) => { driverStore.setFilter({ ...driverStore.filter, contract_type: value }) }} />
        </div>
      </div>
      <Card className="h-[20rem] overflow-y-scroll p-2">

        <DataTable
          data={
            filterDriver
          }
        />
      </Card>
    </div>
  );
};

export default TableDriverContainer;
