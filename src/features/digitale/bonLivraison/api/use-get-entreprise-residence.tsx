import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetEntrepriseResidence = (en_no: string) => {
    const query = useQuery({
        queryKey: ["entreprise_residence", en_no],
        queryFn: async ({ }) => {
            const response =
                await client.api.digitale.bonLivraison.entreprise
                    .residence.$get({
                        query: {
                            en_no: en_no,
                        },
                    });

            if (!response.ok) {
                throw new Error("error when fetching entreprise residence");
            }

            return await response.json();
        },
    });

    return query;
};

export default useGetEntrepriseResidence;
