"use client"

import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api)["facture"]["cancelSelectedFactures"]["$post"]>;
type ResponseType = InferResponseType<(typeof client.api)["facture"]["cancelSelectedFactures"]["$post"]>;

const useCancelSelectedFactures = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["cancel_selected_factures"],
        mutationFn: async ({ json }) => {
            const res = await client.api["facture"].cancelSelectedFactures.$post({ json });

            if (!res.ok) {
                throw new Error("Échec de l'annulation des factures sélectionnées !");
            }

            return await res.json();
        },
    });

    return mutation;
};

export default useCancelSelectedFactures;
