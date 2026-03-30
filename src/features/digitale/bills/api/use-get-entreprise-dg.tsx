import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetEntrepriseDG = (en_no: string) => {
    const query = useQuery({
        queryKey: ["entreprise_dg", en_no],
        queryFn: async ({ }) => {
            const response =
                await client.api.digitale.bonLivraison.entreprise
                    .dg.$get({
                        query: {
                            en_no: en_no,
                        },
                    });

            if (!response.ok) {
                throw new Error("error when fetching entreprise dg");
            }

            return await response.json();
        },
    });

    return query;
};

export default useGetEntrepriseDG;
