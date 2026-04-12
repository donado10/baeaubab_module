"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { ISearchResult } from "../types";
import { factureStrategy } from "../strategies/facture.strategy";

const useSearchFacture = (query: string, enabled: boolean) => {
	return useQuery<ISearchResult[]>({
		queryKey: ["search-facture", query],
		queryFn: async () => {
			const res = await client.api.search.facture.$get({
				query: { q: query },
			});
			if (!res.ok) throw new Error("Failed to search facture");
			const { results } = await res.json();
			return results.map(factureStrategy.formatResult);
		},
		enabled: enabled && query.trim().length >= 2,
		staleTime: 30_000,
	});
};

export default useSearchFacture;
