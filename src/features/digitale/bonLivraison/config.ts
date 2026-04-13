/**
 * Concrete factory for the bonLivraison feature.
 *
 * This is the single file you write per feature module.
 * It wires domain-specific pieces (stores, SSE endpoint) into the
 * FeatureConfig shape that shared infrastructure components expect.
 *
 * To create a new feature (e.g. commandeClient), copy this file,
 * swap the imports, and you are done.
 */

import { useEntrepriseBonLivraisonStore } from "./store/store";
import { useEntrepriseDetailStore } from "./store/entreprise-store";
import type { FeatureConfig } from "../_shared/types";

export const bonLivraisonConfig = {
	sseEndpointPrefix: "/api/digitale/bonLivraison/events/jobId",
	useStore: useEntrepriseBonLivraisonStore,
} satisfies FeatureConfig;

export const bonLivraisonDetailConfig = {
	sseEndpointPrefix: "/api/digitale/bonLivraison/events/jobId",
	useStore: useEntrepriseDetailStore,
} satisfies FeatureConfig;
