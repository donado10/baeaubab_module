import { create } from "zustand";
import { IDocumentBonLivraison, IEntrepriseBonLivraison } from "../interface";
import { persist, createJSONStorage } from "zustand/middleware";
import { getCurrentYearMonth } from "@/lib/utils";
import { createBaseSlice } from "@/features/digitale/_shared/createBaseSlice";
import { EStatus, IBaseStore } from "@/features/digitale/_shared/types";

// Re-export EStatus so existing imports (e.g. `import { EStatus } from "../store/store"`) keep working.
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

interface IEntrepriseBonLivraisonState extends IBaseStore {
	items: IEntrepriseBonLivraison[];
	itemsBL: IDocumentBonLivraison[];
	filter: IFilter;
	dialog: IDialogEcritures;
	selectedBonLivraison: IDocumentBonLivraison | null;
	setSelectedBonLivraison: (bl: IDocumentBonLivraison | null) => void;
	setClearDialogState: () => void;
	setDialogState: (dialogState: IDialogEcritures) => void;
	setRemoveBillCart: (bill: string) => void;
	setAddAllBillCart: (bills: string[]) => void;
	setItems: (items: IEntrepriseBonLivraison[]) => void;
	setItemsBL: (items: IDocumentBonLivraison[]) => void;
	setFilter: (filter: IFilter) => void;

	clear: () => void;
}

export const useEntrepriseBonLivraisonStore =
	create<IEntrepriseBonLivraisonState>()(
		persist(
			(set) => ({
				...createBaseSlice(set),
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
				setFilter: (filter: IFilter) => set({ filter: filter }),

				clear: () =>
					set({
						billCart: [],
						itemsBL: [],
						selectedBonLivraison: null,
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
				name: "bon-livraison-storage",
				storage: createJSONStorage(() => localStorage),
			},
		),
	);
