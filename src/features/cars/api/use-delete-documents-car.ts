import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<
  (typeof client.api.cars.deleteFile)["$delete"]
>;
type ResponseType = InferResponseType<
  (typeof client.api.cars.deleteFile)["$delete"]
>;

const useDeleteDocumentCar = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["delete_car_documents"],
    mutationFn: async ({ json }) => {
      const res = await client.api.cars.deleteFile["$delete"]({ json });

      if (!res.ok) {
        throw new Error("Failed to delete a car driver!");
      }

      return await res.json();
    },
    onSuccess: () => {},
  });

  return mutation.mutateAsync;
};

export default useDeleteDocumentCar;
