import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetFeatures = () => {
  const query = useQuery({
    queryKey: ["list_features"],
    queryFn: async () => {
      const response = await client.api.features.$get();

      if (!response.ok) {
        throw new Error("error when fetching features");
      }

      return (await response.json()).features;
    },
  });

  return query;
};

export default useGetFeatures;
