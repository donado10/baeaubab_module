import { ToastError, ToastSuccess } from "@/components/ToastComponents";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.features.create)["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.features.create)["$post"]
>;

const useCreateFeature = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["create_feature"],
    mutationFn: async ({ json }) => {
      const response = await client.api.features.create["$post"]({ json });

      if (!response.ok) {
        throw new Error("The feature creation has failed");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast(<ToastSuccess toastTitle="Feature crée !" />, {
        style: {
          backgroundColor: "green",
        },
      });
      queryClient.invalidateQueries({ queryKey: ["list_features"] });
    },
    onError: () => {
      toast(<ToastError toastTitle="Feature non crée !" />, {
        style: {
          backgroundColor: "red",
        },
      });
    },
  });

  return mutation;
};

export default useCreateFeature;
