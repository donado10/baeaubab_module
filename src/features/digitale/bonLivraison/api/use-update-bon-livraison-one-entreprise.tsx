"use client"

import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api["bon-livraison"]["updateBonLivraisonOne"])["$post"]>;
type ResponseType = InferResponseType<(typeof client.api["bon-livraison"]["updateBonLivraisonOne"])["$post"]>;

const useUpdateBonLivraisonOneEntreprise = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["update_bon_livraison_one_entreprise"],
        mutationFn: async ({ json }) => {
            const res = await client.api["bon-livraison"]["updateBonLivraisonOne"]["$post"]({ json });

            if (!res.ok) {
                const errorBody = await res.json().catch(() => null);
                throw new Error(errorBody?.error ?? "Failed to update one bon livraison!");
            }

            return await res.json();
        },
    });

    return mutation;
};

export default useUpdateBonLivraisonOneEntreprise;