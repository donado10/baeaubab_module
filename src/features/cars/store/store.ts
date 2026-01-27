import { create } from "zustand";
import { TCarSchema, TCarTableInfoSchema } from "../interface";

interface IFilter {
	availability: string | null;
	matricule: string | null;
}

interface ICarState {
	cars: TCarSchema[];
	setCars: (items: TCarSchema[]) => void;
	carTableInfo: TCarTableInfoSchema[];
	setCarTableInfo: (items: TCarTableInfoSchema[]) => void;
	filter: IFilter;
	setFilter: (filter: IFilter) => void;
	clear: () => void;
}

export const useCarStore = create<ICarState>()((set) => ({
	cars: [],
	carTableInfo: [],
	filter: { availability: null, matricule: null },
	setCars: (cars: TCarSchema[]) => set({ cars: [...cars] }),

	setCarTableInfo: (cars: TCarTableInfoSchema[]) =>
		set({
			carTableInfo: [...cars],
		}),
	setFilter: (filter: IFilter) => set({ filter: { ...filter } }),
	clear: () =>
		set({
			cars: [],
			carTableInfo: [],
			filter: { availability: null, matricule: null },
		}),
}));
