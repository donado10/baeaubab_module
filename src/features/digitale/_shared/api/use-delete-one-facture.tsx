"use client"

import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api.facture.cancelSingle)["$delete"]>;
type ResponseType = InferResponseType<(typeof client.api.facture.cancelSingle)["$delete"]>;

const useDeleteSingleFacture = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["delete_single_facture"],
        mutationFn: async ({ json }) => {
            const res = await client.api.facture.cancelSingle.$delete({ json });

            if (!res.ok) {
                throw new Error("Failed to delete facture!");
            }

            const res_ = await res.json();


            return res_
        }
    });

    return mutation;
};

export default useDeleteSingleFacture;
