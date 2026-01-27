"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { usePathname } from "next/navigation";

const BreadcrumbContainer = () => {
  const pathname = usePathname();
  const breadMap = new Map<string, string>([
    ["dashboard", "Tableau de bord"],
    ["reporting-pilotage", "Reporting et pilotage"],
    ["analyse", "Analyse"],
    ["planning-dispatching", "Planning et Dispatching"],
    ["missions", "Missions"],
    ["drivers", "Chauffeurs"],
    ["cars", "Véhicules"],
    ["issues", "Incidents et conformités"],
    ["trips", "Historique des trajets"],
    ["ressources", "Gestion des ressources"],
    ["gestion", "Gestion"],
  ]);

  const pathnameList = pathname
    .split("/")
    .filter((path) => path !== "")
    .filter((path) => breadMap.get(path) !== undefined);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathnameList.map((path, i, arr) => {
          const href_ = [...arr].slice(0, i + 1).join("/");

          return (
            <React.Fragment key={path}>
              <BreadcrumbItem className=" md:block">
                <BreadcrumbLink href={"/" + href_}>
                  {breadMap.get(path) ?? path}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {!(arr.length === i + 1) && (
                <BreadcrumbSeparator className=" md:block pt-1" />
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbContainer;
