import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetModules = () => {
  const query = useQuery({
    queryKey: ["list_modules"],
    queryFn: async () => {
      const response = await client.api.modules.$get();

      if (!response.ok) {
        throw new Error("error when fetching modules");
      }

      return (await response.json()).modules;
    },
  });

  return query;
};

export default useGetModules;
