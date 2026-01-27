import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetAvailableCar = (filter: string[]) => {
	const query = useQuery({
		queryKey: ["available_cars", JSON.stringify(filter)],
		queryFn: async () => {
			const response = await client.api.cars.availableCar.$get();

			if (!response.ok) {
				throw new Error("error when fetching cars");
			}

			return await response.json();
		},
	});

	return query;
};

export default useGetAvailableCar;
