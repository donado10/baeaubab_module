"use client"

import { client } from "@/lib/rpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { useEntrepriseBonLivraisonStore } from "../store/store";

type RequestType = InferRequestType<(typeof client.api.digitale.bonLivraison)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.digitale.bonLivraison)["$post"]>;

const useGetBonLivraison = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["get_bon_livraison"],
        mutationFn: async ({ json }) => {
            console.log(json)
            const res = await client.api.digitale.bonLivraison.$post({ json });

            if (!res.ok) {
                throw new Error("Failed to load bls!");
            }



            const res_ = await res.json();


            return res_
        }
    });

    return mutation;
};

export default useGetBonLivraison;
