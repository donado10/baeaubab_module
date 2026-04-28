"use client"

import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api)["facture"]["cancelFacture"]["$post"]>;
type ResponseType = InferResponseType<(typeof client.api)["facture"]["cancelFacture"]["$post"]>;

const useCancelFacture = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["cancel_facture"],
        mutationFn: async ({ json }) => {
            const res = await client.api["facture"].cancelFacture.$post({ json });

            if (!res.ok) {
                throw new Error("Échec de l'annulation de la facture !");
            }

            return await res.json();
        },
    });

    return mutation;
};

export default useCancelFacture;
