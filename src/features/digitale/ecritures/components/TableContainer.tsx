"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./Table/table";

import { EStatus, useEcritureEnteteLigneStore } from "../store/store";
import { DialogTableDetail } from "./DialogTableDetail";
import { IEcritureEnteteLigne, IEcritureError } from "../interface";


function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const filterInvalide = (items: IEcritureEnteteLigne, invalide: string[]) => {

  const filterByBalanced = invalide.includes("Balanced") ? items.filter((ec) => {
    return ec.error[0].Balanced == "0"

  }) : [...items]

  const filterByCompliance = invalide.includes("Compliance") ? filterByBalanced.filter((ec) => {
    return ec.error[0].Compliance == "0"

  }) : [...filterByBalanced]

  const filterByJMDate = invalide.includes("JM_Date") ? filterByCompliance.filter((ec) => {
    return ec.error[0].JM_Date == "0"

  }) : [...filterByCompliance]

  const filterByECJour = invalide.includes("EC_Jour") ? filterByJMDate.filter((ec) => {
    return ec.error[0].EC_Jour == "0"

  }) : [...filterByJMDate]

  const filterByECDate = invalide.includes("EC_Date") ? filterByECJour.filter((ec) => {
    return ec.error[0].EC_Date == "0"

  }) : [...filterByECJour]

  const filterByECPiece = invalide.includes("EC_Piece") ? filterByECDate.filter((ec) => {
    return ec.error[0].EC_Piece == "0"

  }) : [...filterByECDate]

  const filterByECRefPiece = invalide.includes("EC_Refpiece") ? filterByECPiece.filter((ec) => {
    return ec.error[0].EC_RefPiece == "0"

  }) : [...filterByECPiece]

  const filterByCGNum = invalide.includes("CG_Num") ? filterByECRefPiece.filter((ec) => {
    return ec.error[0].CG_Num == "0"

  }) : [...filterByECRefPiece]

  const filterByCTNum = invalide.includes("CT_Num") ? filterByCGNum.filter((ec) => {
    return ec.error[0].CT_Num == "0"

  }) : [...filterByCGNum]

  const filterByECIntitule = invalide.includes("EC_Intitule") ? filterByCTNum.filter((ec) => {
    return ec.error[0].EC_Intitule == "0"

  }) : [...filterByCTNum]

  const filterByECSens = invalide.includes("EC_Sens") ? filterByECIntitule.filter((ec) => {
    return ec.error[0].EC_Sens == "0"

  }) : [...filterByECIntitule]

  const filterByECMontant = invalide.includes("EC_Montant") ? filterByECSens.filter((ec) => {
    return ec.error[0].EC_Montant == "0"

  }) : [...filterByECSens]



  return filterByECMontant
}

const TableEcritureDigitalContainer = () => {

  const store = useEcritureEnteteLigneStore()
  const EcMapByStatus = new Map<number, EStatus>([[0, EStatus.ATTENTE], [1, EStatus.INVALIDE], [2, EStatus.VALIDE], [3, EStatus.INTEGRE]])
  const [ecritures, setEcritures] = useState(store.items)

  useEffect(() => {

    const filterEc = async () => {




      const filterByStatus = store.filter?.status !== EStatus.ALL ? store.items.filter((ec) => {
        if (EcMapByStatus.get(ec.entete.Status) === store.filter?.status) {
          return ec
        }
      }) : [...store.items]

      /*       await sleep(3000)
       */
      const filterBySearch = store.filter.search?.value ? filterByStatus.filter((value) => {
        if (store.filter.search.type === 'facture') {

          return value.entete.EC_RefPiece.toLowerCase().includes(store.filter.search.value.toLowerCase())
        }
        if (store.filter.search.type === 'tiers') {

          return value.entete.CT_Num && value.entete.CT_Num.toLowerCase().includes(store.filter.search.value.toLowerCase())
        }
      }) : [...filterByStatus]

      const filterByInvalide = filterInvalide(filterBySearch, store.filter.invalide)



      setEcritures(filterByInvalide)

    }

    filterEc()


  }, [JSON.stringify(store.filter), JSON.stringify(store.items)])


  return (
    <div className="flex flex-col gap-8">

      <DataTable
        data={
          ecritures.map((val) => val.entete)
        }
      />
      {<DialogTableDetail refpiece={store.dialog.viewTable[1]} open={store.dialog.viewTable[0]} setOpen={(value) => store.setDialogState({ ...store.dialog, viewTable: [value, ''] })} />}

    </div>
  );
};

export default TableEcritureDigitalContainer;
