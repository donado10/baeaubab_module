"use client"

import { ToastInfo, ToastSuccess } from "@/components/ToastComponents";
import { client } from "@/lib/rpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEcritureEnteteLigneStore } from "../store/store";

type RequestType = InferRequestType<(typeof client.api.digitale.ecritures)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.digitale.ecritures)["$post"]>;

const useLoadEcritures = () => {
    const router = useRouter();
    const store = useEcritureEnteteLigneStore();
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
            /* toast(() => (
                <div className="bg-blue-500">
                    View{' '}
                    <a href="https://animations.dev/" target="_blank">
                        Animation on the Web
                    </a>
                </div>
            ),
                {
                    description: () => <button>This is a button element!</button>,
                    duration: Infinity
                }); */
            router.refresh();
        },
    });

    return mutation;
};

export default useLoadEcritures;
