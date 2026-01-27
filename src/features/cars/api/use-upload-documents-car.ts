import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<
  (typeof client.api.cars.uploadFile)["$post"]
>;
type ResponseType = InferResponseType<
  (typeof client.api.cars.uploadFile)["$post"]
>;

const useUploadDocumentCar = () => {
  const router = useRouter();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["upload_driver_cars"],
    mutationFn: async ({ form }) => {
      const res = await client.api.cars.uploadFile["$post"]({ form });

      if (!res.ok) {
        throw new Error("Failed to register a new car document!");
      }

      return await res.json();
    },
    onSuccess: () => {},
  });

  return mutation.mutateAsync;
};

export default useUploadDocumentCar;
