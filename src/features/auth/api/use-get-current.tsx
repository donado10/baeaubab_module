import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetCurrent = () => {
    const query = useQuery({
        queryKey: ["get_current_user"],
        queryFn: async () => {
            const response = await client.api.auth.current.$get();

            if (!response.ok) {
                throw new Error("error when get user");
            }

            return await response.json();
        },
    });

    return query;
};

export default useGetCurrent;
