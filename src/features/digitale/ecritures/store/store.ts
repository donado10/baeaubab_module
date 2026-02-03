import { create } from "zustand";
import { IEcritureEnteteLigne } from "../interface";

interface IEcritureEnteteLigneState {
	items: IEcritureEnteteLigne[];
	setItems: (items: IEcritureEnteteLigne[]) => void;

	clear: () => void;
}

export const useEcritureEnteteLigneStore = create<IEcritureEnteteLigneState>()(
	(set) => ({
		items: [],
		setItems: (items: IEcritureEnteteLigne[]) => set({ items: [...items] }),

		clear: () =>
			set({
				items: [],
			}),
	})
);
