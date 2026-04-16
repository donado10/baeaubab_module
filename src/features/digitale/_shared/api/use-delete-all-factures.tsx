"use client"

import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api.facture.cancelAll)["$delete"]>;
type ResponseType = InferResponseType<(typeof client.api.facture.cancelAll)["$delete"]>;

const useDeleteFactures = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["delete_factures"],
        mutationFn: async ({ json }) => {
            const res = await client.api.facture.cancelAll.$delete({ json });

            if (!res.ok) {
                throw new Error("Failed to delete factures!");
            }

            const res_ = await res.json();


            return res_
        }
    });

    return mutation;
};

export default useDeleteFactures;
