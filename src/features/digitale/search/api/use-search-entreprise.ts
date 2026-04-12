"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { ISearchResult } from "../types";
import { entrepriseStrategy } from "../strategies/entreprise.strategy";

const useSearchEntreprise = (query: string, enabled: boolean) => {
	return useQuery<ISearchResult[]>({
		queryKey: ["search-entreprise", query],
		queryFn: async () => {
			const res = await client.api.search.entreprise.$get({
				query: { q: query },
			});
			if (!res.ok) throw new Error("Failed to search entreprise");
			const { results } = await res.json();
			return results.map(entrepriseStrategy.formatResult);
		},
		enabled: enabled && query.trim().length >= 2,
		staleTime: 30_000,
	});
};

export default useSearchEntreprise;
