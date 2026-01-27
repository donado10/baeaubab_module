import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<(typeof client.api.drivers)["$put"]>;
type ResponseType = InferResponseType<(typeof client.api.drivers)["$put"]>;

const useUpdateDriver = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["update_driver"],
        mutationFn: async ({ json }) => {
            const res = await client.api.drivers["$put"]({ json });

            if (!res.ok) {
                throw new Error("Failed to update a driver!");
            }

            return res.json();
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["drivers_info_table"],
            });
            router.refresh();
        },
    });

    return mutation;
};

export default useUpdateDriver;
