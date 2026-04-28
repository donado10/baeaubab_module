"use client"

import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api)["facture"]["cancelFactures"]["$post"]>;
type ResponseType = InferResponseType<(typeof client.api)["facture"]["cancelFactures"]["$post"]>;

const useCancelFactures = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["cancel_factures"],
        mutationFn: async ({ json }) => {
            const res = await client.api["facture"].cancelFactures.$post({ json });

            if (!res.ok) {
                throw new Error("Échec de l'annulation des factures !");
            }

            return await res.json();
        },
    });

    return mutation;
};

export default useCancelFactures;
