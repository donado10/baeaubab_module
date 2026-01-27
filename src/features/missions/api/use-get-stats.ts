import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetStatMission = () => {
	const query = useQuery({
		queryKey: ["stats_missions"],
		queryFn: async () => {
			const response = await client.api.missions.statsStatus.$get();

			if (!response.ok) {
				throw new Error("error when fetching missions");
			}

			return await response.json();
		},
	});

	return query;
};

export default useGetStatMission;
