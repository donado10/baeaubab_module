import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetMissionInfoTable = () => {
  const query = useQuery({
    queryKey: ["Missions_info_table"],
    queryFn: async () => {
      const response = await client.api.missions.missionsInfoTable.$get();

      if (!response.ok) {
        throw new Error("error when fetching Missions");
      }

      return await response.json();
    },
  });

  return query;
};

export default useGetMissionInfoTable;
