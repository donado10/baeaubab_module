import { create } from "zustand";
import { IDocumentFacture, IEntrepriseFacture } from "../interface";
import { persist, createJSONStorage } from "zustand/middleware";
import { se } from "date-fns/locale";
import { it } from "node:test";
import { getCurrentYearMonth } from "@/lib/utils";

interface IEvent {
	jobId: string;
	status: string;
	ec_count: string;
	ec_total: string;
	id_toast_job: string;
}

interface IDialogEcritures {
	viewTable: [boolean, string];
	viewTableCorrection: [boolean, string];
	checkEcriture: [boolean, string];
}

export enum EStatus {
	ALL = "Tout",
	VALID = 1,
	WAITING = 0,
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

interface IEntrepriseFactureState {
	items: IEntrepriseFacture[];
	itemsBL: IDocumentFacture[];
	periode: string[];
	event: IEvent | null;
	filter: IFilter;
	billCart: number[];
	dialog: IDialogEcritures;
	selectedFacture: IDocumentFacture | null;
	setSelectedFacture: (bl: IDocumentFacture | null) => void;
	setClearDialogState: () => void;
	setDialogState: (dialogState: IDialogEcritures) => void;
	setAddBillCart: (bill: number) => void;
	setRemoveBillCart: (bill: number) => void;
	setAddAllBillCart: (bills: number[]) => void;
	setRemoveAllBillCart: () => void;
	setItems: (items: IEntrepriseFacture[]) => void;
	setItemsBL: (items: IDocumentFacture[]) => void;
	setEvent: (event: IEvent) => void;
	setFilter: (filter: IFilter) => void;
	setPeriode: (year: string, month: string) => void;

	clear: () => void;
}

export const useEntrepriseFactureStore = create<IEntrepriseFactureState>()(
	persist(
		(set) => ({
			items: [],
			itemsBL: [],
			periode: [],
			billCart: [],
			event: null,
			dialog: {
				viewTable: [false, ""],
				viewTableCorrection: [false, ""],
				checkEcriture: [false, ""],
			},
			errors: [],
			filter: {
				status: EStatus.ALL,
				search: { type: "Intitule", value: "" },
				searchByBL: "",
				invalide: [],
				ecart_conformite: 0,
			},
			selectedFacture: null,
			setSelectedFacture: (bl: IDocumentFacture | null) => {
				set({ selectedFacture: bl });
			},
			setClearDialogState: () => {
				set({
					dialog: {
						viewTable: [false, ""],
						viewTableCorrection: [false, ""],
						checkEcriture: [false, ""],
					},
				});
			},
			setDialogState: (dialogState: IDialogEcritures) =>
				set({ dialog: { ...dialogState } }),
			setItems: (items: IEntrepriseFacture[]) => set({ items: [...items] }),
			setItemsBL: (items: IDocumentFacture[]) => set({ itemsBL: [...items] }),
			setEvent: (event: IEvent) => set({ event: event }),
			setFilter: (filter: IFilter) => set({ filter: filter }),
			setAddBillCart: (bill: number) =>
				set((state) => ({ billCart: [...state.billCart, bill] })),
			setAddAllBillCart: (bills: number[]) =>
				set((state) => ({ billCart: [...bills] })),
			setRemoveAllBillCart: () => set((state) => ({ billCart: [] })),
			setRemoveBillCart: (bill: number) =>
				set((state) => ({
					billCart: state.billCart.filter((b) => b !== bill),
				})),
			setPeriode: (year: string, month: string) =>
				set({ periode: [year, month] }),

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
			name: "facture-storage", // unique name
			storage: createJSONStorage(() => localStorage), // default
		}
	)
);
