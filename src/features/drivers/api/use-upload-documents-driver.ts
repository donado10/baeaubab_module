import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<
  (typeof client.api.drivers.uploadFile)["$post"]
>;
type ResponseType = InferResponseType<
  (typeof client.api.drivers.uploadFile)["$post"]
>;

const useUploadDocumentDriver = () => {
  const router = useRouter();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["upload_driver_documents"],
    mutationFn: async ({ form }) => {
      const res = await client.api.drivers.uploadFile["$post"]({ form });

      if (!res.ok) {
        throw new Error("Failed to register a new driver!");
      }

      return await res.json();
    },
    onSuccess: () => {},
  });

  return mutation.mutateAsync;
};

export default useUploadDocumentDriver;
