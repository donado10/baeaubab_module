import { create } from "zustand";
import { IEcritureEnteteLigne } from "../interface";

interface IEvent {
	jobId: string;
	status: string;
	ec_count: string;
	ec_total: string;
}

interface IEcritureEnteteLigneState {
	items: IEcritureEnteteLigne[];
	periode: string[];
	event: IEvent | null;
	setItems: (items: IEcritureEnteteLigne[]) => void;
	setEvent: (event: IEvent) => void;
	setPeriode: (year: string, month: string) => void;

	clear: () => void;
}

export const useEcritureEnteteLigneStore = create<IEcritureEnteteLigneState>()(
	(set) => ({
		items: [],
		periode: [],
		event: null,
		setItems: (items: IEcritureEnteteLigne[]) => set({ items: [...items] }),
		setEvent: (event: IEvent) => set({ event: event }),
		setPeriode: (year: string, month: string) =>
			set({ periode: [year, month] }),

		clear: () =>
			set({
				items: [],
				event: null,
			}),
	})
);
