import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetStatSingleMission = (mission_no: string) => {
    const query = useQuery({
        queryKey: ["stat_single_mission"],
        queryFn: async ({ }) => {
            const response = await client.api.missions.statMission[":miss_no"].$get({ param: { miss_no: mission_no } });

            if (!response.ok) {
                throw new Error("error when fetching stat single mission");
            }

            return await response.json();
        },

    });

    return query;
};

export default useGetStatSingleMission;
