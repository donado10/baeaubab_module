"use client"

import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useEntrepriseDetailStore } from "../../store/entreprise-store";

type RequestType = InferRequestType<(typeof client.api.facture.generateFromBonLivraison)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.facture.generateFromBonLivraison)["$post"]>;

const useGenerateFacturesFromBonLivraison = () => {
    const store = useEntrepriseDetailStore()
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["generate_factures_from_bon_livraison"],
        mutationFn: async ({ json }) => {
            const res = await client.api.facture.generateFromBonLivraison.$post({ json });

            if (!res.ok) {
                throw new Error("Failed to generate factures!");
            }

            return await res.json();
        }
    });

    return mutation;
};

export default useGenerateFacturesFromBonLivraison;
