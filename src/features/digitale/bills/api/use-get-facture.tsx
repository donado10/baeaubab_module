"use client"

import { client } from "@/lib/rpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api.digitale.facture)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.digitale.facture)["$post"]>;

const useGetFactureStatsByCompany = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["get_facture"],
        mutationFn: async ({ json }) => {
            console.log(json)
            const res = await client.api.digitale.facture.$post({ json });

            if (!res.ok) {
                throw new Error("Failed to load bls!");
            }



            const res_ = await res.json();


            return res_
        }
    });

    return mutation;
};

export default useGetFactureStatsByCompany;
