"use client"

import { client } from "@/lib/rpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<(typeof client.api.digitale.ecritures)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.digitale.ecritures)["$post"]>;

const useLoadEcritures = () => {
    const router = useRouter();
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["load_ecritures_digitales"],
        mutationFn: async ({ json }) => {
            const res = await client.api.digitale.ecritures.$post({ json });

            if (!res.ok) {
                throw new Error("Failed to load ecritures!");
            }

            return res.json();
        },
        onSuccess: () => {
            router.refresh();
        },
    });

    return mutation;
};

export default useLoadEcritures;
