import { SearchType, ISearchStrategy } from "../types";
import { bonLivraisonStrategy } from "./bon-livraison.strategy";
import { factureStrategy } from "./facture.strategy";
import { entrepriseStrategy } from "./entreprise.strategy";

/**
 * Central registry — the single source of truth for every search domain.
 * To add a new search type: create a strategy file, add it here.
 * Nothing else needs to change.
 */
const registry: Record<SearchType, ISearchStrategy> = {
	"bon-livraison": bonLivraisonStrategy,
	facture: factureStrategy,
	entreprise: entrepriseStrategy,
};

export class SearchStrategyFactory {
	/** Returns the strategy for the given type. */
	static create(type: SearchType): ISearchStrategy {
		return registry[type];
	}

	/** Returns all strategies in registration order (used to render tabs). */
	static all(): ISearchStrategy[] {
		return Object.values(registry);
	}
}
