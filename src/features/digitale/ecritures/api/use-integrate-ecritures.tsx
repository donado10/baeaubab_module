"use client"

import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { useRouter } from "next/navigation";

const ecritureComptableClient = client.api["ecriture-comptable"];

type IntegrateBasePayload = {
    year: string;
    month: string;
    journal: string;
    database: string;
};

type IntegrateAllRequestType = {
    json: IntegrateBasePayload;
};
type IntegrateAllResponseType = InferResponseType<
    typeof ecritureComptableClient.integrateAll.$post
>;
type IntegrateSelectedRequestType = {
    json: IntegrateBasePayload & {
        refpieces: string[];
    };
};
type IntegrateSelectedResponseType = InferResponseType<
    typeof ecritureComptableClient.integrateSelected.$post
>;
type IntegrateOneRequestType = {
    json: IntegrateBasePayload & {
        refpiece: string;
    };
};
type IntegrateOneResponseType = InferResponseType<
    typeof ecritureComptableClient.integrateOne.$post
>;

async function invalidateEcritureQueries(queryClient: ReturnType<typeof useQueryClient>) {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ecritures"] }),
        queryClient.invalidateQueries({ queryKey: ["ecritures-stats"] }),
    ]);
}

export const useIntegrateAllEcritures = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation<IntegrateAllResponseType, Error, IntegrateAllRequestType>({
        mutationKey: ["integrate_all_ecritures"],
        mutationFn: async ({ json }) => {
            const response = await ecritureComptableClient.integrateAll.$post({
                json,
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'intégration des écritures");
            }

            return response.json();
        },
        onSuccess: async () => {
            await invalidateEcritureQueries(queryClient);
            router.refresh();
        },
    });
};

export const useIntegrateSelectedEcritures = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation<
        IntegrateSelectedResponseType,
        Error,
        IntegrateSelectedRequestType
    >({
        mutationKey: ["integrate_selected_ecritures"],
        mutationFn: async ({ json }) => {
            const response = await ecritureComptableClient.integrateSelected.$post({
                json,
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'intégration des écritures sélectionnées");
            }

            return response.json();
        },
        onSuccess: async () => {
            await invalidateEcritureQueries(queryClient);
            router.refresh();
        },
    });
};

export const useIntegrateOneEcriture = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation<IntegrateOneResponseType, Error, IntegrateOneRequestType>({
        mutationKey: ["integrate_one_ecriture"],
        mutationFn: async ({ json }) => {
            const response = await ecritureComptableClient.integrateOne.$post({
                json,
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'intégration de l'écriture");
            }

            return response.json();
        },
        onSuccess: async () => {
            await invalidateEcritureQueries(queryClient);
            router.refresh();
        },
    });
};