import { create } from "zustand";
import { IAgence, IDocumentFacture, IEntreprise } from "../interface";
import { createBaseSlice } from "@/features/digitale/_shared/createBaseSlice";
import { EStatus, IBaseStore } from "@/features/digitale/_shared/types";

interface IAdjacent {
	previous: IEntreprise | null;
	current: IEntreprise | null;
	next: IEntreprise | null;
}

interface IFilter {
	status: EStatus;
	searchByFacture: string;
}

interface IFactureDetailState extends IBaseStore {
	entreprise: IEntreprise | null;
	agence: IAgence | null;
	adjacent: IAdjacent | null;
	documents: IDocumentFacture[];
	selectedOption: boolean;
	filter: IFilter;
	selectedFacture: IDocumentFacture | null;
	cart: string[];
	setFilter: (filter: IFilter) => void;
	setSelectedFacture: (facture: IDocumentFacture | null) => void;
	setAdjacent: (adjacent: IAdjacent | null) => void;
	setAgence: (agence: IAgence | null) => void;
	setEntreprise: (entreprise: IEntreprise | null) => void;
	setDocuments: (documents: IDocumentFacture[]) => void;
	setAddCart: (item: string) => void;
	setRemoveCart: (item: string) => void;
	setSelectedOption: (option: boolean) => void;
	clear: () => void;
}

export const useEntrepriseDetailStore = create<IFactureDetailState>()(
	(set) => ({
		...createBaseSlice(set),
		documents: [],
		entreprise: null,
		cart: [],
		filter: {
			status: EStatus.ALL,
			searchByFacture: "",
		},
		adjacent: null,
		agence: null,
		selectedFacture: null,
		selectedOption: false,
		setSelectedFacture: (facture: IDocumentFacture | null) =>
			set({ selectedFacture: facture }),
		setFilter: (filter: IFilter) => set({ filter: filter }),
		setAdjacent: (adjacent: IAdjacent | null) => set({ adjacent: adjacent }),
		setAgence: (agence: IAgence | null) => set({ agence: agence }),
		setEntreprise: (entreprise: IEntreprise | null) =>
			set({ entreprise: entreprise }),
		setDocuments: (documents: IDocumentFacture[]) =>
			set({ documents: [...documents] }),
		setAddCart: (item: string) =>
			set((state) => ({ cart: [...state.cart, item] })),
		setRemoveCart: (item: string) =>
			set((state) => ({
				cart: state.cart.filter((cartItem) => cartItem !== item),
			})),
		setSelectedOption: (option: boolean) => set({ selectedOption: option }),

		clear: () =>
			set({
				documents: [],
				entreprise: null,
				cart: [],
				event: null,
				billCart: [],
				filter: {
					status: EStatus.ALL,
					searchByFacture: "",
				},
				adjacent: null,
				agence: null,
				selectedFacture: null,
				selectedOption: false,
			}),
	}),
);
