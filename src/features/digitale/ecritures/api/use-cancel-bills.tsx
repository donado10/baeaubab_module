"use client"

import { client } from "@/lib/rpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import useLoadEcrituresCheckBills from "./use-load-ecritures-check-bills";
import { EStatus, useEcritureEnteteLigneStore } from "../store/store";
import { toast } from "sonner";
import JobWatcher from "../components/JobWatcher";

type RequestType = InferRequestType<(typeof client.api.digitale.ecritures.bills)["$delete"]>;
type ResponseType = InferResponseType<(typeof client.api.digitale.ecritures.bills)["$delete"]>;

const useCancelBills = () => {
    const router = useRouter();
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["delete_bills"],
        mutationFn: async ({ json }) => {
            const res = await client.api.digitale.ecritures.bills.$delete({ json });

            if (!res.ok) {
                throw new Error("Failed to delete ecritures!");
            }

            return res.json();
        },
        onSuccess: () => {
            router.refresh()

        }
    });

    return mutation;
};

export default useCancelBills;
