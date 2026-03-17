"use client"

import { client } from "@/lib/rpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<(typeof client.api.digitale.ecritures.setBillsValid)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.digitale.ecritures.setBillsValid)["$post"]>;

const useSetValidateBills = () => {
    const router = useRouter();
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["set_valid_bills"],
        mutationFn: async ({ json }) => {
            const res = await client.api.digitale.ecritures.setBillsValid.$post({ json });

            if (!res.ok) {
                throw new Error("Failed to valid ecritures!");
            }

            return res.json();
        },
        onSuccess: () => {
            router.refresh();
        },
    });

    return mutation;
};

export default useSetValidateBills;
