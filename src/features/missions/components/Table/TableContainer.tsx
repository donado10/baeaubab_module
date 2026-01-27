"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./table";
import { SelectStatus } from "../tableFilter";
import useGetCarInfoTable from "../../api/use-get-mission-info-table";
import Search from "../Search";
import { useMissionStore } from "../../store/store";
import { TMissionTableInfoSchema } from "../../interface";
import { Card } from "@/components/ui/card";

const TableMissionContainer = () => {
  const { data, isPending } = useGetCarInfoTable();
  const missionStore = useMissionStore()
  const [filterMission, setFilterMission] = useState<TMissionTableInfoSchema[]>(missionStore.missionTableInfo)

  useEffect(() => {

    if (!isPending && data?.result && data.result.length > 0) {
      missionStore.setMissionTableInfo(data.result)
      setFilterMission(data.result)
    } else {
      missionStore.setMissionTableInfo([])

    }

  }, [isPending, JSON.stringify(data)])

  useEffect(() => {

    const missionsByName = missionStore.filter.mission_name ?
      missionStore.missionTableInfo.filter((mission) => { return mission.miss_intitule.toLowerCase().includes(missionStore.filter.mission_name!.toLowerCase()) })
      : missionStore.missionTableInfo


    const missionsByStatus = missionStore.filter.status ?
      missionsByName.filter((mission) => { return mission.miss_status.toLowerCase() === (missionStore.filter.status!.toLowerCase()) })
      : missionsByName

    setFilterMission(missionsByStatus)
  }, [JSON.stringify(missionStore.filter)])



  return (
    <div className="flex flex-col gap-8">
      <div className=" flex items-center justify-between">
        <div>
          <Search placeholder="Rechercher une mission" onAction={(e: React.ChangeEvent<HTMLInputElement>) => missionStore.setFilter({ ...missionStore.filter, mission_name: e.currentTarget.value.trim() })} />
        </div>
        <div className="flex items-center gap-2">
          <SelectStatus onAction={(value) => { missionStore.setFilter({ ...missionStore.filter, status: value }) }} />
        </div>
      </div>
      <Card className="h-[20rem] overflow-y-scroll p-2">

        <DataTable
          data={
            filterMission
          }
        />
      </Card>
    </div>
  );
};

export default TableMissionContainer;
