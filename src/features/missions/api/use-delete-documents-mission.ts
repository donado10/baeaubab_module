import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<
  (typeof client.api.missions.deleteFile)["$delete"]
>;
type ResponseType = InferResponseType<
  (typeof client.api.missions.deleteFile)["$delete"]
>;

const useDeleteDocumentMission = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["delete_mission_documents"],
    mutationFn: async ({ json }) => {
      const res = await client.api.missions.deleteFile["$delete"]({ json });

      if (!res.ok) {
        throw new Error("Failed to delete a mission !");
      }

      return await res.json();
    },
    onSuccess: () => {},
  });

  return mutation.mutateAsync;
};

export default useDeleteDocumentMission;
