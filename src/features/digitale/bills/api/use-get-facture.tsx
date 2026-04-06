import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetFactureStatsByCompany = (year: string, month: string) => {
    const query = useQuery({
        queryKey: ["get-facture-stats-by-company", year, month],
        queryFn: async ({ }) => {
            const response = await client.api["facture"].stats.$get({
                query: {
                    month: month,
                    year: year
                }
            });

            if (!response.ok) {
                throw new Error("error when fetching piece");
            }

            return await response.json();
        },
        enabled: !!year && !!month,
    });

    return query;
};

export default useGetFactureStatsByCompany;
