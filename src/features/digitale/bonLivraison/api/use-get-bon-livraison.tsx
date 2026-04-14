import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetBonLivraisonStatsByCompany = (year: string, month: string) => {
    const query = useQuery({
        queryKey: ["get-bon-livraison-stats-by-company", year, month],
        queryFn: async ({ }) => {
            const response =
                await client.api["bon-livraison"].stats.$get({
                    query: {
                        year: year,
                        month: month,
                    },
                });

            if (!response.ok) {
                throw new Error("error when fetching the delivery note");
            }

            return await response.json();
        },
        enabled: !!year && !!month,
    });

    return query;
};

export default useGetBonLivraisonStatsByCompany;
