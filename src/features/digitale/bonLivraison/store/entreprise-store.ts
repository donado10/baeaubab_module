import { create } from "zustand";
import { IAgence, IDocumentBonLivraison, IEntreprise } from "../interface";
import { createBaseSlice } from "@/features/digitale/_shared/createBaseSlice";
import { EStatus, IBaseStore } from "@/features/digitale/_shared/types";

interface IAdjacent {
	previous: IEntreprise | null;
	current: IEntreprise | null;
	next: IEntreprise | null;
}

interface IFilter {
	status: EStatus;
	searchByBL: string;
}

interface IDocumentBonLivraisonState extends IBaseStore {
	entreprise: IEntreprise | null;
	agence: IAgence | null;
	adjacent: IAdjacent | null;
	documents: IDocumentBonLivraison[];
	selectedOption: boolean;
	filter: IFilter;
	selectedBonLivraison: IDocumentBonLivraison | null;
	cart: string[];
	setFilter: (filter: IFilter) => void;
	setSelectedBonLivraison: (bl: IDocumentBonLivraison | null) => void;
	setAdjacent: (adjacent: IAdjacent | null) => void;
	setAgence: (agence: IAgence | null) => void;
	setEntreprise: (entreprise: IEntreprise | null) => void;
	setDocuments: (documents: IDocumentBonLivraison[]) => void;
	setAddCart: (item: string) => void;
	setRemoveCart: (item: string) => void;
	setSelectedOption: (option: boolean) => void;
	clear: () => void;
}

export const useEntrepriseDetailStore = create<IDocumentBonLivraisonState>()(
	(set) => ({
		...createBaseSlice(set),
		documents: [],
		entreprise: null,
		cart: [],
		filter: {
			status: EStatus.ALL,
			searchByBL: "",
		},
		adjacent: null,
		agence: null,
		selectedBonLivraison: null,
		selectedOption: false,
		setSelectedBonLivraison: (bl: IDocumentBonLivraison | null) =>
			set({ selectedBonLivraison: bl }),
		setFilter: (filter: IFilter) => set({ filter: filter }),
		setAdjacent: (adjacent: IAdjacent | null) => set({ adjacent: adjacent }),
		setAgence: (agence: IAgence | null) => set({ agence: agence }),
		setEntreprise: (entreprise: IEntreprise | null) =>
			set({ entreprise: entreprise }),
		setDocuments: (documents: IDocumentBonLivraison[]) =>
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
	}),
);
