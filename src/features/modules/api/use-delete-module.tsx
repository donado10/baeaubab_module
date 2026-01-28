import { ToastError, ToastSuccess } from "@/components/ToastComponents";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.modules.delete)["$delete"]
>;
type RequestType = InferRequestType<
  (typeof client.api.modules.delete)["$delete"]
>;

const useDeleteModule = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["delete_module"],
    mutationFn: async ({ json }) => {
      const response = await client.api.modules.delete["$delete"]({ json });

      if (!response.ok) {
        throw new Error("The module delete has failed");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast(<ToastSuccess toastTitle="Module supprimé !" />, {
        style: {
          backgroundColor: "green",
        },
      });
      queryClient.invalidateQueries({ queryKey: ["list_modules"] });
    },
    onError: () => {
      toast(<ToastError toastTitle="Module non supprimé !" />, {
        style: {
          backgroundColor: "red",
        },
      });
    },
  });

  return mutation;
};

export default useDeleteModule;
