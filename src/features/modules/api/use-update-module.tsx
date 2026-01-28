import { ToastError, ToastSuccess } from "@/components/ToastComponents";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.modules.update)["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.modules.update)["$post"]
>;

const useUpdateModule = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["update_module"],
    mutationFn: async ({ json }) => {
      const response = await client.api.modules.update["$post"]({ json });

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

export default useUpdateModule;
