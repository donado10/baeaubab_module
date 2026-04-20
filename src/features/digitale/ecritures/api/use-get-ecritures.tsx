import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetEcrituresProps {
    year: number;
    month: number;
}

export const useGetEcritures = ({ year, month }: UseGetEcrituresProps) => {
    const query = useQuery({
        queryKey: ["ecritures", year, month],
        queryFn: async () => {
            const response = await client.api["ecriture-comptable"].$get({
                query: {
                    year: year.toString(),
                    month: month.toString(),
                },
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des écritures");
            }

            const { results } = await response.json();

            return results;
        },
        enabled: !!year && !!month,
    });

    return query;
};