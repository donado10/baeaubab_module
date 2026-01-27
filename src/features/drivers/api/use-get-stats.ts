import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetStatDriver = () => {
	const query = useQuery({
		queryKey: ["stats_drivers"],
		queryFn: async () => {
			const response = await client.api.drivers.statsAvailability.$get();

			if (!response.ok) {
				throw new Error("error when fetching drivers");
			}

			return await response.json();
		},
	});

	return query;
};

export default useGetStatDriver;
