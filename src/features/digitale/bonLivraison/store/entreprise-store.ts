import { create } from "zustand";
import { IAgence, IDocumentBonLivraison, IEntreprise } from "../interface";
import { EStatus } from "./store";

interface IEvent {
	jobId: string;
	status: string;
	ec_count: string;
	ec_total: string;
	id_toast_job: string;
}

interface IAdjacent {
	previous: IEntreprise | null;
	current: IEntreprise | null;
	next: IEntreprise | null;
}

interface IFilter {
	status: EStatus;
	searchByBL: string;
}

interface IDocumentBonLivraisonState {
	entreprise: IEntreprise | null;
	agence: IAgence | null;
	adjacent: IAdjacent | null;
	documents: IDocumentBonLivraison[];
	selectedOption: boolean;
	event: IEvent | null;
	filter: IFilter;
	selectedBonLivraison: IDocumentBonLivraison | null;
	cart: string[];
	billCart: string[];
	periode: string[];
	setPeriode: (year: string, month: string) => void;
	setFilter: (filter: IFilter) => void;
	setSelectedBonLivraison: (bl: IDocumentBonLivraison | null) => void;

	setAdjacent: (adjacent: IAdjacent | null) => void;
	setAgence: (agence: IAgence | null) => void;
	setEntreprise: (entreprise: IEntreprise | null) => void;
	setAddBillCart: (item: string) => void;
	setRemoveBillCart: (item: string) => void;
	setRemoveAllBillCart: () => void;
	setAddAllBillCart: (documents: string[]) => void;
	setDocuments: (documents: IDocumentBonLivraison[]) => void;
	setEvent: (event: IEvent) => void;
	setAddCart: (item: string) => void;
	setRemoveCart: (item: string) => void;
	setSelectedOption: (option: boolean) => void;

	clear: () => void;
}

export const useEntrepriseDetailStore = create<IDocumentBonLivraisonState>()(
	(set) => ({
		documents: [],
		entreprise: null,
		cart: [],
		event: null,
		billCart: [],
		filter: {
			status: EStatus.ALL,
			searchByBL: "",
		},

		adjacent: null,
		agence: null,
		selectedBonLivraison: null,
		periode: [],
		setPeriode: (year: string, month: string) =>
			set({ periode: [year, month] }),
		setSelectedBonLivraison: (bl: IDocumentBonLivraison | null) =>
			set({ selectedBonLivraison: bl }),
		setFilter: (filter: IFilter) => set({ filter: filter }),
		setAdjacent: (adjacent: IAdjacent | null) => set({ adjacent: adjacent }),
		setAgence: (agence: IAgence | null) => set({ agence: agence }),
		setEntreprise: (entreprise: IEntreprise | null) =>
			set({ entreprise: entreprise }),
		setAddAllBillCart: (documents: string[]) =>
			set({ billCart: [...documents] }),
		setRemoveAllBillCart: () => set({ billCart: [] }),
		setAddBillCart: (item: string) =>
			set((state) => ({ billCart: [...state.billCart, item] })),
		setRemoveBillCart: (item: string) =>
			set((state) => ({
				billCart: state.billCart.filter((cartItem) => cartItem !== item),
			})),
		setDocuments: (documents: IDocumentBonLivraison[]) =>
			set({ documents: [...documents] }),
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
				documents: [],
				entreprise: null,
				cart: [],
				event: null,
				billCart: [],
				filter: {
					status: EStatus.ALL,
					searchByBL: "",
				},
				adjacent: null,
				agence: null,
				selectedBonLivraison: null,
				selectedOption: false,
			}),
	})
);
