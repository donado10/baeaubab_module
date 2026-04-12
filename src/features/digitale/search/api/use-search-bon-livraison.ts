"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { ISearchResult } from "../types";
import { bonLivraisonStrategy } from "../strategies/bon-livraison.strategy";

const useSearchBonLivraison = (query: string, enabled: boolean) => {
	return useQuery<ISearchResult[]>({
		queryKey: ["search-bon-livraison", query],
		queryFn: async () => {
			const res = await client.api.search["bon-livraison"].$get({
				query: { q: query },
			});
			if (!res.ok) throw new Error("Failed to search bon de livraison");
			const { results } = await res.json();
			return results.map(bonLivraisonStrategy.formatResult);
		},
		enabled: enabled && query.trim().length >= 2,
		staleTime: 30_000,
	});
};

export default useSearchBonLivraison;
