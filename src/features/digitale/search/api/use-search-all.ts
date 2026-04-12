"use client";

import { SearchType } from "../types";
import useSearchBonLivraison from "./use-search-bon-livraison";
import useSearchFacture from "./use-search-facture";
import useSearchEntreprise from "./use-search-entreprise";

/**
 * Runs all three queries simultaneously (satisfying React's rules of hooks —
 * hooks must never be called conditionally). Only the active strategy's query
 * has `enabled: true`; the others stay idle.
 *
 * Returns the query result for whichever type is currently active.
 */
const useSearchAll = (type: SearchType, query: string) => {
	const bl = useSearchBonLivraison(query, type === "bon-livraison");
	const facture = useSearchFacture(query, type === "facture");
	const entreprise = useSearchEntreprise(query, type === "entreprise");

	const results = {
		"bon-livraison": bl,
		facture: facture,
		entreprise: entreprise,
	} as const;

	return results[type];
};

export default useSearchAll;
