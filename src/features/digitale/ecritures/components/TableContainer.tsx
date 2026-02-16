"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./Table/table";

import { Input } from "@/components/ui/input";
import Search from "@/features/missions/components/Search";
import { Card } from "@/components/ui/card";
import { EStatus, useEcritureEnteteLigneStore } from "../store/store";


const TableEcritureDigitalContainer = () => {

  const EcritureStore = useEcritureEnteteLigneStore()
  const EcMapByStatus = new Map<number, EStatus>([[0, EStatus.ATTENTE], [1, EStatus.INVALIDE], [2, EStatus.VALIDE], [3, EStatus.INTEGRE]])
  const [ecritures, setEcritures] = useState(EcritureStore.items)

  useEffect(() => {

    if (EcritureStore.filter.status !== EStatus.ALL) {

      const filterByStatus = EcritureStore.items.filter((ec) => {
        if (EcMapByStatus.get(ec.entete.Status) === EcritureStore.filter.status) {
          return ec
        }
      })
      setEcritures(filterByStatus)
      return
    }

    setEcritures(EcritureStore.items)

  }, [EcritureStore.filter])


  return (
    <div className="flex flex-col gap-8">

      <DataTable
        data={
          ecritures.map((val) => val.entete)
        }
      />
    </div>
  );
};

export default TableEcritureDigitalContainer;
