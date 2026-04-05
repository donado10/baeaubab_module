"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./Table/table";

import { EStatus, useEntrepriseBonLivraisonStore } from "../store/store";
import { IDocumentBonLivraison, IEntrepriseBonLivraison } from "../interface";


const BonLivraisonTableContainer = ({ documents }: { documents: IEntrepriseBonLivraison[] }) => {

  const store = useEntrepriseBonLivraisonStore()
  const blMapByStatus = new Map<number, EStatus>([[1, EStatus.TAXABLE], [2, EStatus.EXONORE]])
  const [blivraison, setBlivraison] = useState(store.items)

  useEffect(() => {

    const filterByStatus = store.filter?.status !== EStatus.ALL ? documents.filter((bl) => {
      if (blMapByStatus.get(Number(bl.EN_TVA)) === store.filter?.status) {
        return bl
      }
    }) : [...documents]

    const filterBySearch = store.filter.search?.value ? filterByStatus.filter((value) => {
      if (store.filter.search.type === 'Intitule') {

        return value.EN_Intitule.toLowerCase().includes(store.filter.search.value.toLowerCase())
      }
      if (store.filter.search.type === 'entreprise_id') {

        return value.EN_No.toString() == store.filter.search.value
      }
    }) : [...filterByStatus]



    setBlivraison(filterBySearch)
  }, [JSON.stringify(store.filter), JSON.stringify(documents)])


  return (
    <div className="flex flex-col gap-8">

      <DataTable
        data={
          blivraison
        }
      />
    </div>
  );
};

export default BonLivraisonTableContainer;