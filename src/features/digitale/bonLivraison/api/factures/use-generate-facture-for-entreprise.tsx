"use client";

import { client } from "@/lib/rpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<
	(typeof client.api.facture.generateForEntreprise)["$post"]
>;
type ResponseType = InferResponseType<
	(typeof client.api.facture.generateForEntreprise)["$post"]
>;

const useGenerateFactureForEntreprise = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationKey: ["generate_facture_for_entreprise"],
		mutationFn: async ({ json }) => {
			const res = await client.api.facture.generateForEntreprise.$post({ json });

			if (!res.ok) {
				throw new Error("Failed to generate facture!");
			}

			const res_ = await res.json();

			return res_;
		},
		onSuccess: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ["get-bon-livraison-stats-by-company"] });
			queryClient.invalidateQueries({ queryKey: ["get-bon-livraison-stats"] });
		}
	});

	return mutation;
};

export default useGenerateFactureForEntreprise;
