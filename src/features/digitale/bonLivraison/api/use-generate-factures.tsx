"use client"

import { client } from "@/lib/rpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api.facture.generate)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.facture.generate)["$post"]>;

const useGenerateFactures = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["generate_factures"],
        mutationFn: async ({ json }) => {
            const res = await client.api.facture.generate.$post({ json });

            if (!res.ok) {
                throw new Error("Failed to generate factures!");
            }



            const res_ = await res.json();


            return res_
        }
    });

    return mutation;
};

export default useGenerateFactures;
