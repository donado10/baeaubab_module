import { create } from "zustand";
import { IDocumentFacture, IEntrepriseFacture } from "../interface";
import { persist, createJSONStorage } from "zustand/middleware";
import { createBaseSlice } from "@/features/digitale/_shared/createBaseSlice";
import { EStatus, IBaseStore, IEvent } from "@/features/digitale/_shared/types";

// Re-export EStatus so existing imports keep working.
export { EStatus };

interface IDialogEcritures {
	viewTable: [boolean, string];
	viewTableCorrection: [boolean, string];
	checkEcriture: [boolean, string];
}
interface IFilter {
	status: EStatus;
	search: {
		type: "entreprise_id" | "Intitule";
		value: string;
	};
	searchByBL: string;
	ecart_conformite: number;
	invalide: string[];
}

interface IEntrepriseFactureState extends IBaseStore<number> {
	items: IEntrepriseFacture[];
	itemsBL: IDocumentFacture[];
	filter: IFilter;
	dialog: IDialogEcritures;
	selectedFacture: IDocumentFacture | null;
	setSelectedFacture: (bl: IDocumentFacture | null) => void;
	setClearDialogState: () => void;
	setDialogState: (dialogState: IDialogEcritures) => void;
	setItems: (items: IEntrepriseFacture[]) => void;
	setItemsBL: (items: IDocumentFacture[]) => void;
	setFilter: (filter: IFilter) => void;
	clear: () => void;
}

export const useEntrepriseFactureStore = create<IEntrepriseFactureState>()(
	persist(
		(set) => ({
			...createBaseSlice<number>(set),
			items: [],
			itemsBL: [],
			dialog: {
				viewTable: [false, ""],
				viewTableCorrection: [false, ""],
				checkEcriture: [false, ""],
			},
			filter: {
				status: EStatus.ALL,
				search: { type: "Intitule", value: "" },
				searchByBL: "",
				invalide: [],
				ecart_conformite: 0,
			},
			selectedFacture: null,
			setSelectedFacture: (bl: IDocumentFacture | null) =>
				set({ selectedFacture: bl }),
			setClearDialogState: () =>
				set({
					dialog: {
						viewTable: [false, ""],
						viewTableCorrection: [false, ""],
						checkEcriture: [false, ""],
					},
				}),
			setDialogState: (dialogState: IDialogEcritures) =>
				set({ dialog: { ...dialogState } }),
			setItems: (items: IEntrepriseFacture[]) => set({ items: [...items] }),
			setItemsBL: (items: IDocumentFacture[]) => set({ itemsBL: [...items] }),
			setFilter: (filter: IFilter) => set({ filter: filter }),
			clear: () =>
				set({
					billCart: [],
					itemsBL: [],
					selectedFacture: null,
					items: [],
					filter: {
						status: EStatus.ALL,
						searchByBL: "",
						search: { type: "Intitule", value: "" },
						invalide: [],
						ecart_conformite: 0,
					},
				}),
		}),
		{
			name: "facture-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
