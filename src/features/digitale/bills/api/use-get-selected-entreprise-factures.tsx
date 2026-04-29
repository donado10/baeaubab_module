import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetSelectedEntrepriseFactures = (en_list: string[], year: string, month: string, type: "general" | "all" = "general") => {
    const query = useQuery({
        queryKey: ["entreprises_factures", en_list, year, month],
        queryFn: async ({ }) => {
            const response =
                await client.api["facture"].selectedEntreprises
                    .$get({
                        query: {
                            en_list: en_list.join(','),
                            year: year,
                            month: month,
                            type: type,
                        },
                    });

            if (!response.ok) {
                throw new Error("error when fetching factures");
            }

            return await response.json();
        },
        enabled: !!en_list && !!year && !!month,
    });

    return query;
};

export default useGetSelectedEntrepriseFactures;
