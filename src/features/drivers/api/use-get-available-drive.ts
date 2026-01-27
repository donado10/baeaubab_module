import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetAvailableDriver = (filter: string[]) => {
	const query = useQuery({
		queryKey: ["available_drivers", JSON.stringify(filter)],
		queryFn: async () => {
			const response = await client.api.drivers.availableDriver.$get();

			if (!response.ok) {
				throw new Error("error when fetching drivers");
			}

			return await response.json();
		},
	});

	return query;
};

export default useGetAvailableDriver;
