"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./Table/table";

import { Input } from "@/components/ui/input";
import Search from "@/features/missions/components/Search";
import { Card } from "@/components/ui/card";
import { EStatus, useEcritureEnteteLigneStore } from "../store/store";
import { DialogTableDetail } from "./DialogTableDetail";
import { IEcritureEnteteLigne } from "../interface";


const TableEcritureDigitalContainer = () => {

  const EcritureStore = useEcritureEnteteLigneStore()
  const EcMapByStatus = new Map<number, EStatus>([[0, EStatus.ATTENTE], [1, EStatus.INVALIDE], [2, EStatus.VALIDE], [3, EStatus.INTEGRE]])
  const [ecritures, setEcritures] = useState(EcritureStore.items)

  useEffect(() => {




    const filterByStatus = EcritureStore.filter?.status !== EStatus.ALL ? EcritureStore.items.filter((ec) => {
      if (EcMapByStatus.get(ec.entete.Status) === EcritureStore.filter?.status) {
        return ec
      }
    }) : [...EcritureStore.items]

    const filterBySearch = EcritureStore.filter.search.value ? filterByStatus.filter((value) => {
      if (EcritureStore.filter.search.type === 'facture') {

        return value.entete.EC_RefPiece.toLowerCase().includes(EcritureStore.filter.search.value.toLowerCase())
      }
      if (EcritureStore.filter.search.type === 'tiers') {

        return value.entete.CT_Num && value.entete.CT_Num.toLowerCase().includes(EcritureStore.filter.search.value.toLowerCase())
      }
    }) : [...filterByStatus]


    setEcritures(filterBySearch)



  }, [JSON.stringify(EcritureStore.filter), JSON.stringify(EcritureStore.items)])


  return (
    <div className="flex flex-col gap-8">

      <DataTable
        data={
          ecritures.map((val) => val.entete)
        }
      />
      {<DialogTableDetail refpiece={EcritureStore.dialog.viewTable[1]} open={EcritureStore.dialog.viewTable[0]} setOpen={(value) => EcritureStore.setDialogState({ ...EcritureStore.dialog, viewTable: [value, ''] })} />}

    </div>
  );
};

export default TableEcritureDigitalContainer;
