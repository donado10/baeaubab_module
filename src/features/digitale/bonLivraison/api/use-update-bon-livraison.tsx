"use client"

import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api["bon-livraison"]["updateBonLivraisonByEntreprise"])["$post"]>;
type ResponseType = InferResponseType<(typeof client.api["bon-livraison"]["updateBonLivraisonByEntreprise"])["$post"]>;

const useUpdateBonLivraison = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["update_bon_livraison"],
        mutationFn: async ({ json }) => {
            const res = await client.api["bon-livraison"]["updateBonLivraisonByEntreprise"]["$post"]({ json });

            if (!res.ok) {
                throw new Error("Failed to load bls!");
            }

            const res_ = await res.json();


            return res_
        }
    });

    return mutation;
};

export default useUpdateBonLivraison;
