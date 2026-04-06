import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

const useGetFactureStats = (year: string, month: string) => {
    const query = useQuery({
        queryKey: ["get-facture-stats", year, month],
        queryFn: async ({ }) => {
            const response = await client.api.facture[":year"][":month"].$get({
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

export default useGetFactureStats;
