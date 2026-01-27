import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetMissionRessource = (car_no: string, em_no: string) => {
	const query = useQuery({
		queryKey: ["Missions_ressource", car_no, em_no],
		queryFn: async () => {
			const response = await client.api.missions.ressources[":em_no"][
				":car_no"
			].$get({ param: { car_no, em_no } });

			if (!response.ok) {
				throw new Error("error when fetching Missions ressources");
			}

			return await response.json();
		},
	});

	return query;
};

export default useGetMissionRessource;
