import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetModule = (moduleId: string) => {
    const query = useQuery({
        queryKey: ["single_module"],
        queryFn: async () => {
            const response = await client.api.modules[":moduleId"].$get({ param: { moduleId: moduleId } });

            if (!response.ok) {
                throw new Error("error when fetching modules");
            }

            return (await response.json()).modules;
        },
    });

    return query;
};

export default useGetModule;
