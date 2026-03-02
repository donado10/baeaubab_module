"use client"

import { client } from "@/lib/rpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<(typeof client.api.digitale.ecritures.integrateBills)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.digitale.ecritures.integrateBills)["$post"]>;

const useIntegrateBills = () => {
    const router = useRouter();
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["integrate_bills"],
        mutationFn: async ({ json }) => {
            const res = await client.api.digitale.ecritures.integrateBills.$post({ json });

            if (!res.ok) {
                throw new Error("Failed to integrate ecritures!");
            }

            return res.json();
        },
        onSuccess: () => {
            router.refresh();
        },
    });

    return mutation;
};

export default useIntegrateBills;
