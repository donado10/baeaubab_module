import { create } from "zustand";
import { IEcritureEnteteLigne } from "../interface";

interface IEvent {
	jobId: string;
	status: string;
	ec_count: string;
	ec_total: string;
	id_toast_job: string;
}

export enum EStatus {
	ALL = "Tout",
	INTEGRE = "Intégré",
	VALIDE = "Valide",
	INVALIDE = "Invalide",
	ATTENTE = "Attente",
}
interface IFilter {
	status: EStatus;
}

interface IEcritureEnteteLigneState {
	items: IEcritureEnteteLigne;
	periode: string[];
	event: IEvent | null;
	filter: IFilter;
	setItems: (items: IEcritureEnteteLigne) => void;
	setEvent: (event: IEvent) => void;
	setFilter: (filter: IFilter) => void;
	setPeriode: (year: string, month: string) => void;

	clear: () => void;
}

export const useEcritureEnteteLigneStore = create<IEcritureEnteteLigneState>()(
	(set) => ({
		items: [],
		periode: [],
		event: null,
		filter: { status: EStatus.ALL },
		setItems: (items: IEcritureEnteteLigne) => set({ items: [...items] }),
		setEvent: (event: IEvent) => set({ event: event }),
		setFilter: (filter: IFilter) => set({ filter: filter }),
		setPeriode: (year: string, month: string) =>
			set({ periode: [year, month] }),

		clear: () =>
			set({
				items: [],
				event: null,
			}),
	})
);
