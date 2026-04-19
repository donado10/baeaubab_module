"use client"

import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<(typeof client.api)["ecriture-comptable"]["fromSelectedFactures"]["$post"]>;
type ResponseType = InferResponseType<(typeof client.api)["ecriture-comptable"]["fromSelectedFactures"]["$post"]>;

const useGenerateEcrituresFromSelectedFactures = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["generate_ecritures_from_selected_factures"],
        mutationFn: async ({ json }) => {
            const res = await client.api["ecriture-comptable"].fromSelectedFactures.$post({ json });

            if (!res.ok) {
                throw new Error("Échec de la génération des écritures !");
            }

            return await res.json();
        },
    });

    return mutation;
};

export default useGenerateEcrituresFromSelectedFactures;
