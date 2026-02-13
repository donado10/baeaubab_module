"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./Table/table";

import { Input } from "@/components/ui/input";
import Search from "@/features/missions/components/Search";
import { Card } from "@/components/ui/card";
import { useEcritureEnteteLigneStore } from "../store/store";


const TableEcritureDigitalContainer = () => {

  const EcritureStore = useEcritureEnteteLigneStore()


  return (
    <div className="flex flex-col gap-8">

      <DataTable
        data={
          EcritureStore.items.map((val) => val.entete)
        }
      />
    </div>
  );
};

export default TableEcritureDigitalContainer;
