"use client"

import { client } from "@/lib/rpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<(typeof client.api.digitale.bonLivraison.getBonLivraisonDigital)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.digitale.bonLivraison.getBonLivraisonDigital)["$post"]>;

const useGetBonLivraisonDigital = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["get_bon_livraison_digital"],
        mutationFn: async ({ json }) => {
            const res = await client.api.digitale.bonLivraison.getBonLivraisonDigital.$post({ json });

            if (!res.ok) {
                throw new Error("Failed to load bls!");
            }



            const res_ = await res.json();


            return res_
        }
    });

    return mutation;
};

export default useGetBonLivraisonDigital;
