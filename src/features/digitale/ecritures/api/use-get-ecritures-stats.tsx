import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";
import stats from "@/features/server/ecriture-comptable/stats";


interface UseGetEcrituresStatsProps {
    year: string;
    month: string;
}

export const useGetEcrituresStats = ({ year, month }: UseGetEcrituresStatsProps) => {
    return useQuery({
        queryKey: ["ecritures-stats", year, month],
        queryFn: async () => {
            const response = await client.api["ecriture-comptable"].stats.$get({
                query: { year, month },
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des statistiques");
            }

            return (await response.json());
        },
    });
};