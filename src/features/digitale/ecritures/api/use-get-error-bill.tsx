import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetErrorBill = (refpiece: string) => {
    const query = useQuery({
        queryKey: ["error_bill", refpiece],
        queryFn: async ({ }) => {
            const response = await client.api.digitale.ecritures.error[":refpiece"].$get({
                param: { refpiece: refpiece },
            });

            if (!response.ok) {
                throw new Error("error when fetching piece");
            }

            return await response.json();
        },
    });

    return query;
};

export default useGetErrorBill;
