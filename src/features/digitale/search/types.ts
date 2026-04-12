import { ComponentType } from "react";

export type SearchType = "bon-livraison" | "facture" | "entreprise";

export interface ISearchResult {
	id: string;
	label: string;
	sublabel: string;
	badge?: string;
	amount?: number;
	href: string;
}

/**
 * A Search Strategy encapsulates everything about one search domain:
 * its label, icon, input placeholder, how to transform a raw API result,
 * and how to build the navigation href.
 *
 * The factory creates strategy instances; callers never instantiate them
 * directly, which means adding a new search type only requires registering
 * a new strategy — the UI is untouched.
 */
export interface ISearchStrategy {
	type: SearchType;
	label: string;
	placeholder: string;
	Icon: ComponentType<{ className?: string }>;
	formatResult: (raw: any) => ISearchResult;
}
