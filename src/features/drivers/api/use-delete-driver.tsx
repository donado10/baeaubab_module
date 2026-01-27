import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ToastSuccess } from "@/components/ToastComponents";

type RequestType = InferRequestType<
	(typeof client.api.drivers)[":driverId"]["$delete"]
>;
type ResponseType = InferResponseType<
	(typeof client.api.drivers)[":driverId"]["$delete"]
>;

const useDeleteDriver = () => {
	const router = useRouter();
	const queryClient = useQueryClient();

	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationKey: ["delete_driver"],
		mutationFn: async ({ param }) => {
			const res = await client.api.drivers[":driverId"]["$delete"]({
				param: { driverId: param.driverId },
			});

			if (!res.ok) {
				throw new Error("Failed to delete a  driver!");
			}

			return await res.json();
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["drivers_info_table"],
			});
			toast(<ToastSuccess toastTitle="Chauffeur supprimé !" />, {
				style: {
					backgroundColor: "green",
				},
			});
			router.refresh();
		},
	});

	return mutation.mutateAsync;
};

export default useDeleteDriver;
