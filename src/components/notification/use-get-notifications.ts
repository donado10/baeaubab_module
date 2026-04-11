import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetNotifications = () => {
	const query = useQuery({
		queryKey: ["get-notification"],
		queryFn: async ({}) => {
			const response = await client.api["notification"].$get();

			if (!response.ok) {
				throw new Error("error when fetching piece");
			}

			return await response.json();
		},
	});

	return query;
};

export default useGetNotifications;
