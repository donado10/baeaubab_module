import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetEnterpriseBonLivraison = (en_no: string, year: string, month: string) => {
    const query = useQuery({
        queryKey: ["entreprise_bls", en_no, year, month],
        queryFn: async ({ }) => {
            const response =
                await client.api.digitale.bonLivraison.entreprise
                    .list.$get({
                        query: {
                            en_no: en_no,
                            year: year,
                            month: month,
                        },
                    });

            if (!response.ok) {
                throw new Error("error when fetching piece");
            }

            return await response.json();
        },
    });

    return query;
};

export default useGetEnterpriseBonLivraison;
