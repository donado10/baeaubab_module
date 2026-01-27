import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<(typeof client.api.auth.register)["$post"]>;
type ResponseType = InferResponseType<
  (typeof client.api.auth.register)["$post"]
>;

const useRegister = () => {
  const router = useRouter();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["register"],
    mutationFn: async ({ json }) => {
      const res = await client.api.auth.register["$post"]({ json });

      if (!res.ok) {
        throw new Error("Failed to register a new user!");
      }

      return res.json();
    },
    onSuccess: () => {
      router.push("/sign-in");
      router.refresh();
    },
  });

  return mutation;
};

export default useRegister;
