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
	event: IEvent | null;
	setItems: (items: IEcritureEnteteLigne[]) => void;
	setEvent: (event: IEvent) => void;

	clear: () => void;
}

export const useEcritureEnteteLigneStore = create<IEcritureEnteteLigneState>()(
	(set) => ({
		items: [],
		event: null,
		setItems: (items: IEcritureEnteteLigne[]) => set({ items: [...items] }),
		setEvent: (event: IEvent) => set({ event: event }),

		clear: () =>
			set({
				items: [],
				event: null,
			}),
	})
);
