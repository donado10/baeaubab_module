import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetEnterpriseBonLivraison = (en_no: string, year: string, month: string) => {
    const query = useQuery({
        queryKey: ["entreprise_bls", en_no, year, month],
        queryFn: async ({ }) => {
            const response =
                await client.api["bon-livraison"].entreprise[en_no].$get({
                    query: {
                        year: year,
                        month: month,
                    },
                });

            if (!response.ok) {
                throw new Error("error when fetching piece");
            }

            return await response.json();
        },
        enabled: !!en_no && !!year && !!month,

    });

    return query;
};

export default useGetEnterpriseBonLivraison;
