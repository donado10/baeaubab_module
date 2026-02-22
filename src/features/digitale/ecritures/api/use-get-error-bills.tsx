import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetErrorBills = () => {
    const query = useQuery({
        queryKey: ["error_bills"],
        queryFn: async ({ }) => {
            const response = await client.api.digitale.ecritures.errors.$get();

            if (!response.ok) {
                throw new Error("error when fetching piece");
            }

            return await response.json();
        },
    });

    return query;
};

export default useGetErrorBills;
