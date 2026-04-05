import { create } from "zustand";
import { IDocumentBonLivraison } from "../interface";
import { ID } from "node-appwrite";

interface IEvent {
	jobId: string;
	status: string;
	ec_count: string;
	ec_total: string;
	id_toast_job: string;
}

interface IDocumentBonLivraisonState {
	items: IDocumentBonLivraison[];
	selectedOption: boolean;
	event: IEvent | null;

	cart: string[];
	billCart: string[];
	setAddBillCart: (item: string) => void;
	setRemoveBillCart: (item: string) => void;
	setRemoveAllBillCart: () => void;
	setAddAllBillCart: (items: string[]) => void;
	setItems: (items: IDocumentBonLivraison[]) => void;
	setEvent: (event: IEvent) => void;
	setAddCart: (item: string) => void;
	setRemoveCart: (item: string) => void;
	setSelectedOption: (option: boolean) => void;

	clear: () => void;
}

export const useEntrepriseDetailStore = create<IDocumentBonLivraisonState>()(
	(set) => ({
		items: [],
		cart: [],
		event: null,
		billCart: [],
		setAddAllBillCart: (items: string[]) => set({ billCart: [...items] }),
		setRemoveAllBillCart: () => set({ billCart: [] }),
		setAddBillCart: (item: string) =>
			set((state) => ({ billCart: [...state.billCart, item] })),
		setRemoveBillCart: (item: string) =>
			set((state) => ({
				billCart: state.billCart.filter((cartItem) => cartItem !== item),
			})),
		setItems: (items: IDocumentBonLivraison[]) => set({ items: [...items] }),
		setAddCart: (item: string) =>
			set((state) => {
				return { cart: [...state.cart, item] };
			}),
		setRemoveCart: (item: string) =>
			set((state) => {
				return { cart: state.cart.filter((cartItem) => cartItem !== item) };
			}),
		selectedOption: false,
		setSelectedOption: (option: boolean) => set({ selectedOption: option }),
		setEvent: (event: IEvent) => set({ event: event }),

		clear: () =>
			set({
				items: [],
			}),
	})
);
