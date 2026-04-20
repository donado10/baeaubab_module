"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IoDocumentTextOutline } from "react-icons/io5";
import { cn, getFrenchMonthName } from "@/lib/utils";
import { useEcritureEnteteLigneStore, EEcritureStatut } from "../../store/store";
import { useGetEcrituresStats } from "../../api/use-get-ecritures-stats";
import { useGetEcritures } from "../../api/use-get-ecritures";
import EcritureTableContainer from "../TableContainer";

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

const EcritureStatCard = ({
    title,
    count,
    background,
    text = "text-gray-700",
}: {
    title: string;
    count: number;
    background: string;
    text?: string;
}) => (
    <Card
        className={cn(
            "shadow-none p-4 gap-4 flex flex-row items-center justify-between",
            background
        )}
    >
        <div className="flex flex-col gap-4">
            <h1 className={cn("text-base font-normal", text)}>{title}</h1>
            <h2 className="font-bold text-3xl italic">{count}</h2>
        </div>
        <IoDocumentTextOutline width={1600} height={1600} size={40} />
    </Card>
);

// ---------------------------------------------------------------------------
// Stats container
// ---------------------------------------------------------------------------

type IEcrituresStats = { result: { total: number; valid: number; invalid: number } };

const EcritureStatsContainer = () => {
    const store = useEcritureEnteteLigneStore();
    const { data: rawData, isPending } = useGetEcrituresStats({
        year: store.periode[0] ?? "",
        month: store.periode[1] ?? "",
    });
    const data = rawData as IEcrituresStats | undefined;

    const empty = (
        <>
            <EcritureStatCard
                background="bg-primary text-white"
                text="text-white"
                title="Total Ecritures"
                count={0}
            />
            <EcritureStatCard
                background="bg-green-200"
                title="Ecritures Déversées"
                count={0}
            />
            <EcritureStatCard
                background="bg-gray-200"
                title="Ecritures Non Déversées"
                count={0}
            />
        </>
    );

    if (isPending || !data) return empty;

    return (
        <>
            <EcritureStatCard
                background="bg-primary text-white"
                text="text-white"
                title="Total Ecritures"
                count={data.result.total}
            />
            <EcritureStatCard
                background="bg-green-200"
                title="Ecritures Déversées"
                count={data.result.valid}
            />
            <EcritureStatCard
                background="bg-gray-200"
                title="Ecritures Non Déversées"
                count={data.result.invalid}
            />
        </>
    );
};

// ---------------------------------------------------------------------------
// Search + select type
// ---------------------------------------------------------------------------

const EcritureSelectType = ({
    onSetType,
    disabled,
}: {
    onSetType: (value: "facture" | "tiers") => void;
    disabled: boolean;
}) => {
    const [itemValue, setItemValue] = useState<"facture" | "tiers">("facture");

    return (
        <Select
            disabled={disabled}
            value={itemValue}
            onValueChange={(value) => {
                onSetType(value as "facture" | "tiers");
                setItemValue(value as "facture" | "tiers");
            }}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="type" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="facture">Référence</SelectItem>
                    <SelectItem value="tiers">Tiers</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};

const EcritureSearch = () => {
    const store = useEcritureEnteteLigneStore();

    return (
        <div className="flex items-center gap-4">
            <Input
                disabled={store.items.length <= 0}
                onChange={(e) =>
                    store.setFilter({
                        ...store.filter,
                        search: {
                            ...store.filter.search,
                            value: e.currentTarget.value,
                        },
                    })
                }
                className="w-64"
                placeholder="Rechercher"
            />
            <EcritureSelectType
                disabled={store.items.length <= 0}
                onSetType={(value) =>
                    store.setFilter({
                        ...store.filter,
                        search: { ...store.filter.search, type: value },
                    })
                }
            />
        </div>
    );
};

// ---------------------------------------------------------------------------
// Filter section
// ---------------------------------------------------------------------------

const EcritureFilterResumeCard = ({ value }: { value: string }) => (
    <span className="border-2 border-red-600 text-xs px-2 py-1 rounded-md text-red-600 font-semibold bg-red-600/20">
        {value}
    </span>
);

const EcritureFilterResume = () => {
    const store = useEcritureEnteteLigneStore();

    if (store.filter.status !== EEcritureStatut.ALL) return <></>;

    return (
        <ul className="flex items-center gap-4">
            {store.filter.invalide &&
                store.filter.invalide.map((value) => (
                    <li key={value}>
                        <EcritureFilterResumeCard value={value} />
                    </li>
                ))}
            {store.filter.ecart_conformite !== 0 && (
                <li key="ecart">
                    <EcritureFilterResumeCard
                        value={`ecart: ${store.filter.ecart_conformite}`}
                    />
                </li>
            )}
        </ul>
    );
};

const EcritureFilterSection = () => {
    const store = useEcritureEnteteLigneStore();
    const classNameButton =
        "p-0 hover:bg-transparent hover:text-primary/30 rounded-none";

    const statusButtons: { label: string; value: EEcritureStatut }[] = [
        { label: "Tout", value: EEcritureStatut.ALL },
        { label: "Déversé", value: EEcritureStatut.INTEGRE },
        { label: "Non Déversé", value: EEcritureStatut.ATTENTE },
    ];

    return (
        <div>
            <div className="border-b border-gray-200 flex items-center justify-between gap-8 p-2">
                <div className="border-gray-200 flex items-center gap-8">
                    {statusButtons.map(({ label, value }) => (
                        <Button
                            key={value}
                            variant="ghost"
                            className={cn(
                                classNameButton,
                                store.filter.status === value
                                    ? "text-primary border-b-2 border-primary"
                                    : "text-gray-500"
                            )}
                            onClick={() =>
                                store.setFilter({ ...store.filter, status: value })
                            }
                        >
                            {label}
                        </Button>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <EcritureSearch />
                </div>
            </div>
            <EcritureFilterResume />
        </div>
    );
};

// ---------------------------------------------------------------------------
// Button container (placeholder)
// ---------------------------------------------------------------------------

const EcritureButtonContainer = () => {
    return <div className="flex items-center gap-4" />;
};

// ---------------------------------------------------------------------------
// Display section
// ---------------------------------------------------------------------------

const EcritureSection = () => {
    const store = useEcritureEnteteLigneStore();

    useEffect(() => {
        store.clear();
    }, []);

    return (
        <section className="p-4 text-gray-700">
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl text-[#101010] font-bold">
                            Ecritures Comptables
                        </h1>
                        {store.periode.length > 0 && (
                            <h2 className="text-xs">
                                {getFrenchMonthName(Number(store.periode[1]))}{" "}
                                {store.periode[0]}
                            </h2>
                        )}
                    </div>
                    <div>
                        <EcritureButtonContainer />
                    </div>
                </div>
                <div className="h-32 mb-4 shadow-none grid grid-cols-3 gap-4">
                    <EcritureStatsContainer />
                </div>
            </div>
            <Card className="p-4 shadow-none">
                <div>
                    <EcritureFilterSection />
                </div>
                <div>
                    <EcritureTableContainer />
                </div>
            </Card>
        </section>
    );
};

// ---------------------------------------------------------------------------
// Container (data-fetching + URL sync)
// ---------------------------------------------------------------------------

const EcritureSectionContainer = () => {
    const store = useEcritureEnteteLigneStore();
    const searchParams = useSearchParams();
    const router = useRouter();

    const { data, isPending } = useGetEcritures({
        year: Number(store.periode[0]),
        month: Number(store.periode[1]),
    });

    // Sync store periode → URL
    useEffect(() => {
        if (store.periode.length === 0) return;
        router.push(
            `/m1/ecritures-comptables?year=${store.periode[0]}&month=${store.periode[1]}`
        );
    }, [JSON.stringify(store.periode)]);

    // Sync URL → store periode
    useEffect(() => {
        if (searchParams.get("year") && searchParams.get("month")) {
            store.setPeriode(
                searchParams.get("year")!,
                searchParams.get("month")!
            );
        }
    }, [searchParams.get("year"), searchParams.get("month")]);

    // Populate store items when data arrives
    useEffect(() => {
        if (isPending || !data) return;
        store.setItems(data);
    }, [JSON.stringify(data)]);

    return <EcritureSection />;
};

export default EcritureSectionContainer;
