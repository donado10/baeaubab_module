import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetStatCar = () => {
	const query = useQuery({
		queryKey: ["stats_cars"],
		queryFn: async () => {
			const response = await client.api.cars.statsAvailability.$get();

			if (!response.ok) {
				throw new Error("error when fetching cars");
			}

			return await response.json();
		},
	});

	return query;
};

export default useGetStatCar;
