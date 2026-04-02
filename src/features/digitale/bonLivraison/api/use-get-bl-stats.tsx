import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { use } from "react";

const useGetBillStats = (year: string, month: string) => {
    const pathname = usePathname()
    const query = useQuery({
        queryKey: ["bill_stats", year, month],
        queryFn: async ({ }) => {
            const response = await client.api.digitale.bonLivraison[":year"][":month"].$get({
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

export default useGetBillStats;
