/**
 * Concrete factory for the bills (factures) feature.
 *
 * To create a new feature, copy this file, swap the imports, and you are done.
 */

import { useEntrepriseFactureStore } from "./store/store";
import type { FeatureConfig } from "../_shared/types";

export const billsConfig = {
	sseEndpointPrefix: "/api/digitale/facture/events/jobId",
	useStore: useEntrepriseFactureStore,
} satisfies FeatureConfig;
