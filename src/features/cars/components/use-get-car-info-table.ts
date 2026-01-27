import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetCarInfoTable = () => {
  const query = useQuery({
    queryKey: ["cars_info_table"],
    queryFn: async () => {
      const response = await client.api.cars.carsInfoTable.$get();

      if (!response.ok) {
        throw new Error("error when fetching drivers");
      }

      return await response.json();
    },
  });

  return query;
};

export default useGetCarInfoTable;
