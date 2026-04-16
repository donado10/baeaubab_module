"use client"

import { client } from "@/lib/rpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api.facture.generateByEntreprise)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.facture.generateByEntreprise)["$post"]>;

const useGenerateFacturesByEntreprise = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["generate_factures_by_entreprise"],
        mutationFn: async ({ json }) => {
            const res = await client.api.facture.generateByEntreprise.$post({ json });

            if (!res.ok) {
                throw new Error("Failed to generate factures!");
            }



            const res_ = await res.json();


            return res_
        }

    });

    return mutation;
};

export default useGenerateFacturesByEntreprise;
