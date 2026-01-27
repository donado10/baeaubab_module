import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<(typeof client.api.missions)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.missions)["$post"]>;

const useCreateMission = () => {
  const router = useRouter();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["create_mission"],
    mutationFn: async ({ json }) => {
      const res = await client.api.missions["$post"]({ json });

      if (!res.ok) {
        throw new Error("Failed to register a new mission!");
      }

      return res.json();
    },
    onSuccess: () => {
      router.refresh();
    },
  });

  return mutation;
};

export default useCreateMission;
