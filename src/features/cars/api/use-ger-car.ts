import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetCar = (car_no: string) => {
	const query = useQuery({
		queryKey: ["single_car"],
		queryFn: async ({}) => {
			const response = await client.api.cars[":car"].$get({
				param: { car: car_no },
			});

			if (!response.ok) {
				throw new Error("error when fetching car");
			}

			return await response.json();
		},
	});

	return query;
};

export default useGetCar;
