import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ToastError, ToastSuccess } from "@/components/ToastComponents";

type ResponseType = InferResponseType<(typeof client.api.auth.logout)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.auth.logout)["$post"]>;

const useLogout = () => {
    const router = useRouter();
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["logout"],
        mutationFn: async () => {
            const res = await client.api.auth.logout["$post"]();

            if (!res.ok) {
                throw new Error("Logout failed");
            }
            return res.json();
        },
        onSuccess: () => {
            toast(<ToastSuccess toastTitle="Déconnexion réussie !" />, {
                style: {
                    backgroundColor: "green",
                },
            });
            router.push("/sign-in");
            router.refresh();
        },
        onError: () => {
            toast(<ToastError toastTitle="Déconnexion échouée !" />, {
                style: {
                    backgroundColor: "red",
                },
            });
        },
    });
    return mutation;
};

export default useLogout;
