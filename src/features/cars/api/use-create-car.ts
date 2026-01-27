import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<(typeof client.api.cars)["$post"]>;
type ResponseType = InferResponseType<(typeof client.api.cars)["$post"]>;

const useCreateCar = () => {
  const router = useRouter();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["create_car"],
    mutationFn: async ({ json }) => {
      const res = await client.api.cars["$post"]({ json });

      if (!res.ok) {
        throw new Error("Failed to register a new car!");
      }

      return res.json();
    },
    onSuccess: () => {
      router.refresh();
    },
  });

  return mutation;
};

export default useCreateCar;
