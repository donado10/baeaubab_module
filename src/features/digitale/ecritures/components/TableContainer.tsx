"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./Table/table";
import { useEcritureEnteteLigneStore, EEcritureStatut } from "../store/store";
import { z } from "zod";
import { ecritureSchema } from "../schema";

type IEcritureRow = z.infer<typeof ecritureSchema>;

const ecritureStatutByValide = new Map<number, EEcritureStatut>([
    [1, EEcritureStatut.INTEGRE],
    [0, EEcritureStatut.ATTENTE],
]);

const EcritureTableContainer = () => {
    const store = useEcritureEnteteLigneStore();
    const [ecritures, setEcritures] = useState<IEcritureRow[]>(store.items);

    useEffect(() => {
        const filterByStatus =
            store.filter.status !== EEcritureStatut.ALL
                ? store.items.filter(
                    (item) =>
                        ecritureStatutByValide.get(item.entete.EC_Valide) ===
                        store.filter.status
                )
                : [...store.items];

        const filterBySearch = store.filter.search?.value
            ? filterByStatus.filter((item) => {
                if (store.filter.search.type === "facture") {
                    return item.entete.EC_RefPiece.toLowerCase().includes(
                        store.filter.search.value.toLowerCase()
                    );
                }
                if (store.filter.search.type === "tiers") {
                    return item.entete.CT_Num.toLowerCase().includes(
                        store.filter.search.value.toLowerCase()
                    );
                }
                return true;
            })
            : [...filterByStatus];

        setEcritures(filterBySearch);
    }, [JSON.stringify(store.filter), JSON.stringify(store.items)]);

    return (
        <div className="flex flex-col gap-8">
            <DataTable data={ecritures} />
        </div>
    );
};

export default EcritureTableContainer;
