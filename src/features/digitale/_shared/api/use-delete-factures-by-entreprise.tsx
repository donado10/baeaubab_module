"use client"

import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api.facture.cancelByEntreprise)["$delete"]>;
type ResponseType = InferResponseType<(typeof client.api.facture.cancelByEntreprise)["$delete"]>;

const useDeleteFacturesByEntreprise = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["delete_factures_by_entreprise"],
        mutationFn: async ({ json }) => {
            const res = await client.api.facture.cancelByEntreprise.$delete({ json });

            if (!res.ok) {
                throw new Error("Failed to delete factures!");
            }

            const res_ = await res.json();


            return res_
        }
    });

    return mutation;
};

export default useDeleteFacturesByEntreprise;
