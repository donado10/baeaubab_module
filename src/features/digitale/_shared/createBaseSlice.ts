import type { IBaseStore, IEvent } from "./types";

/**
 * Returns the shared state slice (event, billCart, periode) and its actions.
 * Spread this inside your Zustand store initializer so every feature store
 * gets the same baseline without copy-pasting.
 *
 * TCartItem defaults to string; pass number for features where billCart
 * items are numeric (e.g. bills/factures).
 *
 * @example
 * create<IMyState>()((set) => ({
 *   ...createBaseSlice(set),        // string cart (default)
 *   ...createBaseSlice<number>(set), // number cart
 * }))
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createBaseSlice<TCartItem = string>(
	set: (fn: any) => void,
): IBaseStore<TCartItem> {
	return {
		event: null,
		billCart: [] as TCartItem[],
		periode: [],
		setEvent: (event: IEvent) => set({ event }),
		setAddBillCart: (item: TCartItem) =>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			set((state: any) => ({ billCart: [...state.billCart, item] })),
		setRemoveBillCart: (item: TCartItem) =>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			set((state: any) => ({
				billCart: state.billCart.filter((b: TCartItem) => b !== item),
			})),
		setAddAllBillCart: (items: TCartItem[]) => set({ billCart: items }),
		setRemoveAllBillCart: () => set({ billCart: [] }),
		setPeriode: (year: string, month: string) =>
			set({ periode: [year, month] }),
	};
}
