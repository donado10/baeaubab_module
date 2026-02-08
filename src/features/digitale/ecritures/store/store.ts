import { create } from "zustand";
import { IEcritureEnteteLigne } from "../interface";

interface IEcritureEnteteLigneState {
	items: IEcritureEnteteLigne[];
	event: string;
	setItems: (items: IEcritureEnteteLigne[]) => void;
	setEvent: (event: string) => void;

	clear: () => void;
}

export const useEcritureEnteteLigneStore = create<IEcritureEnteteLigneState>()(
	(set) => ({
		items: [],
		event: "",
		setItems: (items: IEcritureEnteteLigne[]) => set({ items: [...items] }),
		setEvent: (event: string) => set({ event: event }),

		clear: () =>
			set({
				items: [],
			}),
	})
);
