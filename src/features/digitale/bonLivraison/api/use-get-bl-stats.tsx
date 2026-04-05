import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetBonLivraisonStats = (year: string, month: string) => {
    const query = useQuery({
        queryKey: ["get-bon-livraison-stats", year, month],
        queryFn: async ({ }) => {
            const response = await client.api["bon-livraison"].stats[":year"][":month"].$get({
                param: {
                    month: month,
                    year: year
                }
            });

            if (!response.ok) {
                throw new Error("error when fetching piece");
            }

            return await response.json();
        },
    });

    return query;
};

export default useGetBonLivraisonStats;
