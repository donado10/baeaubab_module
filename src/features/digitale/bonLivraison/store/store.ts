import { create } from "zustand";
import { IDocumentBonLivraison, IEntrepriseBonLivraison } from "../interface";
import { persist, createJSONStorage } from "zustand/middleware";

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
	EXONORE = 2,
	TAXABLE = 1,
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

interface IEntrepriseBonLivraisonState {
	items: IEntrepriseBonLivraison[];
	itemsBL: IDocumentBonLivraison[];
	periode: string[];
	event: IEvent | null;
	filter: IFilter;
	billCart: number[];
	dialog: IDialogEcritures;
	selectedBonLivraison: IDocumentBonLivraison | null;
	setSelectedBonLivraison: (bl: IDocumentBonLivraison | null) => void;
	setClearDialogState: () => void;
	setDialogState: (dialogState: IDialogEcritures) => void;
	setAddBillCart: (bill: number) => void;
	setRemoveBillCart: (bill: number) => void;
	setAddAllBillCart: (bills: number[]) => void;
	setRemoveAllBillCart: () => void;
	setItems: (items: IEntrepriseBonLivraison[]) => void;
	setItemsBL: (items: IDocumentBonLivraison[]) => void;
	setEvent: (event: IEvent) => void;
	setFilter: (filter: IFilter) => void;
	setPeriode: (year: string, month: string) => void;

	clear: () => void;
}

export const useEntrepriseBonLivraisonStore =
	create<IEntrepriseBonLivraisonState>()(
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
				selectedBonLivraison: null,
				setSelectedBonLivraison: (bl: IDocumentBonLivraison | null) => {
					set({ selectedBonLivraison: bl });
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
				setItems: (items: IEntrepriseBonLivraison[]) =>
					set({ items: [...items] }),
				setItemsBL: (items: IDocumentBonLivraison[]) =>
					set({ itemsBL: [...items] }),
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
						selectedBonLivraison: null,

						filter: {
							status: EStatus.ALL,
							search: { type: "Intitule", value: "" },
							invalide: [],
							ecart_conformite: 0,
						},
					}),
			}),
			{
				name: "bon-livraison-storage", // unique name
				storage: createJSONStorage(() => localStorage), // default
			}
		)
	);
