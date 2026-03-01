"use client"

import { client } from "@/lib/rpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import useLoadEcrituresCheckBills from "./use-load-ecritures-check-bills";
import { EStatus, useEcritureEnteteLigneStore } from "../store/store";
import { toast } from "sonner";
import JobWatcher from "../components/JobWatcher";

type RequestType = InferRequestType<(typeof client.api.digitale.ecritures.correctBills)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.digitale.ecritures.correctBills)["$post"]>;

const useCorrectBills = () => {
    const router = useRouter();
    const store = useEcritureEnteteLigneStore()
    const { mutate: mutateCheckBills } = useLoadEcrituresCheckBills()
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["correct_bills"],
        mutationFn: async ({ json }) => {
            const res = await client.api.digitale.ecritures.correctBills.$post({ json });

            if (!res.ok) {
                throw new Error("Failed to correct ecritures!");
            }

            return res.json();
        },
    });

    return mutation;
};

export default useCorrectBills;
