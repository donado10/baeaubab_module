"use client"

import { ToastInfo, ToastSuccess } from "@/components/ToastComponents";
import { client } from "@/lib/rpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEcritureEnteteLigneStore } from "../store/store";

type RequestTypeSage = InferRequestType<(typeof client.api.digitale.ecritures.sage)["$post"]>;
type ResponseTypeSage = InferResponseType<(typeof client.api.digitale.ecritures.sage)["$post"]>;
type RequestTypeDigital = InferRequestType<(typeof client.api.digitale.ecritures.digital)["$post"]>;
type ResponseTypeDigital = InferResponseType<(typeof client.api.digitale.ecritures.digital)["$post"]>;

export const useLoadEcrituresFromSage = () => {
    const router = useRouter();
    const store = useEcritureEnteteLigneStore();
    const mutation = useMutation<ResponseTypeSage, Error, RequestTypeSage>({
        mutationKey: ["load_ecritures_digitales_from_sage"],
        mutationFn: async ({ json }) => {
            const res = await client.api.digitale.ecritures.sage.$post({ json });

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
export const useLoadEcrituresFromDigital = () => {
    const router = useRouter();
    const store = useEcritureEnteteLigneStore();
    const mutation = useMutation<ResponseTypeDigital, Error, RequestTypeDigital>({
        mutationKey: ["load_ecritures_digitales_from_digital"],
        mutationFn: async ({ json }) => {
            const res = await client.api.digitale.ecritures.digital.$post({ json });

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

