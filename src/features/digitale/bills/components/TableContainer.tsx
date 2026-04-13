"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./Table/table";

import { EStatus, useEntrepriseFactureStore } from "../store/store";


const TableFactureDigitalContainer = () => {

  const store = useEntrepriseFactureStore()
  const blMapByStatus = new Map<number, EStatus>([[1, EStatus.VALID], [2, EStatus.WAITING]])
  const [factures, setFactures] = useState(store.items)

  useEffect(() => {

    const filterByStatus = [...store.items]

    const filterBySearch = store.filter.search?.value ? filterByStatus.filter((value) => {
      if (store.filter.search.type === 'Intitule') {

        return value.EN_Intitule.toLowerCase().includes(store.filter.search.value.toLowerCase())
      }
      if (store.filter.search.type === 'entreprise_id') {

        return value.DO_Entreprise_Sage.toString() == store.filter.search.value
      }
    }) : [...filterByStatus]



    setFactures(filterBySearch)
  }, [JSON.stringify(store.filter), JSON.stringify(store.items)])





  return (
    <div className="flex flex-col gap-8">

      <DataTable
        data={
          factures
        }
      />
    </div>
  );
};

export default TableFactureDigitalContainer;