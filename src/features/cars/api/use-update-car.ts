import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<(typeof client.api.cars)["$put"]>;
type ResponseType = InferResponseType<(typeof client.api.cars)["$put"]>;

const useUpdateCar = () => {
	const router = useRouter();
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationKey: ["update_driver"],
		mutationFn: async ({ json }) => {
			const res = await client.api.cars["$put"]({ json });

			if (!res.ok) {
				throw new Error("Failed to update a car!");
			}

			return res.json();
		},
		onSuccess: () => {
			router.refresh();
		},
	});

	return mutation;
};

export default useUpdateCar;
