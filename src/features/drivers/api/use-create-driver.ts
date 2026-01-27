import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<(typeof client.api.drivers)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.drivers)["$post"]>;

const useCreateDriver = () => {
  const router = useRouter();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["create_driver"],
    mutationFn: async ({ json }) => {
      const res = await client.api.drivers["$post"]({ json });

      if (!res.ok) {
        throw new Error("Failed to register a new driver!");
      }

      return res.json();
    },
    onSuccess: () => {
      router.refresh();
    },
  });

  return mutation;
};

export default useCreateDriver;
