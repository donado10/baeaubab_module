import { ToastError, ToastSuccess } from "@/components/ToastComponents";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.features.update)["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.features.update)["$post"]
>;

const useUpdateFeature = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["update_feature"],
    mutationFn: async ({ json }) => {
      const response = await client.api.features.update["$post"]({ json });

      if (!response.ok) {
        throw new Error("The feature edit has failed");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast(<ToastSuccess toastTitle="Feature modifié !" />, {
        style: {
          backgroundColor: "green",
        },
      });
      queryClient.invalidateQueries({ queryKey: ["list_features"] });
    },
    onError: () => {
      toast(<ToastError toastTitle="Feature non modifié !" />, {
        style: {
          backgroundColor: "red",
        },
      });
    },
  });

  return mutation;
};

export default useUpdateFeature;
