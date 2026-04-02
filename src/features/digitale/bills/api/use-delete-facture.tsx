"use client"

import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api.digitale.facture.some)["$delete"]>;
type ResponseType = InferResponseType<(typeof client.api.digitale.facture.some)["$delete"]>;

const useDeleteSomeFactures = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["delete_some_factures"],
        mutationFn: async ({ json }) => {
            console.log(json)
            const res = await client.api.digitale.facture.some.$delete({ json });

            if (!res.ok) {
                throw new Error("Failed to generate factures!");
            }



            const res_ = await res.json();


            return res_
        }
    });

    return mutation;
};

export default useDeleteSomeFactures;
