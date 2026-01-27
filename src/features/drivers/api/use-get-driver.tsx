import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetDriver = (driver_no: string) => {
    const query = useQuery({
        queryKey: ["single_driver"],
        queryFn: async ({ }) => {
            const response = await client.api.drivers[":driver"].$get({ param: { driver: driver_no } });

            if (!response.ok) {
                throw new Error("error when fetching driver");
            }

            return await response.json();
        },
    });

    return query;
};

export default useGetDriver;
