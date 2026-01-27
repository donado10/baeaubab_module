import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetDriverInfoTable = () => {
  const query = useQuery({
    queryKey: ["drivers_info_table"],
    queryFn: async () => {
      const response = await client.api.drivers.driversInfoTable.$get();

      if (!response.ok) {
        throw new Error("error when fetching drivers");
      }

      return await response.json();
    },
  });

  return query;
};

export default useGetDriverInfoTable;
