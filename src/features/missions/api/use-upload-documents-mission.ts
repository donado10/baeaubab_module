import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<
  (typeof client.api.missions.uploadFile)["$post"]
>;
type ResponseType = InferResponseType<
  (typeof client.api.missions.uploadFile)["$post"]
>;

const useUploadDocumentMission = () => {
  const router = useRouter();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["upload_driver_missions"],
    mutationFn: async ({ form }) => {
      const res = await client.api.missions.uploadFile["$post"]({ form });

      if (!res.ok) {
        throw new Error("Failed to register a new mission document!");
      }

      return await res.json();
    },
    onSuccess: () => {},
  });

  return mutation.mutateAsync;
};

export default useUploadDocumentMission;
