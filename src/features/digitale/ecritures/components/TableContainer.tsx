"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./Table/table";

import { Input } from "@/components/ui/input";
import Search from "@/features/missions/components/Search";
import { Card } from "@/components/ui/card";


const TableEcritureDigitalContainer = () => {



  useEffect(() => {



  }, [])


  return (
    <div className="flex flex-col gap-8">

      <DataTable
        data={
          []
        }
      />
    </div>
  );
};

export default TableEcritureDigitalContainer;
