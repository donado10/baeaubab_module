import { create } from "zustand";
import { IEcritureEnteteLigne } from "../interface";

interface IEvent {
	jobId: string;
	status: string;
	ec_count: string;
	ec_total: string;
	id_toast_job: string;
}

interface IDialogEcritures {
	viewTable: [boolean, string];
}

export enum EStatus {
	ALL = "Tout",
	INTEGRE = "Intégré",
	VALIDE = "Valide",
	INVALIDE = "Invalide",
	ATTENTE = "Attente",
}
interface IFilter {
	status: EStatus;
}

interface IEcritureEnteteLigneState {
	items: IEcritureEnteteLigne;
	sourceEc: "sage" | "digital";
	periode: string[];
	event: IEvent | null;
	filter: IFilter | null;
	billCart: string[];
	dialog: IDialogEcritures;
	setDialogState: (dialogState: IDialogEcritures) => void;
	setAddBillCart: (bill: string) => void;
	setRemoveBillCart: (bill: string) => void;
	setAddAllBillCart: (bills: string[]) => void;
	setRemoveAllBillCart: () => void;
	setItems: (items: IEcritureEnteteLigne) => void;
	setEvent: (event: IEvent) => void;
	setFilter: (filter: IFilter) => void;
	setSourceEc: (source: "sage" | "digital") => void;
	setPeriode: (year: string, month: string) => void;

	clear: () => void;
}

export const useEcritureEnteteLigneStore = create<IEcritureEnteteLigneState>()(
	(set) => ({
		items: [],
		periode: [],
		billCart: [],
		event: null,
		sourceEc: "sage",
		dialog: { viewTable: [false, ""] },

		setDialogState: (dialogState: IDialogEcritures) =>
			set({ dialog: { ...dialogState } }),
		setItems: (items: IEcritureEnteteLigne) => set({ items: [...items] }),
		filter: { status: EStatus.ALL },
		setEvent: (event: IEvent) => set({ event: event }),
		setSourceEc: (source: "sage" | "digital") => set({ sourceEc: source }),
		setFilter: (filter: IFilter) => set({ filter: filter }),
		setAddBillCart: (bill: string) =>
			set((state) => ({ billCart: [...state.billCart, bill] })),
		setAddAllBillCart: (bills: string[]) =>
			set((state) => ({ billCart: [...bills] })),
		setRemoveAllBillCart: () => set((state) => ({ billCart: [] })),
		setRemoveBillCart: (bill: string) =>
			set((state) => ({ billCart: state.billCart.filter((b) => b !== bill) })),
		setPeriode: (year: string, month: string) =>
			set({ periode: [year, month] }),

		clear: () =>
			set({
				billCart: [],
				filter: null,
				items: [],
				event: null,
			}),
	})
);
