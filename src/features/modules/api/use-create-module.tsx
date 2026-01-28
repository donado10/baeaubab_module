import { ToastError, ToastSuccess } from "@/components/ToastComponents";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.modules.create)["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.modules.create)["$post"]
>;

const useCreateModule = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["create_module"],
    mutationFn: async ({ json }) => {
      const response = await client.api.modules.create["$post"]({ json });

      if (!response.ok) {
        throw new Error("The module creation has failed");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast(<ToastSuccess toastTitle="Module crée !" />, {
        style: {
          backgroundColor: "green",
        },
      });
      queryClient.invalidateQueries({ queryKey: ["list_modules"] });
    },
    onError: () => {
      toast(<ToastError toastTitle="Module non crée !" />, {
        style: {
          backgroundColor: "red",
        },
      });
    },
  });

  return mutation;
};

export default useCreateModule;
