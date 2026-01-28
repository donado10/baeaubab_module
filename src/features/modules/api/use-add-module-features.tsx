import { ToastError, ToastSuccess } from "@/components/ToastComponents";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
    (typeof client.api.modules.addFeatures)["$post"]
>;
type RequestType = InferRequestType<
    (typeof client.api.modules.addFeatures)["$post"]
>;

const useAddModuleFeatures = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["add_module_features"],
        mutationFn: async ({ json }) => {
            const response = await client.api.modules.addFeatures["$post"]({ json });

            if (!response.ok) {
                throw new Error("The module edit has failed");
            }
            return await response.json();
        },
        onSuccess: () => {
            toast(<ToastSuccess toastTitle="Module modifié !" />, {
                style: {
                    backgroundColor: "green",
                },
            });
            queryClient.invalidateQueries({ queryKey: ["list_modules"] });
        },
        onError: () => {
            toast(<ToastError toastTitle="Module non modifié !" />, {
                style: {
                    backgroundColor: "red",
                },
            });
        },
    });

    return mutation;
};

export default useAddModuleFeatures;
