import { ToastError, ToastSuccess } from "@/components/ToastComponents";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.features.delete)["$delete"]
>;
type RequestType = InferRequestType<
  (typeof client.api.features.delete)["$delete"]
>;

const useDeleteFeature = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["delete_feature"],
    mutationFn: async ({ json }) => {
      const response = await client.api.features.delete["$delete"]({ json });

      if (!response.ok) {
        throw new Error("The feature delete has failed");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast(<ToastSuccess toastTitle="Feature supprimé !" />, {
        style: {
          backgroundColor: "green",
        },
      });
      queryClient.invalidateQueries({ queryKey: ["list_features"] });
    },
    onError: () => {
      toast(<ToastError toastTitle="Feature non supprimé !" />, {
        style: {
          backgroundColor: "red",
        },
      });
    },
  });

  return mutation;
};

export default useDeleteFeature;
