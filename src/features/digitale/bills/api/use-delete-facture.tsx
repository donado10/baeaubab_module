"use client"

import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api.digitale.facture.all)["$delete"]>;
type ResponseType = InferResponseType<(typeof client.api.digitale.facture.all)["$delete"]>;

const useDeleteFactureByDocument = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["delete_facture_by_document"],
        mutationFn: async ({ json }) => {
            console.log(json)
            const res = await client.api.facture.cancelByDocument.$delete({ json });

            if (!res.ok) {
                throw new Error("Failed to delete factures!");
            }



            const res_ = await res.json();


            return res_
        }
    });

    return mutation;
};

export default useDeleteFactureByDocument;
