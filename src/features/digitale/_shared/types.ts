/** Shared types used across all digitale feature modules. */

export interface IEvent {
	jobId: string;
	status: string;
	ec_count: string;
	ec_total: string;
	id_toast_job: string;
}

export enum EStatus {
	ALL = "Tout",
	VALID = 1,
	WAITING = 0,
}

/**
 * Minimum store shape required by shared infrastructure (JobWatcher, etc.).
 * TCartItem defaults to string; use number for features like bills.
 */
export interface IBaseStore<TCartItem = string> {
	event: IEvent | null;
	billCart: TCartItem[];
	periode: string[];
	setEvent: (event: IEvent) => void;
	setAddBillCart: (item: TCartItem) => void;
	setRemoveBillCart: (item: TCartItem) => void;
	setAddAllBillCart: (items: TCartItem[]) => void;
	setRemoveAllBillCart: () => void;
	setPeriode: (year: string, month: string) => void;
}

/**
 * Concrete factory descriptor — one per feature module.
 * Wire this object from `config.ts` and pass it to shared components.
 */
export interface FeatureConfig {
	/** SSE endpoint prefix, e.g. "/api/digitale/bonLivraison/events/jobId" */
	sseEndpointPrefix: string;
	/** Zustand hook for the primary store */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	useStore: () => IBaseStore<any>;
}
