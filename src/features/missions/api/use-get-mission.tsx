import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetMission = (mission_no: string) => {
    const query = useQuery({
        queryKey: ["single_mission"],
        queryFn: async ({ }) => {
            const response = await client.api.missions[":mission"].$get({ param: { mission: mission_no } });

            if (!response.ok) {
                throw new Error("error when fetching mission");
            }

            return await response.json();
        },
    });

    return query;
};

export default useGetMission;
