import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<
  (typeof client.api.drivers.deleteFile)["$delete"]
>;
type ResponseType = InferResponseType<
  (typeof client.api.drivers.deleteFile)["$delete"]
>;

const useDeleteDocumentDriver = () => {
  const router = useRouter();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["delete_driver_documents"],
    mutationFn: async ({ json }) => {
      const res = await client.api.drivers.deleteFile["$delete"]({ json });

      if (!res.ok) {
        throw new Error("Failed to delete a new driver!");
      }

      return await res.json();
    },
    onSuccess: () => {},
  });

  return mutation.mutateAsync;
};

export default useDeleteDocumentDriver;
