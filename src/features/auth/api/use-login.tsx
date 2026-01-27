import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ToastError, ToastSuccess } from "@/components/ToastComponents";

type ResponseType = InferResponseType<(typeof client.api.auth.login)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.auth.login)["$post"]>;

const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationKey: ["login"],
    mutationFn: async ({ json }) => {
      const res = await client.api.auth.login["$post"]({ json });

      if (!res.ok) {
        throw new Error("Login failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast(<ToastSuccess toastTitle="Connexion réussie !" />, {
        style: {
          backgroundColor: "green",
        },
      });
      queryClient.invalidateQueries({ queryKey: ["current"] });
      router.push("/home");
      router.refresh();
    },
    onError: () => {
      toast(<ToastError toastTitle="Connexion échouée !" />, {
        style: {
          backgroundColor: "red",
        },
      });
    },
  });
  return mutation;
};

export default useLogin;
